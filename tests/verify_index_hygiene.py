#!/usr/bin/env python3
"""Fail CI when Commercial deploy output shows index-contamination indicators.

This is intentionally narrow. It audits only the built public surface and does
not treat documentation, source comments, or historical redirect notes as
malicious content. The goal is to prevent an old CMS/spam footprint from being
reintroduced into the static Cloudflare deployment without creating false
positives in the repository itself.
"""
from __future__ import annotations

import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
CANONICAL_HOST = "sixthvisioncommercial.com.au"

# These terms are high-signal for the specific legacy-index concern raised in
# September 2026. Scan only public HTML/JS/CSS, never docs or redirect comments.
FORBIDDEN_PUBLIC_TERMS = (
    "chicken road",
    "online casino",
    "casino bonus",
    "gokken",
    "gambling",
    "trinocasino",
    "anabolika",
    "chijrev6j7bd1mordzor5gar2y",
    "318 little lonsdale",
)

# Search Console confirmed historical spam/WordPress archive URLs under these
# surfaces. They must fall through to a genuine not-found response, never 301
# to the homepage or another indexable commercial page.
FORBIDDEN_REDIRECT_SOURCES = (
    "/wp-admin/",
    "/wp-login.php",
    "/category/",
    "/tag/",
    "/author/",
    "/feed",
    "/wp-content/",
    "/wp-includes/",
)


def fail(message: str, failures: list[str]) -> None:
    failures.append(message)


def main() -> int:
    failures: list[str] = []

    if not DIST.exists():
        print("FAIL: dist/ does not exist; build the deployable output first", file=sys.stderr)
        return 1

    files = [p for p in DIST.rglob("*") if p.is_file()]

    # Current production is a static build. WordPress/PHP runtime files appearing
    # in deploy output are unexpected and require explicit review.
    for path in files:
        rel = path.relative_to(DIST).as_posix().lower()
        name = path.name.lower()
        if path.suffix.lower() == ".php":
            fail(f"unexpected PHP file in deploy output: {rel}", failures)
        if any(part.startswith("wp-") for part in Path(rel).parts):
            fail(f"unexpected WordPress-style deploy path: {rel}", failures)
        if name in {"xmlrpc.php", "wp-config.php"}:
            fail(f"unexpected WordPress runtime file: {rel}", failures)

    # Scan only public text assets that browsers/crawlers can consume as content.
    for path in files:
        if path.suffix.lower() not in {".html", ".js", ".css"}:
            continue
        try:
            text = path.read_text(encoding="utf-8", errors="ignore").lower()
        except OSError as exc:
            fail(f"could not read {path.relative_to(DIST)}: {exc}", failures)
            continue
        for term in FORBIDDEN_PUBLIC_TERMS:
            if term in text:
                fail(f"high-risk spam term {term!r} found in {path.relative_to(DIST)}", failures)


    redirects = DIST / "_redirects"
    if redirects.exists():
        redirect_text = redirects.read_text(encoding="utf-8", errors="ignore")
        for source in FORBIDDEN_REDIRECT_SOURCES:
            for line in redirect_text.splitlines():
                stripped = line.strip()
                if not stripped or stripped.startswith("#"):
                    continue
                if stripped.startswith(source):
                    fail(
                        f"legacy spam/archive surface must 404 instead of redirecting: {stripped}",
                        failures,
                    )

    sitemap = DIST / "sitemap.xml"
    if not sitemap.exists():
        fail("missing dist/sitemap.xml", failures)
    else:
        try:
            root = ET.parse(sitemap).getroot()
        except Exception as exc:
            fail(f"invalid sitemap.xml: {exc}", failures)
        else:
            page_urls: list[str] = []
            for url_node in root:
                if not url_node.tag.endswith("url"):
                    continue
                for child in url_node:
                    if child.tag.endswith("loc") and child.text:
                        page_urls.append(child.text.strip())
                        break
            if not page_urls:
                fail("sitemap contains no page URLs", failures)
            for url in page_urls:
                parsed = urlparse(url)
                if parsed.scheme != "https" or parsed.netloc != CANONICAL_HOST:
                    fail(f"sitemap URL escapes canonical host: {url}", failures)
            # Explicitly approved indexable surface. New URLs must be added here
            # only when they have their own canonical page, unique proof/content,
            # sitemap entry and search-quality review.
            approved = {
                f"https://{CANONICAL_HOST}/",
                f"https://{CANONICAL_HOST}/commercial-property-photography-melbourne/",
                f"https://{CANONICAL_HOST}/construction-photography-melbourne/",
                f"https://{CANONICAL_HOST}/precision-floor-plans/",
                f"https://{CANONICAL_HOST}/work/lara-land-development-site-mapping/",
                f"https://{CANONICAL_HOST}/work/cremorne-commercial-floor-plan/",
                f"https://{CANONICAL_HOST}/work/williamstown-industrial-site-mapping/",
                f"https://{CANONICAL_HOST}/work/maidstone-industrial-amenity-mapping/",
            }
            unexpected = sorted(set(page_urls) - approved)
            if unexpected:
                fail("unexpected new indexable sitemap URL(s): " + ", ".join(unexpected), failures)

    if failures:
        for item in failures:
            print(f"FAIL: {item}", file=sys.stderr)
        return 1

    print(
        "Index hygiene verified: static deploy surface contains no WordPress/PHP runtime, "
        "no targeted spam indicators, and no unapproved sitemap URLs."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
