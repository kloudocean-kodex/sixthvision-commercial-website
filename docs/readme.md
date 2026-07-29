# Sixth Vision Commercial — "THE LIGHT CHANGES"

**Status:** design system + **Chapter I (Arrival)** complete. Chapters II–V not built.
**Preview:** `.claude/launch.json` → `sixthvision-commercial` → http://localhost:8131
**Cache-bust:** currently `?v=112` — **bump on every CSS/JS edit** or the browser serves stale files.
**The contract:** `ART-DIRECTION.md`. Read it before touching anything. Do not re-derive it.

The rejected v2 build is preserved in `archive-v2/` for reference.

---

## Files

| File | What it is |
|---|---|
| `assets/css/system.css` | The design system. Light scale, type, primitives, reveal, motion. |
| `assets/css/chapter-i.css` | Chapter I only. Derives everything from `--sun`; **no hex values.** |
| `assets/js/light.js` | The light engine + reveal + micro-parallax. |
| `index.html` | Chapter I. |

---

## The light scale

One custom property, `--sun` (0 → 1), drives **every** colour. Nothing is hard-coded per
section. `@property` registers it as `<number>`; four `clamp()` segment weights interpolate
the ground through all five stops in oklab via `color-mix()`.

- **No JS → `--sun: 0.5`, the Midday palette, everything visible.** Verified.
- **`prefers-reduced-motion` → Midday, static.** Verified.
- **No `color-mix()` support → flat Midday fallback** via `@supports not`.

Chapter I declares its range on the section: `data-sun-from="0" data-sun-to="0.20"`.
Chapters II–V add their own; the engine interpolates within whichever section the
viewport's midpoint is in.

### Debug flags

- `?sun=0.75` — force a light stop and hold it. How the five stops get contrast-checked.
- `?still=1` — skip the reveal system entirely, so the settled composition can be
  reviewed without animation timing in the way.

---

## ⚠ One correction to ART-DIRECTION.md §2

The document mandates *"all text ≥ 4.5:1 at all five stops or the stop is wrong"*, but the
accent it specifies — `#8A7A5E` at dawn — is **3.82:1 on `#F4F5F3`**. It fails its own rule,
repeating the exact mistake `HANDOFF.md` flags for `--champagne`.

Shipped as a **split token** (the pattern HANDOFF already proved):

| Token | Ramp | Range | Use |
|---|---|---|---|
| `--accent` | `#8A7A5E → #7A5A22` | 3.82–5.18:1 | **decorative only** — hairlines, rules, marks |
| `--accent-ink` | `#7C6D54 → #7A5A22` | **4.60–5.24:1** | **all accent text** — AA at every stop |

`--accent-ink` is the AD's colour darkened ~10%, the lightest value that clears AA, so it
keeps its bronze character. **ART-DIRECTION.md §2 should be amended to match.**

---

## Chapter I — how the composition was decided

Not by taste. The McKellar loop is a slow dolly **in**, so a composition judged on frame 0
is invalid by the end of the loop. 43 frames were sampled and every pixel tested for "stays
light AND stays quiet across the whole loop":

```
top    L 95%  ·  C 56%  ·  R 51%      <- the sky band
mid    L  7%  ·  C 13%  ·  R 20%
bot    L  0%  ·  C  0%  ·  R  0%      <- goes to L=0 as the dolly closes
```

The lower-left — where the first draft put the headline — is the **worst** place on the
frame. Only the sky is dependable. So **the light enters from the sky**: the page's ground
colour bleeds down into the top of the photograph, page and sky become one continuous dawn
with no seam, and the building emerges out of that light. The dark, dramatic lower-right is
never veiled and keeps full contrast. Because the wash is painted in `--ground`, it warms as
the page descends — image and page lit by the same sun.

**Verification harness:** the CSS gradient layers are re-implemented numerically in PIL,
composited over **every frame of the loop**, and worst-case contrast is measured under each
type block at both ends of the chapter's light range. This caught a headline failure at
**2.50:1** — a thin dark roofline crossing the lower third of "Measured.", only 1% of the
box area, invisible in any single screenshot. Current state:

```
                    sun 0.00  sun 0.20   gate
chrome row             12.25     12.21    4.5   PASS
lockup COMMERCIAL       5.51      5.72    4.5   PASS
eyebrow                 5.32      5.52    4.5   PASS
headline (large)        4.01      3.99    3.0   PASS
deck                    7.53      7.51    4.5   PASS
foot row                4.84      5.02    4.5   PASS
```

Headline is gated at 3.0 (WCAG large-text, 160px); everything else at 4.5.

---

## Verification tooling (the process rule that failed last build)

The preview pane reports `visibilityState:"hidden"` → rAF throttled, no scroll events, dead
IO, screenshots time out. **Headless Chrome is driven directly instead** — it renders the
real page with the real fonts:

- **Screenshots:** `chrome --headless=new --screenshot`. Needs a **Windows-style** output
  path or it fails with "Access is denied".
- **Narrow viewports:** headless enforces a **~550px minimum window width**, so
  `--window-size=390,844` silently lays out at 526px and crops the capture — which fabricates
  mobile "bugs" that do not exist. Real phone viewports require CDP
  `Emulation.setDeviceMetricsOverride`. Node 24 has a global `WebSocket`, so this needs
  **zero dependencies**.
- **Serve over HTTP, not `file://`.** Over `file://` the `<link rel=preload crossorigin>`
  font requests are CORS-blocked and fill the console with errors. The `@font-face` fetch
  still succeeds and the fonts *do* render — but the noise masks real errors. Over HTTP the
  console is **clean**.

---

## Fonts (verified in-repo, axes and charset both checked)

- **Fraunces** `opsz 9–144 · wght 100–900 · SOFT 0–100 · WONK 0–1` — 77KB. Display.
  ⚠ Its default instance is **wght 900 / opsz 9**. Both axes must be set explicitly via
  `font-variation-settings` everywhere, or display type renders black-weight small-optical.
  Never rely on `font-weight` for Fraunces.
- **Hanken Grotesk** `wght 100–900` — 24KB. Utility.
- Both subsets cover full ASCII + `· – — ‘’ “” • … ° ′ ″`. **No arrow glyphs** — any arrow
  must be SVG, not a text character, or it silently falls back to a system font.

---

## Assets — two things the next session must know

1. **`hero-dusk-*.webp` is not a dusk image.** It is a bright daylight shot of blue/white
   units, and a *different building* from the McKellar hero footage. v2 used it as the hero
   poster, which flashed a mismatched frame over the video on load — visible as two ghosted
   buildings. Replaced with **`hero-poster-{800,1280,1600}.webp`, generated from the video's
   actual first frame.**
2. **The `d2d-*` / `d2d2-*` pairs in `assets/img/` do not look like genuine day-to-dusk
   pairs** — before and after are both daylight and nearly identical. `HANDOFF.md` §6 says
   the real pairs are `016`/`016_d2d` and `007`/`007_d2d` in
   `Downloads\commercial\`. **Regenerate before building Chapter III** — that chapter is
   entirely about this transformation and the current assets do not demonstrate it.

---

## Before Chapter II

- Chapter II is **The Measure** (Morning) — rated ULTRA BAD in v2. `ART-DIRECTION.md` §6 and
  §14 contain the diagnosis and the dusk-conversion recipe. The recipe was **written but
  never run**; `assets/img/measure-dusk-*.webp` does not exist yet.
- Add `data-sun-from`/`data-sun-to` to each new chapter section.
- Add chapter anchors to the nav once II–V exist (the header currently carries only phone +
  Enquire, because linking to sections that do not exist would be a broken link).

## Claims to reconfirm with Ankkush before launch

`10+ years` · `1,000+ commercial properties` · `24-hour delivery` · `CASA-certified` —
carried over from his old site per `HANDOFF.md` §6 and **not independently verified.**
