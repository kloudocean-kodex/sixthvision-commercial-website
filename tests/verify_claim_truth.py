#!/usr/bin/env python3
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
MANIFEST = ROOT / "growthproof" / "claims-truth.json"

def fail(msg):
    print(f"FAIL: {msg}", file=sys.stderr)
    raise SystemExit(1)

if not DIST.exists():
    fail("dist/ missing; run build.py before claim verification")

truth = json.loads(MANIFEST.read_text(encoding="utf-8"))
home = (DIST / "index.html").read_text(encoding="utf-8")
commercial = (DIST / "commercial-property-photography-melbourne" / "index.html").read_text(encoding="utf-8")
plans = (DIST / "precision-floor-plans" / "index.html").read_text(encoding="utf-8")
all_text = "\n".join([home, commercial, plans])

# Exact operating facts approved by the business owner must remain represented.
required = {
    "experience": ["10+", "Years in Melbourne"],
    "commercial_properties": ["1,000+", "Commercial properties"],
    "commercial_photo_turnaround": ["24-hour delivery is available for commercial photography"],
    "casa_aerial": ["CASA-certified aerial"],
    "measured_mapping": ["site, boundary and amenity mapping"],
    "commercial_floor_plans": ["Commercial floor plans"],
}
for claim_id, literals in required.items():
    for literal in literals:
        if literal.lower() not in all_text.lower():
            fail(f"owner-verified commercial claim missing: {claim_id} -> {literal}")

# Keep the wording of the 24-hour claim scoped to photography; larger briefs
# involving video/measurement/mapping are explicitly scoped around deadlines.
if "Larger briefs involving video, measurement or complex mapping are scoped around the campaign deadline." not in commercial:
    fail("commercial turnaround scope qualifier missing")

print("Commercial owner-verified claim truth verified in deployable output")
