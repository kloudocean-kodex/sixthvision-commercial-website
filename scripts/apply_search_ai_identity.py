import json
import re
from pathlib import Path

INDEX = Path("src/index.html")
ABN_DISPLAY = "92 625 744 630"
ABN_COMPACT = "92625744630"
LEGAL_NAME = "SIXTH VISION PTY LTD"
ISO6523_ABN = f"0151:{ABN_COMPACT}"

JSONLD_RE = re.compile(r'(<script type="application/ld\+json">\s*)(.*?)(\s*</script>)', re.S)
FAQ_RE = re.compile(
    r'\n<!-- FAQ schema.*?-->\s*<script type="application/ld\+json">\s*\{.*?"@type"\s*:\s*"FAQPage".*?</script>\s*',
    re.S,
)


def patch_primary_entity(text: str) -> str:
    matches = list(JSONLD_RE.finditer(text))
    if not matches:
        raise SystemExit("No JSON-LD block found")

    first = matches[0]
    try:
        data = json.loads(first.group(2))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Primary JSON-LD is invalid before patch: {exc}") from exc

    if not isinstance(data, dict) or data.get("name") != "Sixth Vision Commercial":
        raise SystemExit("Unexpected primary JSON-LD entity")

    data["legalName"] = LEGAL_NAME
    data["iso6523Code"] = ISO6523_ABN

    # These are genuine visible testimonials, but Google explicitly treats
    # Organization/LocalBusiness review markup controlled by the reviewed entity
    # as self-serving and ineligible for review snippets. Keep the testimonials
    # visible for humans; remove only the self-serving review structured data.
    data.pop("review", None)

    encoded = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    return text[: first.start()] + first.group(1) + encoded + first.group(3) + text[first.end() :]


def remove_invisible_faq_schema(text: str) -> str:
    if '"@type":"FAQPage"' not in text and '"@type": "FAQPage"' not in text:
        return text
    updated, count = FAQ_RE.subn("\n", text, count=1)
    if count != 1:
        raise SystemExit(f"Expected one FAQPage schema block, removed {count}")
    return updated


def patch_footer(text: str) -> str:
    if f"ABN {ABN_DISPLAY}" in text:
        return text
    old = (
        '  <div class="footer__legal">\n'
        '    <span>Crafted by <a href="https://proddyg.com" target="_blank" rel="noopener">ProddyG</a></span>\n'
        '    <span>&copy; <span id="yr">2026</span> Sixth Vision Commercial. All rights reserved.</span>\n'
        '  </div>'
    )
    new = (
        '  <div class="footer__legal">\n'
        '    <span>Crafted by <a href="https://proddyg.com" target="_blank" rel="noopener">ProddyG</a></span>\n'
        f'    <span>{LEGAL_NAME} &middot; ABN {ABN_DISPLAY}</span>\n'
        '    <span>&copy; <span id="yr">2026</span> Sixth Vision Commercial. All rights reserved.</span>\n'
        '  </div>'
    )
    if text.count(old) != 1:
        raise SystemExit(f"Commercial footer marker mismatch: found {text.count(old)}")
    return text.replace(old, new, 1)


def validate_json_ld(text: str) -> None:
    blocks = JSONLD_RE.findall(text)
    if not blocks:
        raise SystemExit("No JSON-LD after patch")
    for i, (_, payload, _) in enumerate(blocks, 1):
        try:
            json.loads(payload)
        except json.JSONDecodeError as exc:
            raise SystemExit(f"JSON-LD block {i} invalid after patch: {exc}") from exc


def validate(text: str) -> None:
    required = [
        f'"legalName":"{LEGAL_NAME}"',
        f'"iso6523Code":"{ISO6523_ABN}"',
        f"ABN {ABN_DISPLAY}",
        "https://sixthvision.com.au/",
    ]
    missing = [value for value in required if value not in text]
    if missing:
        raise SystemExit("Validation failed; missing: " + ", ".join(missing))
    if '"@type":"FAQPage"' in text or '"@type": "FAQPage"' in text:
        raise SystemExit("FAQPage structured data remains")

    primary = json.loads(JSONLD_RE.search(text).group(2))
    if "review" in primary:
        raise SystemExit("Self-serving Organization review structured data remains")
    validate_json_ld(text)


def patch(text: str) -> str:
    text = patch_primary_entity(text)
    text = remove_invisible_faq_schema(text)
    text = patch_footer(text)
    validate(text)
    return text


def main() -> None:
    original = INDEX.read_text(encoding="utf-8")
    updated = patch(original)
    INDEX.write_text(updated, encoding="utf-8")
    if patch(updated) != updated:
        raise SystemExit("Patch is not idempotent")


if __name__ == "__main__":
    main()
