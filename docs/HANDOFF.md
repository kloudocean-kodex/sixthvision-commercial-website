# SIXTH VISION COMMERCIAL — HANDOFF FOR FRESH SESSION

Read this first. Everything below is settled — **do not re-derive it.**
The problem is **composition/art direction only.** Assets and system are done.

---

## 1. THE VERDICT ON v2 (be honest with yourself)

Owner reviewed and rejected it: *"looks too bad… overall feel is $100–200 AUD freelance
work."* He is right. Specific failures, in his words and mine:

| Section | Problem |
|---|---|
| Wordmark lockup | "could be better" — SIXTH VISION / COMMERCIAL too plain |
| "Commercial buyers don't browse" | "very average" — text-led, images are decoration |
| **"Watch a site become a case"** | **"ULTRA BAD"** — gold survey lines vanish on a bright daylight aerial; labels clip off the image edges. Needs a DARK, moody base image. |
| Day-to-dusk slider | "average, no cinematic use of colour" |
| "Every asset class" | list is flat; hover peek **overlaps the metadata text** (real bug) |
| "Recent work" | "BAD… usual, regular" — plain mosaic |
| "Price it in thirty seconds" | **DELETE THIS SECTION ENTIRELY** (owner instruction) |
| "Ten years of Melbourne industry" | "very average" |
| Contact + Footer | "very very average" |

**Root cause:** built section-by-section instead of committing to ONE art direction.
Text-led not image-led. Verified with numbers because the preview pane was broken,
which is not the same as looking at it.

---

## 2. HARD CONSTRAINTS (owner instructions — non-negotiable)

- **NO dark page grounds.** Light theme only. (Photos may be dark; UI grounds may not.)
- **Wordmark must read "Sixth Vision Commercial"**, not just Sixth Vision.
- **Hero video must never show on-screen titles** — only 5.0–7.5s of the McKellar clip is clean.
- **Remove the "Price it in thirty seconds" / estimate configurator section.**
- Stock imagery is allowed to raise the visual bar (owner approved), **but never in the
  portfolio, case studies, or the day-to-dusk slider** — that would be faking a photographer's work.

---

## 3. WHAT IS DONE AND GOOD — REUSE, DON'T REBUILD

**Project:** `C:\Users\gawar\Downloads\sixthvision-commercial\`
**Preview:** `.claude/launch.json` → `sixthvision-commercial` → port 8131
⚠️ **Bump `?v=` on EVERY css/js edit** or the browser serves stale files (cost ~6 debug cycles).

- **Fonts (keep):** Newsreader variable (display) + Hanken Grotesk variable (utility),
  subset to 104KB total, lowercase filenames. Two faces is correct — don't add more.
- **Images (keep):** 137 graded WebP in `assets/img/`, ~18MB. Cinematic grade already
  applied: filmic S-curve, split-tone, halation, vignette, grain. **Per-category** —
  full on photos, LIGHT on annotated aerials (heavy grade muddies his cyan boundary
  fills, which ARE the product), none on plans. Grade scripts: see git-less `/tmp/grade2.py` logic in readme.
- **`wordmark.svg`** — hand-built, optically tracked, verified zero overlaps. Sound. Only the
  *lockup treatment* needs design work.
- **`icons.svg`** — 12 icons, one spec (24×24, 1.25 stroke, round caps).
- **`hero-loop.mp4`** (0.29MB) — clean 5.0–7.5s window, slowed 1.7×, ping-ponged, seamless, verified title-free.
- **`showreel.mp4`** (16.8MB) — Ravenhall film, under CF Pages' 25MiB limit.
- **Palette tokens** (keep, they're AA-verified):
  `--alabaster #F9F8F4` · `--stone #EFEBE2` · `--stone-deep #E6E1D5` · `--obsidian #14151A`
  **`--champagne #B08D4F` DECORATIVE ONLY** · **`--champagne-ink #7A5A22` for ALL accent text**
  (plain champagne fails AA at 2.6–2.9:1) · `--muted-ink #5E5A52` labels.
  Verified: 0 contrast failures, 4.86–17.79:1.

---

## 4. WHAT TO DO DIFFERENTLY (the actual brief)

1. **Commit to one art direction BEFORE writing any markup.** Write it down, then execute
   it everywhere. Do not design section-by-section.
2. **Image-led, not text-led.** Full-bleed photography doing the talking; type sparse and
   large. Current ratio is inverted.
3. **LOOK AT IT.** The preview pane reports `document.visibilityState:"hidden"` → rAF
   throttled to ~1 frame/700ms, no scroll events, dead IntersectionObserver, screenshots
   time out. **Workaround that actually works:** composite sections offline with PIL and
   `Read` the JPG. Do this every few sections, not at the end.
4. **Fix the survey section properly** — it's the signature idea and currently the worst
   execution. Use a dark/dusk aerial as the base, keep annotation inside safe margins,
   give the lines real contrast.
5. Fewer, bigger, better sections. Nine mediocre chapters lose to five outstanding ones.

---

## 5. KNOWN BUGS TO FIX

- `.idx__peek` overlaps `.idx__m` text in the sector list (right:16% collides).
- Survey SVG labels clip outside the image bounds at some viewport widths.
- `::selection{background:var(--champagne)}` is very aggressive — reads as a broken gold block when text is selected.

---

## 6. CLIENT FACTS (verified — reuse)

Ankkush / Sixth Vision Commercial. Melbourne's northern industrial corridor — Craigieburn,
Campbellfield, Beveridge, Donnybrook, Epping, Mernda, Wollert, Ravenhall.
Real agency clients visible in his own delivered work: **Rutherfords, VICRE, Capital & Co.,
URI, ABC Real Estate, Loudon Group** (confirm before publishing).
Claims from his old site (reconfirm): 10+ years, 1,000+ commercial properties, 24hr delivery, CASA-certified.
Phone 0474 126 276 · sixthvision.mel@gmail.com · Web3Forms key already wired.
**His real differentiator:** not pretty aerials — *annotated deal collateral*: boundaries,
sqm/ha areas, frontages, zoning, amenity/proximity mapping, leased/sold banners.
Source assets: `C:\Users\gawar\Downloads\commercial\{Drone,Photos,Floor Plan,Video}`.
Genuine day-to-dusk pairs: `016`/`016_d2d` and `007`/`007_d2d` (real work, not simulated).

---

## 7. PRE-LAUNCH GATE (from the residential audit — do not skip)

- All asset filenames lowercase; **verify on the live case-sensitive Linux host**, not Windows.
- Real Lighthouse against the deployed URL.
- Contrast-check every token before shipping.
- Replace `stock-*` images; confirm client names, stats, testimonials + permission.
- robots.txt · sitemap.xml · 404 · og.jpg · `_headers` · GA4 · Search Console.
