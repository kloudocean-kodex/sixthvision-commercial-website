#!/usr/bin/env python3
"""
SIXTH VISION COMMERCIAL — BUILD
================================================================================
Produces dist/ from src/ + static/. dist/ is what Cloudflare Pages serves.

Run:  python3 build.py

WHY THIS EXISTS
---------------
v254 shipped the repo root directly. That had two consequences:

  1. The six unbundled chapter stylesheets (67 KB) were published to the CDN and
     never loaded by anything. Worse, editing one of them changed nothing,
     because index.html loads the concatenated app.css — a silent trap.

  2. app.css was hand-maintained alongside its own source modules, and had
     drifted: it contained a seventh module ("enterprise-cro-additions") whose
     source file was missing from the repo entirely. Every rule for the floating
     CTA, the brief modal and the brief form lived ONLY in the built file.
     Regenerating the bundle from the known sources would have silently stripped
     the styling from the whole lead-capture UI.

Now src/ is the single source of truth, app.css is generated, and dist/ is
disposable. Edit src/. Never edit dist/.

CACHE BUSTING
-------------
_headers marks /assets/* immutable for one year. That is only safe if the URL
changes whenever the bytes change. v254 relied on hand-bumping "?v=254" and its
own comment warned that forgetting would pin stale assets for a year. This build
replaces the __HASH_*__ tokens in the HTML with a short content hash of the
built file, so the URL cannot drift out of sync with the bytes.

MINIFICATION
------------
Deliberately conservative. No npm packages are available in this environment and
a homemade aggressive minifier on a 91 KB stylesheet full of nested color-mix()
is a bad trade: the transfer saving after Brotli is ~8 KB, and the downside is a
silently broken design system. So: comments and indentation go, token structure
does not. Source comments are never touched — they are the best documentation in
this codebase.
================================================================================
"""
import hashlib
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
STATIC = ROOT / "static"
DIST = ROOT / "dist"

# Order matters: system.css defines the design tokens every chapter derives from.
CSS_MODULES = [
    "system.css",
    "chapter-i.css",
    "chapter-ii.css",
    "chapter-iii.css",
    "chapter-iv.css",
    "chapter-v.css",
    "enterprise-cro-additions.css",
]


# ---------------------------------------------------------------- minifiers --
def minify_css(css: str) -> str:
    """Comment + whitespace stripping that respects strings and url() tokens.

    Intentionally does NOT touch spacing inside values. calc(100% - 2px) needs
    its spaces to parse, and color-mix(in oklab, a 50%, b) is full of commas
    that a naive regex would happily corrupt.
    """
    out, i, n = [], 0, len(css)
    while i < n:
        c = css[i]
        if c in "\"'":  # string literal — copy verbatim
            q = c
            j = i + 1
            while j < n:
                if css[j] == "\\":
                    j += 2
                    continue
                if css[j] == q:
                    break
                j += 1
            out.append(css[i:j + 1])
            i = j + 1
        elif c == "/" and i + 1 < n and css[i + 1] == "*":
            j = css.find("*/", i + 2)
            i = n if j == -1 else j + 2
        else:
            out.append(c)
            i += 1
    s = "".join(out)

    s = re.sub(r"[ \t]*\r?\n[ \t]*", "\n", s)   # kill indentation
    s = re.sub(r"\n{2,}", "\n", s)               # collapse blank lines
    # ONLY these four are safe to tighten around.
    #   '(' and ')' are NOT: a space after ')' is a descendant combinator, so
    #   ":nth-child(1) .win" would silently collapse into ":nth-child(1).win",
    #   a completely different selector. (This bit us on .work__pair--a.)
    #   '>' '~' '+' are NOT: '+' is also arithmetic, and this stylesheet builds
    #   the entire light engine on calc(1 + var(--sun)) / calc(1 - var(--sun)).
    #   Tightening it emits calc(1+var(--sun)), which is invalid CSS and would
    #   take the whole --sun system down.
    #   Newlines are joined with a SPACE, never with nothing. A multi-line
    #   value like
    #       filter:saturate(...)
    #              sepia(...)
    #   is a SPACE-SEPARATED function list; joining with "" produces
    #   "saturate(...)sepia(...)", which is invalid CSS and silently kills the
    #   whole --sun photo grading. Tighten structure AFTER joining.
    s = re.sub(r"[ \t]*\n[ \t]*", " ", s)        # join lines WITH a space
    s = re.sub(r"[ \t]+", " ", s)                 # runs of spaces -> one
    s = re.sub(r"\s*([{};,])\s*", r"\1", s)      # tighten structure
    s = re.sub(r";\}", "}", s)                   # drop final semicolons
    return s.strip()


def minify_js(js: str) -> str:
    """Strip comments and indentation only. Never renames or reorders anything.

    String-, template- and regex-aware, because `a / b` and `/regex/` are
    indistinguishable without tracking the previous significant token.
    """
    out, i, n = [], 0, len(js)
    prev = ""
    while i < n:
        c = js[i]
        if c in "\"'`":
            q = c
            j = i + 1
            while j < n:
                if js[j] == "\\":
                    j += 2
                    continue
                if js[j] == q:
                    break
                if q == "`" and js[j] == "$" and j + 1 < n and js[j + 1] == "{":
                    depth, k = 1, j + 2
                    while k < n and depth:
                        if js[k] == "{":
                            depth += 1
                        elif js[k] == "}":
                            depth -= 1
                        k += 1
                    j = k - 1
                j += 1
            out.append(js[i:j + 1])
            prev = q
            i = j + 1
        elif c == "/" and i + 1 < n and js[i + 1] == "/":
            j = js.find("\n", i)
            i = n if j == -1 else j
        elif c == "/" and i + 1 < n and js[i + 1] == "*":
            j = js.find("*/", i + 2)
            i = n if j == -1 else j + 2
        elif c == "/" and prev not in ")]}" and not prev.isalnum() and prev not in "_$":
            # regex literal
            j = i + 1
            inclass = False
            while j < n:
                if js[j] == "\\":
                    j += 2
                    continue
                if js[j] == "[":
                    inclass = True
                elif js[j] == "]":
                    inclass = False
                elif js[j] == "/" and not inclass:
                    break
                j += 1
            while j + 1 < n and js[j + 1].isalpha():
                j += 1
            out.append(js[i:j + 1])
            prev = "/"
            i = j + 1
        else:
            out.append(c)
            if not c.isspace():
                prev = c
            i += 1
    s = "".join(out)
    s = re.sub(r"[ \t]*\r?\n[ \t]*", "\n", s)
    s = re.sub(r"\n{2,}", "\n", s)
    return s.strip()


def minify_html(html: str) -> str:
    """Remove HTML comments and trailing indentation. Whitespace BETWEEN inline
    elements is left alone — collapsing it changes rendered text, and this page
    is full of <span> sequences where that would be visible."""
    # Preserve conditional comments and the ld+json / script blocks untouched.
    html = re.sub(r"<!--(?!\[if)(?!<!)[\s\S]*?-->", "", html)
    html = re.sub(r"[ \t]+\r?\n", "\n", html)
    html = re.sub(r"\n{3,}", "\n\n", html)
    return html.strip() + "\n"


def short_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:10]


# -------------------------------------------------------------------- build --
def main() -> int:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    # 1. static passthrough
    for item in STATIC.iterdir():
        dest = DIST / item.name
        if item.is_dir():
            shutil.copytree(item, dest)
        else:
            shutil.copy2(item, dest)

    css_dir = DIST / "assets" / "css"
    js_dir = DIST / "assets" / "js"
    css_dir.mkdir(parents=True, exist_ok=True)
    js_dir.mkdir(parents=True, exist_ok=True)

    # 2. CSS bundle
    parts, raw_total = [], 0
    for mod in CSS_MODULES:
        p = SRC / "css" / mod
        if not p.exists():
            print(f"  FATAL: missing CSS module {mod}", file=sys.stderr)
            return 1
        text = p.read_text(encoding="utf-8")
        raw_total += len(text.encode())
        parts.append(f"/* --- MODULE: {mod} --- */\n{text}")
    bundle = "/* SIXTH VISION COMMERCIAL — generated by build.py. DO NOT EDIT. */\n" + "\n".join(parts)
    app_min = minify_css(bundle)
    (css_dir / "app.css").write_text(app_min, encoding="utf-8")
    h_css = short_hash(app_min.encode())

    sys_min = minify_css((SRC / "css" / "system.css").read_text(encoding="utf-8"))
    (css_dir / "system.css").write_text(sys_min, encoding="utf-8")
    h_sys = short_hash(sys_min.encode())

    # 3. JS
    js_src = (SRC / "js" / "light.js").read_text(encoding="utf-8")
    js_min = minify_js(js_src)
    (js_dir / "light.js").write_text(js_min, encoding="utf-8")
    h_js = short_hash(js_min.encode())

    # 4. Video hash — one token covers the whole set; any re-encode changes it.
    vid_dir = DIST / "assets" / "video"
    vh = hashlib.sha256()
    for f in sorted(vid_dir.glob("*")):
        vh.update(f.read_bytes())
    h_vid = vh.hexdigest()[:10]

    # 5. HTML
    for name, subs in (
        ("index.html", {"__HASH_CSS__": h_css, "__HASH_JS__": h_js, "__HASH_VID__": h_vid}),
        ("404.html", {"__HASH_SYS__": h_sys}),
    ):
        html = (SRC / name).read_text(encoding="utf-8")
        for token, val in subs.items():
            html = html.replace(token, val)
        html = minify_html(html)
        if "__HASH" in html:
            print(f"  FATAL: unreplaced hash token left in {name}", file=sys.stderr)
            return 1
        (DIST / name).write_text(html, encoding="utf-8")

    # 6. Report
    def kb(x):
        return f"{x/1024:8.1f} KB"

    print("BUILD OK -> dist/")
    print(f"  app.css      {kb(raw_total)} source ({len(CSS_MODULES)} modules) -> {kb(len(app_min.encode()))} minified   ?v={h_css}")
    print(f"  system.css   {kb(len(sys_min.encode()))} minified   ?v={h_sys}")
    print(f"  light.js     {kb(len(js_src.encode()))} source -> {kb(len(js_min.encode()))} minified   ?v={h_js}")
    print(f"  video set    ?v={h_vid}")
    total = sum(f.stat().st_size for f in DIST.rglob("*") if f.is_file())
    print(f"  dist total   {kb(total)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
