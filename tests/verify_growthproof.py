#!/usr/bin/env python3
"""Zero-dependency regression gates for Sixth Vision GrowthProof."""
from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def must(text: str, needle: str, label: str) -> None:
    if needle not in text:
        raise AssertionError(f"Missing {label}: {needle}")


def main() -> None:
    source_html = (ROOT / "src" / "index.html").read_text(encoding="utf-8")
    source_js = (ROOT / "src" / "js" / "light.js").read_text(encoding="utf-8")
    dist_html = (ROOT / "dist" / "index.html").read_text(encoding="utf-8")
    dist_js = (ROOT / "dist" / "assets" / "js" / "light.js").read_text(encoding="utf-8")
    redirects = (ROOT / "static" / "_redirects").read_text(encoding="utf-8")
    sitemap_path = ROOT / "static" / "sitemap.xml"

    # Production measurement identity and lead transport.
    must(source_html, "G-EHCPLDXEK6", "GA4 measurement ID")
    must(source_html, "https://api.web3forms.com/submit", "Web3Forms endpoint")
    must(source_js, "GROWTHPROOF-MEASUREMENT-V1", "GrowthProof measurement marker")

    for event_name in (
        "phone_click",
        "email_click",
        "whatsapp_click",
        "open_brief_modal",
        "generate_lead",
        "brief_submit_failed",
    ):
        must(source_js, event_name, f"event {event_name}")
        must(dist_js, event_name, f"built event {event_name}")

    for field in (
        "lead_id",
        "landing_path",
        "referrer_path",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "gclid",
        "msclkid",
        "submitted_at",
    ):
        must(source_js, field, f"attribution field {field}")

    # Do not regress the crucial rule: generate_lead fires only inside the
    # confirmed-success branch, after data.success === true has been checked.
    success_check = source_js.find("data.success !== true")
    lead_event = source_js.find("gpEvent('generate_lead'")
    if success_check < 0 or lead_event < 0 or lead_event <= success_check:
        raise AssertionError("generate_lead must remain after Web3Forms success verification")

    # Inspect exactly the GA4 generate_lead call, not neighbouring UI copy.
    lead_end = source_js.find("\n          });", lead_event)
    if lead_end < 0:
        raise AssertionError("Could not determine the end of the generate_lead GA4 block")
    lead_block = source_js[lead_event : lead_end + len("\n          });")]
    forbidden = ("brief-name", "brief-email", "name=\"name\"", "agency", "message")
    for token in forbidden:
        if token in lead_block:
            raise AssertionError(f"PII-like form field leaked into GA4 lead block: {token}")

    # Built HTML must reference the generated hashed JS, not an unhashed stale file.
    if not re.search(r"assets/js/light\.js\?v=[0-9a-f]{8,}", dist_html):
        raise AssertionError("Built HTML does not contain a content-hashed light.js URL")

    # Legacy WordPress surface stays neutralised without redirecting the homepage.
    must(redirects, "/wp-login.php", "legacy WP login redirect")
    if re.search(r"^/\s+/\s+301", redirects, re.MULTILINE):
        raise AssertionError("Root-path redirect loop regression detected")

    # Sitemap remains valid XML and the canonical site entry remains present.
    tree = ET.parse(sitemap_path)
    xml_text = ET.tostring(tree.getroot(), encoding="unicode")
    must(xml_text, "https://sixthvisioncommercial.com.au/", "canonical sitemap URL")

    # Known historical spam slug must never enter the current source/build.
    spam_fragment = "kruis-een-gevaarlijke-wegen-vol-temperaturen-in-de"
    for path, text in (("source HTML", source_html), ("source JS", source_js), ("dist HTML", dist_html)):
        if spam_fragment in text:
            raise AssertionError(f"Historical spam slug present in {path}")

    print("GrowthProof verification passed.")


if __name__ == "__main__":
    main()
