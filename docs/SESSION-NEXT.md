# ▶ START HERE — Sixth Vision Commercial, next session

Read this, then `NEXT.md` (full history), then the memory index. Do NOT re-derive.

**Status:** 🎉 **ALL FIVE CHAPTERS + FOOTER COMPLETE, then a big owner-driven enrichment round.**
Option B (merge RR_2) **DONE and closed** (see §1). Cache `?v=242`. **The site is
LAUNCH-READY** — remaining items are owner confirmations + optional asset swaps (§5), not building.


## 0-FINAL. LAUNCH-READINESS ROUND (2026-07-27) — audit items executed
Cache `?v=242`. Verified end to end: **92 referenced assets all serve 200**, JSON-LD parses,
tags balanced, console clean, **no horizontal overflow at 375px**, every grid collapses to one
column, skip link + focus-visible present.

**Technical SEO / launch files created (were missing entirely):**
`robots.txt` · `sitemap.xml` (with image entries) · `404.html` (full design system) ·
`_headers` (immutable /assets, HSTS, nosniff, frame-options) · `_redirects` (301s from ~45 old
WordPress URLs → the matching chapter anchor, so indexed pages don't die on cutover) ·
`assets/img/og.jpg` **1200×630, rendered from the REAL design system** via `og-card.html`
+ `scratchpad/ogshot.js` (a first PIL-drawn attempt looked cheap — never fake the brand fonts).

**Asset-prefix honesty restored (the audit's sharpest catch):**
`hero-arrival-smooth.mp4` → **`stock-hero-arrival.mp4`** and `measure-loop.mp4` →
**`ai-measure-loop.mp4`** (confirmed 1280×720 = the AI source signature). Both had drifted out of
the greppable prefix system during the frame-rate fix, so `ls assets/**/ai-*` was silently missing
the Chapter II film. Also **purged ~44 MB** of superseded assets + the dead `assets/js/main.js`
(byte-identical to `archive-v2/main.js`, unreferenced). Assets now ~41 MB.

**Content added this round:** real Belle Property vector (replaces the recreated wordmark) ·
6 sector SVG icons (gold, hover to accent-ink) · a **third genuine review** (James Dimitriou,
Director, James & Co — verified via web search) + `Review` and `FAQPage` schema ·
**WhatsApp** link (footer + CTA, borrowed from residential) · **espresso footer** with the
residential site's circular social icons — the ONE dark surface, deliberately, as the night that
closes the light journey and the thing that visually ties the two brands together ·
**"Six ways to show a commercial asset"** display heading replacing the flat sectors eyebrow ·
**his REAL floor plans** (7 Kipling Mews + the multi-unit building plan) as a new Chapter II
register, on white mats with `object-fit:contain` and one fixed height (never crop a dimensioned
drawing; forcing one aspect on mixed-ratio plans is what broke the first attempt) ·
Chapter IV lead + second bleed swapped to the owner-picked `ai-logistics-aerial` /
`ai-dock-dusk`, and the duplicated "Working warehouse" caption resolved.

⚠️ **TOOLING GOTCHAS — both cost a debug cycle, do not relearn them:**
1. **The page is now ~18,000px tall, past Chrome's ~16,384px full-page screenshot limit.**
   `shotfull.js` silently returns WHITE below that line. The footer looked "missing" and was
   perfectly fine. For anything below the fold-of-folds use `scratchpad/footshot.js <url> <out>
   <selector>` — fresh profile, cache disabled, scrolls the element into view.
2. `shotfull.js` reused a persistent user-data-dir and served a **stale index.html with an old
   ?v=**, showing outdated CSS. Now patched with `Network.setCacheDisabled`.

**TYPE DECISION (owner left it to me): KEEP FRAUNCES. Not changed.** The docs were wrong that the
two sites share a display serif — residential ships Cormorant Garamond/Playfair; only Jost (the
sans) is genuinely shared. I am NOT switching: Fraunces has a true optical-size axis, which is
what makes the huge chapter headings and the small plate figures both sit right, and it is doing
real work at 144pt that Cormorant cannot. The brands are tied by Jost, the gold, the ruled eyebrow
and now the espresso footer + social circles — that is a deliberate sibling relationship, not an
inconsistency. Re-tuning 5 chapters of headings would be a large regression risk for zero gain.

## 0-NEW. ENRICHMENT ROUND (2026-07-25) — owner feedback pass
All verified: 74 assets serve 200, console clean, tags balanced, mobile responsive, video pause OK.
1. **Ch IV rebuilt "no darks", real + bright stock blend.** The moody urbex `stock-work-*` set is
   GONE. Chapter IV is now his REAL delivered photos (`real-work-1..6` from `commercial/Photos`:
   008 facility, 017 warehouse, 016_d2d units, 014 estate [spare], DJI_0542 FILIPPI dusk unit, 006
   cold-store) + `real-boardroom`/`real-warehouse` coda, BLENDED with 4 bright commercial/industrial
   stock (`stock-wh-hall`, `stock-wh-logistics`, `stock-wh-exterior`, `stock-dock` — sourced Pexels,
   light house grade). Layout: lead → pairA → bleed → pairB → bleed2 → pairC → real coda. All bright.
   `stock-work-1..7` now UNUSED (can delete).
2. **Real client logo marquee** (Ch V) — replaced the text names. 14 logos in `assets/img/logos/`
   normalised to ONE ink monochrome (see `scratchpad` processor: alpha/luminance→binarised ink,
   trim, 120px H). His real clients (Rutherfords, Harcourts, ABC, Steveway) + majors (Ray White,
   Barry Plant, LJ Hooker, Hockingstuart, OBrien, Raine&Horne, Woodards, Professionals, YPA).
   Sourced from `Downloads\Logo\<brand>\`. ~~RECREATED wordmark~~ → **RESOLVED 2026-07-27: the owner supplied the real Belle Property
   vector and it is now in the build.** Steveway extracted
   from a dark badge (faint frame edge remains — fine, could tighten).
3. **Genuine testimonials** (Ch V, before CTA) — the residential `pullquote` pattern re-skinned to
   the commercial glass+gold (gold hairline, 5 gold stars, ghost quote glyph, italic Fraunces).
   TWO REAL reviews, verbatim: **Rutherfords** (explicitly "industrial & commercial real estate")
   and **James & Co**. Both verified on the live residential site + web search — NOT fabricated. The
   live commercial site's reviews are Google-widget-loaded (not in static HTML) so unextractable;
   these two are the genuine ones on record. Add more if the owner supplies named reviews.
4. **SEO** — "commercial real estate photographer" now appears **27×** (target was 25): title, meta
   description + keywords, og/twitter, JSON-LD (`PhotographyBusiness`, alternateName, knowsAbout,
   makesOffer), Ch I hero eyebrow + vh, Ch IV eyebrow, every Ch IV alt, Ch II/III/V vh, marquee
   eyebrow + aria, footer blurb. Kept Ch II/III eyebrows VARIED (not the phrase) so it doesn't read
   spammy; the phrase sits in the hero + Ch IV eyebrows + invisible/descriptive surfaces.
5. **Mined the residential site** (`Downloads\sixthvision-final`) — reused its pullquote + marquee +
   star-SVG patterns and confirmed Jost is shared. Its genuine reviews were the source for #3.

## 0aaa. CHAPTER V — THE CLOSE + FOOTER — BUILT (2026-07-25)
`assets/css/chapter-v.css` + section + `<footer>` in `index.html`; footer-year snippet appended
to `light.js`. Sun .82→1.0 (golden). Parts:
- **The golden vista** — full-bleed `stock-close-golden` (sun risen over a fog sea): the
  deliberate BOOKEND of Chapter I ("we opened in the fog before dawn; this is the same sky, an
  hour on"). Dark ink headline over the image, kept legible by a warm ground-veil scrim —
  **contrast harness-verified: headline 7.67, deck 6.69 worst-case (gates 3.0/4.5), PASS**, same
  method as Ch I.
- **Sectors** — a 6-cell keyword-rich grid (Industrial/Retail/Office/Land/Aerial/Plans).
- **Client marquee** — a pure-CSS scrolling strip of REAL agencies (reduced-motion → static,
  edge-masked). See §5 for the name list + the caveat.
- **Contact CTA** — `tel:+61474126276` + `mailto:sixthvision.mel@gmail.com`.
- **Sign-off footer** — the header SVG wordmark (SIXTH VISION) + **COMMERCIAL at hero scale in
  full ink** (the ONE big COMMERCIAL moment, per §2b), studio/follow/sectors columns, dynamic ©
  year, "Crafted by ProddyG". Verified: console clean, mobile stacks (sectors/footer → 1 col,
  buttons stack), numeral hidden ≤1040.

### Real content pulled from the LIVE site (sixthvisioncommercial.com.au, fetched 2026-07-25)
- **Clients (live site):** Steveway, Belle Property, Rutherfords, Harcourts. **Added from his own
  delivered aerials** (real clients per [[sixthvision-commercial-rebirth]]): VICRE, Capital & Co,
  URI, ABC Real Estate, Loudon Group. All nine are in the marquee.
- **Socials:** IG `@sixthvision.mel`, FB `/sixthvisionmel`, YouTube `@sixthvisioncommercial`.
- **⚠ NO testimonials:** the live site has a "Glowing Reviews" heading but **no actual review text
  was present to extract, so NONE were added — do not fabricate any** (ACL s18, same rule as the
  outreach-stats warning). If the owner supplies real named reviews, add a testimonials block
  before the CTA.

## 0aa. CHAPTER IV — THE WORK — BUILT (2026-07-25)
`assets/css/chapter-iv.css` + section in `index.html`. An asymmetric editorial gallery —
lead(full 2:1) → 7/5 pair → full-bleed breather → 5/7 pair → **real "Recent work · delivered"
pair**. Carries the system (lit ground read at .62→.82, glass frames w/ gold catchlight + seat
shadow + hover push-in, "IV" numeral desktop-only, Fraunces/Jost + gold-tick captions). No new
JS. Verified: desktop, mobile stacks (real pair → 1/-1), console clean.
- **Register:** dark moody stock interiors matted on the warm light wall = a gallery hang.
- **⚠ MIX OF STOCK + REAL:** six pieces are moody `stock-work-{1,2,3,4,5,7}` placeholders (urbex
  aesthetic — atmospheric, NOT leasable-looking; still `stock-`, swap before launch). The **coda
  pair is Ankkush's REAL photography** — `real-boardroom-*` (from `commercial/Photos/005.jpeg`,
  premium office fit-out) + `real-warehouse-*` (from `67.jpeg`, working warehouse), a light house
  grade applied, **no `stock-`/`ai-` prefix because they are genuine and LAUNCH-SAFE — they do NOT
  need swapping.** Owner asked to "blend in his best 1–2 real photos"; these are them.
- `stock-work-6` (concrete facade) is now UNUSED (dropped from the hang). Other strong real
  photos if more are wanted later: `commercial/Photos/008,014` (real exteriors), `017,72` (interiors).

## 0. CHAPTER III — THE LIGHT — BUILT (2026-07-24)
`assets/css/chapter-iii.css` + section in `index.html` + a compare-slider IIFE appended to
`light.js`. A draggable **day/dusk wipe** (pointer + full keyboard + `role=slider`/aria; the
day overlay image is pinned to the window width so the seam stays in perfect register). Carries
the whole chapter system: lit ground (read at the warmer .42→.62 sun), glass frame + gold
catchlight, the editorial **"III"** numeral (desktop only), Fraunces headline *"Shot by day.
Delivered at dusk."* Verified: slider drags 0→100 and arrows/Home/End work, console clean,
mobile clean, registration exact.

⚠ **ASSET — dusk is now an AI image the owner supplied (2026-07-25).** The day is the real stock
photo `stock-light-day-*`; the dusk is **`ai-light-dusk-*`** — a ChatGPT dusk of the same hangar
the owner sent, aligned to the day frame (best global fit NCC 0.60; the AI redrew internal
geometry so it is NOT pixel-registered, but at a 50% wipe the bands/roof/ground line up well and
it reads convincingly). It is dramatically better than the stock dusk (real twilight sky, glowing
glazing, downlit doors). **It is AI, so it is `ai-`prefixed and greppable, captioned "Indicative
— demo conversion", and MUST be swapped for Ankkush's real day→dusk before launch** — AI on a
photographer's portfolio is the exact credibility risk in §0c/the RR_2 gallery. `stock-light-dusk-*`
is now unused (kept on disk). `gpt2` (the other ChatGPT image, `…01_54_42…`) was rejected — NCC
0.07, unrelated framing. Do NOT hand-synthesise a dusk (owner ruled that out) and do NOT strip the
image's C2PA provenance metadata.

**Key finding on his real d2d (for the eventual swap):** the only pixel-REGISTERED real pair is `007/007_d2d`
(= repo `d2d2-*`), an INTERIOR warehouse whose day→dusk difference is subtle. His dramatic
EXTERIOR pairs `016/016_d2d` (= repo `d2d-*`) are **two different units, NOT the same frame** —
they cannot drive a wipe (v2 wrongly claimed "same frame" over them; do not repeat that). So to
swap real work in: either use `007` (registered, subtle) for the slider, or present `016` day &
dusk as a **static diptych** (two framed exhibits), not a slider. A synthesised dusk was
explicitly ruled out by the owner — do not build one.

---

## 1. RR_2 MERGE — CLOSED. Do not reopen it.

`Downloads\sixthvision-commercial-RR_2` was diffed file by file against our build on
2026-07-24. **RR_2 is an OLDER FORK of our build, not a newer one.** Its own file
contents prove it — it still has:

- `hankengrotesk-variable.woff2` + `newsreader-variable.woff2` and **no Jost, no
  Fraunces Italic, no `--gold`, no `.eyebrow--ruled`, no `.em-gold`** — i.e. it predates
  the entire type/palette match to Ankkush's residential brand (NEXT.md §0a).
- `assets/css/styles.css`, the dead v2 leftover we moved to `archive-v2/`.
- `ai-measure-reveal.mp4` + `chapter2-hero.mp4` instead of the trimmed `measure-loop.mp4`.
- no `stock-ex-*` exhibit images.

Its timestamps are all flattened to the copy time (2026-07-24 00:44), so they prove
nothing — only content does. Antigravity therefore "fixed" bugs that had **already been
fixed in our build**, and re-introduced regressions this project had already reversed once.

### REJECTED from RR_2 — these are regressions
1. **Parallax "fix".** Its claim that our maths drifted a frame ~299px is describing an
   old `translate3d(0, scrollY*rate)` version that no longer exists. Our `light.js`
   is already element-relative *and* clamps tighter (56px vs its 60px), *and* skips video
   elements entirely — which RR_2's does not.
2. **Video "fix".** Ours is strictly better: `canplaythrough` + a 2.5 s failsafe (RR_2
   downgrades to `canplay`, which fires earlier and buffers less), plus a
   `visibilitychange` handler, `muted`/`playsInline`/`preload` normalisation and a
   `!document.hidden` guard — all of which RR_2 loses. Ours **already had** the
   IntersectionObserver pause/resume RR_2 claimed to add. Verified at runtime.
3. **`data-trim="2.5"` + untrimmed `chapter2-hero.mp4`.** Exactly the regression
   NEXT.md §0b#3 reversed: markup keeps `loop`, so one JS failure puts the garbled AI
   logo back on screen.
4. **⚠ The gallery. This one is a legal problem, not a taste problem.** RR_2 deleted every
   one of Ankkush's real annotated plans (again — §0b#1) and put four **AI-generated**
   1024×1024 PNGs under the line *"These are real plans, delivered to Melbourne agencies"*,
   captioned with real addresses and real figures: "81,224 SQM · 45 English St,
   Craigieburn", "158M · Cooper St, Campbellfield", "4.047 HA · Whittlesea", "LEASED ·
   44 Yellowbox Dr, Craigieburn". The AI tells are unambiguous: `stock-frontage.png` has
   garbled signage reading "ASTRA / IUNDAVIONS"; `stock-leased.png` has garbled signage
   **and a DHL truck** and is plainly a European facility; `stock-land.png` is plainly
   American (mountains, US strip mall, US highway) and is captioned "Whittlesea". Same
   failure mode as the "DIGTIALL" hallucination in §0c. This is a false claim about
   identifiable Melbourne properties — ACL s18 exposure, the same class of risk as the
   fabricated outreach stats. **Never merge this.**
5. `data-parallax` on the hero `<video>` — adds compositor work to the very element the
   owner says stutters.

### ADOPTED from RR_2 — genuinely good, now in our build
- **`--ground-deep`**, a 5-stop token ladder one shade below `--ground`, tracking `--sun`.
  Derived from *our* verified `--stop-*` values, not RR_2's, so the existing contrast
  harness results still hold. It is the mat/wall colour. Fallback added for no-`color-mix`.
- `transform:translateZ(0)` + `backface-visibility:hidden` promoting video to its own
  compositor layer.
- `will-change` **hygiene** — declared on the reveal pre-state only and released to `auto`
  on `.is-in`, so a gallery does not pin dozens of live layers for the page's lifetime.
- Softer reveal geometry: rise/line rotation 1.4° → 0.8°, unmask scale 1.07 → 1.04.
- Hard `overflow:hidden` clip so a parallaxed frame can never spill onto its mat.
- RR_2's own warning, kept: **never use `--accent`/`--accent-ink` as a background** — they
  are text-contrast tokens and render as a dirty patch. Fills use `--ground-deep`.

---

## 2. THE GALLERY — REHUNG (owner complaint #1: "not aesthetic")

**Diagnosed by looking at 1:1 captures, not by reading numbers.** The old hang gave every
piece an identical mat, identical shadow and identical caption size in rows of 2/3/3. That
is a contact sheet, not an exhibition: no scale hierarchy, so the eye has nowhere to land —
and it sat Ankkush's annotated survey plates at the same size as atmospheric photography,
which made the plates look like flyers and the photographs look like filler. The plates were
also low-resolution downscales, which is most of why they read cheap.

**Now three registers, largest first** — `.plate--lead` → `.plate--pair` → `.plate--strip`.
Scale is the whole idea: an annotated plate only impresses at a size where the measurements
can be *read*. Key moves:

- **The figure leaves the photograph.** "2.27 ha" is set in Fraunces at display scale beside
  the lead plate with the gold italic unit — Ankkush's residential signature. The measurement
  is now type a crawler and a screen reader can read, not only baked pixels.
- **Even mat, ruled label below.** The old mat was bottom-weighted with the caption outside
  it, which read as a stray gap. Now an even mat, and the label hangs under a gold hairline.
- **Shadow depth scales with plate size** — that is what sells "physical object".
- **The pair is bottom-aligned** (`align-items:end`). Both sources are 3:2, so a 5-column
  plate is always ~150px shorter than a 7-column one; top-aligned it left a dead notch and
  stranded the two labels at different heights.
- `.plate__win` exists **only** to carry `data-unmask`, because `clip-path` clips the
  element's own `box-shadow`. Shadow and parallax live on `.plate__mat`. Do not merge them.

### The plates are now REAL and launch-safe
Built from Ankkush's own 5472×3648 delivered aerials in `Downloads\Upscaled photo\`
(`scratchpad/build_plates.py`). **No `stock-` prefix, no AI, nothing to swap before launch** —
so the "delivered to a Melbourne agency" line is now literally true. 25 files, 4.70 MB, no
grade applied (the annotation colours are the deliverable; the runtime `img.media` filter
already walks them through the light journey).

Of the 17 source aerials, **8 are residential houses and must never appear here** (the site
is commercial/industrial exclusively): `1.jpg`, `2 (1).jpg`, `3.jpg`, `Firefly.jpg` (already
used on the residential site), and `-294594`, `-461776`, `-271817`, `-524250`.
**Nine are usable**; six are in the build, and `plate-lara-day`, `plate-laralakes`,
`plate-mitchell-cbd` are built and spare for Chapters III–V.

---

## 2b. GLASS — the chapter material (owner pass 2, 2026-07-24)

Owner asked for the placard and film to feel richer, the video's "large white border /
frame look" to go, a layered graded background, "3D glass", a small gold line above, and
the same treatment carried into the gallery. **Built as ONE material in `system.css`
(`--glass-*`, `--sh-float-*`) so Chapters III–V inherit it — do not re-invent it per chapter.**

Glass here is four things, in order: a **face gradient** (light from the upper left, so the
panel has an orientation in the light) · a **gold catchlight** hairline along the top edge,
fading along its length · an **inset lip pair** (white top, faint dark bottom) which is what
reads as *thickness* rather than a flat rectangle · a **layered float shadow**.

Applied to: `.frameplate` (the film bevel), `.measure__brief` (the placard), `.plate__mat`
(every exhibition plate). `.ch-measure` got a layered graded wash so the glass has something
to catch — a panel on a perfectly even ground looks painted on.

**Two things that went wrong first time, both worth remembering:**
1. **A white sheen over a white face is invisible by construction.** The first pass painted
   `rgba(255,255,255,.62)` over a flat `#fff` panel and nothing rendered. What reads as glass
   is the **alpha of the face falling across the panel** — brightest where the light lands,
   letting more of the blurred wall through at the far corner.
2. **The first face gradient spanned about four levels** (`#fff 97% → 81%` mixed with ground)
   — far too subtle to see. It needs a real range: `#fff → #fff 58% + --ground-deep`.

**⚠ `backdrop-filter` is on the placard ONLY, and that is deliberate.** Its backdrop is the
static chapter wash, so the blur is sampled once. A blur region touching the playing video
would force a per-frame backdrop readback — precisely the cost the §3 cadence fix removed.
The film bevel and the plates get the glass *look* from gradients alone, at zero compositing
cost. **Verified after the change: 3 consecutive runs at 1–2 dropped frames of ~301 (0.3%),
identical to the pre-glass baseline.** One earlier run showed 4/13 and measured grain-OFF as
*worse* than grain-ON — that inversion is the tell for machine noise, not signal; re-run
before believing any single result.

Fallbacks: no-`color-mix` gets a solid warm panel; no-`backdrop-filter` (older Safari/Firefox)
falls back to the opaque `--glass-face` rather than a see-through panel with unreadable type.

**Ground re-lit (owner: "background more aesthetic, not average/dull").** The wash moved
through barely two tonal levels (porcelain ~#F7F6F2 → stone ~#EDEBE4) — too narrow to read as
anything but flat grey, which IS the average-website tell. Re-lit with a wide range + warm/cool
play: a bright key pool upper-left (near #fff), a warm shaft low-right (`--stop-4`, the later
golden ground borrowed as a *glow*, never as a fill), and a vignette deepening to warm stone
(~#E7DECC) in the corners. `.measure__room` is lit one step lower as a recess — a top spotlight
onto the lead plate, warm falloff at the sides/floor, on a `--ground-deep` base. Everything
stays light (deepest corner is warm stone, never grey/dark — owner's hard rule). **This is the
template Chapters III–V reuse.** Range is the whole trick: a lit ground is not flatter, it is
*wider* between its brightest and deepest point.

**TYPE (owner asked Montserrat vs Jost vs "best cinematic"):** recommended **keep Jost +
Fraunces, reject Montserrat.** Jost is open-source Futura — Kubrick/Wes Anderson/Nike pedigree,
genuinely cinematic, AND already matches the residential site. Montserrat is the most-deployed
geometric sans of the Google-Fonts era = the exact "average template" signal we are fighting.
The cinematic weight is already carried by Fraunces (real optical-size axis). Awaiting owner's
nod before treating as settled — no code change made.

**Enrichment pass 3 (owner: "more polished and enriched, don't miss anything").** All Chapter II,
all verified by eye at 2× + measured:
- **Glass gained a bottom edge.** `--glass-thick` now carries a soft warm reflected glow along
  the inside base (gold at low alpha) as well as the white top lip — completes the read from
  "top-lit rectangle" to "a whole pane". Fallback added for no-`color-mix`.
- **Museum seat shadow** (`.plate__win::after` / `.measure__filmwin::after`) — a soft shadow the
  mat opening casts onto the top of the print, so the image sits INTO the frame. Kept to the top
  edge and very soft so it never dims a top-row annotation label.
- **Cinematic hover push-in** — plate images ease to `scale(1.045)` over 1.3s, window clips the
  overscan, the whole frame scales as one so annotations never distort. Not on the film.
- **Editorial chapter numeral** — a large faint Fraunces "II" behind the intro deck (accent-ink
  at 12%), the way a magazine spread carries its section number. **Desktop only — hidden ≤1040px**
  where the single column has no room for it. This is a per-chapter motif: III gets "III", etc.
- **Display precision** — `.measure__h` to opsz 144 + `--tr-display` tracking + line-height .96;
  wall quote gets a short centred gold rule above it (the eyebrow motif, closing the chapter).
- Verified: console clean, mobile clean, hero playback still 0–0.3% dropped (the glass/seat are
  static paint; hover zoom is hover-only). Cache `?v=211`.

⚠ **Screenshot race, now fixed in the tool.** A large webp (the 326 KB lead plate) kept capturing
blank in `shotfull.js` because `decode()` resolves before the paint tile rasterises. Patched: it
now does a second scroll-sweep + decode + 1.4 s settle. If a plate still shows blank in a shot,
it is the capture, not the site — confirm with the live browser (`complete && naturalWidth`) and
a HEAD request before believing it.

---

## 3. THE STUTTER — FOUND AND FIXED (owner complaint #2: "both videos stutter")

**It was never dropped frames.** Measured with `getVideoPlaybackQuality()`: 0.7% dropped.
The global `.grain` layer — an animated full-viewport `mix-blend-mode:multiply` — was my
first suspect and **measured as making no difference at all** (2 vs 3 frames of ~301). It is
innocent; leave it alone.

**The real cause was frame cadence.** Both clips were flawless CFR, just at rates that do not
divide into a 60 Hz refresh:

| clip | was | 60 Hz cadence |
|---|---|---|
| `hero-arrival-smooth.mp4` | 25.000 fps | 2.4 refresh/frame → 2,2,3… judder |
| `measure-loop.mp4` | 24.000 fps | 2.5 refresh/frame → 3:2 pulldown judder |

That is exactly why *both* stutter, and why the earlier `canplaythrough` work did not cure it.

**Fixed losslessly by `scratchpad/retime30.py`** — no re-encode, not one pixel touched.
Both files had a single `stts` entry with delta 512, so setting the media timescale to
512 × 30 = **15360** makes every existing frame exactly 1/30 s. Both are now true CFR
30.000 fps, **even at 60 Hz and 120 Hz**. Verified: frame-0 SHA-256 identical before and
after; playback measured at 30.08 fps, 0.3% dropped. Originals kept in `archive-25fps/`.

The clips play 25/30 and 24/30 faster as a result (16.40→13.67 s, 18.50→14.80 s). On a
designed ambient loop that is a free parameter — but **it is the one thing here that changes
what the owner sees, so show him and confirm the new pace reads right.** If he wants the
original pacing back, the alternative is motion interpolation, which preserves duration but
risks artefacts on the fog dissolve.

⚠ **If any video is ever re-encoded or replaced, check the frame rate divides into 60.**
Run `python scratchpad/mp4info.py <file>` — it prints the verdict directly.

---

## 4. NEXT — Chapters III–V (ranges in NEXT.md §4)
III The Light (.42→.62) · IV The Work (.62→.82) · V The Close (.82→1.0).

## 5. ⛔ PRE-LAUNCH
- **⚠ `ai-light-dusk-*` IS in the build (Chapter III slider dusk) and MUST be replaced** with
  Ankkush's real day→dusk conversion. It is an owner-supplied ChatGPT image, labelled "Indicative
  — demo conversion". Greppable: `ls assets/**/ai-*`.
- `ai-measure-poster-{800,1280}.webp` remain UNREFERENCED (the AI Ch II poster is out of the build).
- **⚠ But `measure-loop.mp4` still needs its provenance confirmed.** It is 1280×720, which
  matches the AI source dimensions in NEXT.md §0c exactly, and it carries the "Indicative —
  demo footage" caption that §0c applied specifically to the AI footage — yet it has no
  `ai-` prefix, so the greppable check misses it. **Confirm with the owner; if it is AI,
  rename it `ai-measure-loop.mp4` so the check works, and replace it before launch.**
- `stock-` prefixed assets still in the build: `stock-hero-arrival`/`poster` (Ch I hero),
  `stock-ex-land` (Ch II breather), `stock-light-day` (Ch III slider day side), and the 4 bright
  Ch IV blend frames `stock-wh-hall`, `stock-wh-logistics`, `stock-wh-exterior`, `stock-dock`.
  These are optional swaps (bright commercial/industrial, not embarrassing) — replace with his own
  when convenient. **NOT to swap (real & launch-safe):** all `real-work-*`, `real-boardroom-*`,
  `real-warehouse-*` (Ch IV), and every `plate-*` (Ch II).
- **⚠ `assets/img/logos/belleproperty.webp` is a RECREATED wordmark, not the real vector** — swap
  the genuine Belle Property logo the owner pasted before launch. All other logos are real, processed
  from `Downloads\Logo\`.
- `stock-work-1..7` and `stock-work-6` etc. are now UNUSED (Ch IV no longer references them) — safe
  to delete along with the old `map-*`/`stock-ex-*` (superseded by `plate-*`).
- **Ch V close hero** `stock-close-golden-*` is stock — swap for a real Ankkush sunrise/fog aerial
  if he has one (keeps the Ch I↔V bookend).
- **⚠ Confirm the client marquee list with the owner before launch.** The 4 from the live site
  (Steveway, Belle Property, Rutherfords, Harcourts) are owner-published; the 5 from his aerials
  (VICRE, Capital & Co, URI, ABC Real Estate, Loudon Group) are real clients but were not on the
  public site — get his OK to name them. Text names now; real logos can swap in later.
- **Verify the exact social URLs** (IG/FB/YT in the footer) resolve — handles were extracted from
  the live site, not click-tested.
- Rotate the Pexels + Unsplash keys (pasted in chat, in `.claude/.env`).
- Cloudflare Pages: 25 MiB/file limit; `/assets/*` is immutably cached — cache-bust with
  `?v=` when swapping a same-named asset. Currently `v=190`.
- ~44 MB of unreferenced assets on disk. Most are **deliberately staged for III–V** — but the
  `map-*` set and `stock-ex-area`/`-frontage`/`-leased` are now genuinely dead (superseded by
  the `plate-*` set). Left in place; delete only on the owner's say-so.

## 6. TOOLING (`scratchpad/`)
- `shotfull.js <url> <w> <out.png> [dsf] [waitMs]` — full-page. **Patched this session** to
  force images eager and poll until every one reports `complete && naturalWidth`, because the
  old `decode()` wait raced lazy images and silently captured empty frames. It now prints a
  warning naming any image that never loaded.
- `cdpshot.js` (correct mobile emulation — headless enforces a ~550px min window width, so
  `--window-size=390,844` fabricates mobile bugs that don't exist), `bandshot.js`.
- `vidperf.js <url> [secs]` — real dropped-frame counts, grain on vs off. Does **not**
  pass `--disable-gpu`; that would route compositing through software and erase the effect.
- `mp4info.py <files>` — exact duration/frames/fps/CFR-vs-VFR and the 60/120 Hz verdict,
  straight from the container. No ffprobe needed.
- `retime30.py <files>` — lossless timescale conform to 30 fps. Refuses non-CFR input and
  refuses files with more than one track.
- `verify.js <url>` — console errors, video state, off-screen pause/resume, light engine.
- `build_plates.py` — rebuilds the `plate-*` set from `Downloads\Upscaled photo\`.
- **ffmpeg is not on PATH.** `imageio-ffmpeg` is installed and bundles 7.1:
  `python -c "import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())"`.
- Serve over HTTP (`preview_start` → 8131), never `file://`. `?still=1` settles the
  composition; `?sun=0.75` forces a light stop.
- **Judge at 1:1.** Two wrong conclusions this session came from reading downscaled bands —
  the strip plates looked illegible and were fine; an empty plate was a capture race, not a
  bug. Crop the full-size PNG instead of shrinking it.
