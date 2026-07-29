# NEXT SESSION — START HERE

Read `ART-DIRECTION.md` (the contract) and this file. `readme.md` documents the
system. **Do not re-derive any of it.**

**Status:** design system + **Chapters I and II complete and verified**. Chapters III–V
not built; their assets are generated and waiting.

---

## 0a. TYPE & PALETTE — matched to the brand Ankkush already approved

Studied `sixthvision.com.au` (his residential site, which he loves) and mirrored its
signals so the two sites read as one brand:

- **Jost** replaces Hanken Grotesk as the utility face — it is what the residential site
  uses, and it is more geometric/expensive at small sizes. `jost-variable.woff2`, 26 KB.
- **Fraunces Italic** added (`fraunces-italic.woff2`) for the gold emphasis word. His
  residential hero sets *"Every home has its hour."* exactly this way — a gold italic serif
  on the key word. Chapter II now mirrors it: *"Every square metre, accounted for."*
- **`--gold`** — a new DECORATIVE-only token, warmer and more saturated than `--accent`
  (`#C2A04A → #B08A22`), for rules and marks. **Never for text** — it fails AA. Text keeps
  `--accent-ink`.
- **`.eyebrow--ruled`** — a short gold rule above a tracked eyebrow, his other signature.
- Dead `styles.css` (v2 leftover) moved to `archive-v2/`; Hanken + Newsreader deleted.
  Fonts now **182 KB total**.

## 0b. AUDIT — the Gemini pass (2026-07-21)

**Kept from it (genuinely good):**
- `hero-measure-clean.mp4` — the source correctly trimmed before the logo. Used as the
  master for `measure-loop.mp4`.
- Deferring `play()` until the video can play through — the right fix for stutter. Adopted
  (with a 2.5 s failsafe, because some browsers never fire `canplaythrough` on looping media).
- The museum-framing direction (white mat + shadow) — kept, executed with a soft layered
  shadow rather than a hard 8 px offset.

**Regressions found and reversed:**
1. **It deleted every one of Ankkush's real annotated plans** (grep count: 0) and replaced
   them with AI stills. That guts the chapter — The Measure is about measurement, and a
   pretty building shows none. His plans are restored, now *blended* with the AI stills:
   cinematic frame → measured evidence → cinematic frame.
2. **It left the line "These are real plans, delivered to Melbourne agencies" sitting above
   AI-generated images captioned with real addresses** (45 English St, Craigieburn) and real
   figures (81,224 SQM). That is a specific false claim about identifiable places. Copy
   rewritten; the real figures now sit only on the real plans that actually carry them.
3. **It shipped the untrimmed 10.01 s video and hid the logo with JS** (`data-trim`). The
   markup still carried `loop`, so a single JS failure puts the logo back on screen. It also
   ships 25 % of a 3.6 MB file that never plays, and hard-cuts at the loop. Replaced with a
   physically trimmed **palindrome** (`measure-loop.mp4`, 2.68 MB) — the logo cannot appear,
   there is no JS dependency, and the loop is seamless by construction.

## 0c. ⛔ MUST-FIX BEFORE LAUNCH — AI-GENERATED FOOTAGE

`assets/video/ai-measure-reveal.mp4` (Chapter II hero) is **AI-generated** (Gemini/Veo,
supplied by the owner). It is deliberately prefixed `ai-` so it is greppable:
`ls assets/**/ai-*`.

- **The facility does not exist and every metric in it is invented** — "145,200 sqm GLA",
  "SITE 22.5 Ha", "42 Loading Bays", "17.5m Internal Clearance", "M80 Ring Road 3 min /
  Airport 17 / Port 34 / CBD 28", "Future Expansion +18,000 sqm". None of it is real.
- **A garbled AI logo-reveal ("DIGTIALL") faded in over the last ~0.75s** of the owner's
  source. It is an AI hallucination, not a provenance mark and not any real company's
  branding — the misspelling is the tell. **Removed by trimming the source at 9.15s**
  (measured: the logo starts fading at 9.25s; overlays clear by 8.65s, so 8.65–9.15s is the
  clean tail). Verified gone by scanning the centre region of every frame of the output.
- **No other watermark** — verified two ways (2.4× visual inspection of the final second,
  and a temporal-variance scan over 60 frames; a static overlay would show as a near-zero
  variance block. Nothing found).
- **Processing applied** (source: `Create_an_ultra_premium_cinema.mp4`, the wider of the two
  renders — better composed, though *neither* supplied file is HD; both are 1280×720):
  logo trimmed → grade (contrast 1.09, sat 1.07, mild gamma, vignette) → `unsharp` to counter
  720p softness → **palindrome loop** (forward + reversed = 18.33s, seamless *by construction*,
  no dissolve and no framing jump). 3.36 MB.
  **Do NOT re-add film grain to this clip** — the site already applies a global 5.5% CSS grain
  layer; doubling it is what made the first pass look buzzy/glitchy.
- **SynthID is present but invisible.** Google embeds it in the pixels. It does not affect
  appearance. **Do not attempt to strip it** — it is a provenance marker, and removing it is
  what turns "placeholder" into "passing AI work off as real photography."
- **Why this must not ship:** Ankkush's entire proposition is "this is real property I really
  photographed." AI footage of an invented facility with invented numbers on his portfolio is
  a direct credibility risk. It is fine as a demo comp to show him the *concept*; it is not
  fine live. Replace with his own site film (or licensed real footage) before launch.
- The on-screen caption already reads **"Indicative — demo footage"**; keep that until it is
  replaced.

**Chapter II's evidence gallery is the opposite** — those are Ankkush's REAL delivered
annotated plans (81,224 m², 158 m frontage, 4.047 ha, Leased). They are genuine, they are the
best material on the site, and they should stay.

---

## 1. THE MANDATE CHANGED — READ THIS FIRST

The owner has ruled: **this is a DEMO to win Ankkush's buy-in.** Use the best stock
imagery everywhere, including the hero. Design, animation, typography and the overall
experience are the deliverable. Once he approves, real assets get swapped in one by one.

> *"the best visually aesthetic professional rich expensive soothing experience, art"*

So ART-DIRECTION §7's "never stock in portfolio" is **suspended for the demo** and
reinstated before launch. Every borrowed frame is prefixed `stock-` so the swap set is
`ls assets/img/stock-*`. **Nothing with a `stock-` prefix may go live.**

Positioning to use in copy: **commercial and industrial exclusively — no residential.**
Do NOT write "the only one in Melbourne" — Urban Angles, Avian and Skycam are named
competitors in §11 and an unverifiable absolute invites challenge. Specialisation makes
the same point and survives scrutiny.

---

## 2. ASSETS ALREADY GENERATED — JUST USE THEM

All graded with one house grade (gentle filmic contrast, −12% sat, lifted toe, slight
warmth, vignette, grain). Dusk conversions follow the signature **measured from
Ankkush's own `016 → 016_d2d`**: highlights compressed, saturation pulled, shadows
blue-violet, highlights sodium-warm, glazing relit.

| Asset | For | Notes |
|---|---|---|
| `assets/video/stock-hero-arrival.mp4` | **I — Arrival** ✅ wired + verified | **The composite hero.** 0.93MB, 1600×900, 16.4s seamless palindrome. Fog over a transport corridor **dissolves to reveal Ankkush's real 65 McKellar building**, then breathes back to fog. Performs "Light. Measured." in footage: atmosphere → architecture. Keeps his real work as the payoff; stock fog is only the opener. Built from `stock-hero-dawn.mp4` (fog) + `hero-loop.mp4` (real McKellar) via ffmpeg xfade, both graded to one cool film look. Rebuild recipe: `scratchpad/*` — fog trim 0.6–5.9s, McKellar 0–4.26s, `xfade fade dur=1.4 offset=3.9`, then `reverse`+`concat` palindrome. |
| `stock-hero-poster-{800,1280,1600}.webp` | I ✅ wired | Frame 0 of the composite (fog) — matches the video exactly. |
| `assets/video/stock-hero-dawn.mp4` · `hero-loop.mp4` | sources | Kept as the composite's source clips. `hero-loop.mp4` is Ankkush's real McKellar (title-free verified). |
| `stock-measure-dusk-{700..1900}.webp` | **II — The Measure** | Top-down logistics centre, graded to late twilight. Dark, quiet, graphic — the field the annotation needs. |
| `stock-light-day-{700..1900}.webp` | **III — The Light** | |
| `stock-light-dusk-{700..1900}.webp` | **III — The Light** | **Same source image, both hours — pixel-perfect registration.** This is what makes the d2d slider work with stock. |
| `stock-work-{1..7}-{700,1000,1400}.webp` | **IV — The Work** | 1 vast symmetrical hall · 2 warehouse + roller doors · 3 columns/light pools · 4 huge empty floor · 5 warm industrial hall · 6 concrete exterior · 7 corridor with red lights |
| `stock-close-golden-1900.webp` | **V — The Close** | Sun risen over the same fog sea as the hero. |

### Chapter I hero — DONE and VERIFIED
Contrast harness (`scratchpad/harness.py`) run over **all 49 frames** of the composite,
at sun 0.00 and 0.20: headline worst **3.77:1** (gate 3.0 large-text, at the crisp-building
frame — the danger frame a screenshot can't catch), eyebrow 5.08, deck 7.36, chrome 10.66,
foot 12.38. All pass. Console clean. Every viewer, whatever frame they land on, gets
legible type. This is the check that failed to happen in v1.

### ⚠ One asset job outstanding
- **`stock-close-golden` only has the 1900 variant** — the 1400/1000/700 writes were
  killed by a command timeout. Regenerate (`scratchpad/build_assets.py`).

---

## 2b. SEO — WEAVE, DON'T BOLT ON (owner wants this)

Ankkush wants "commercial / industrial photography / videography / Melbourne" present
often, like sixthvision.com.au — **but the art stays sparse.** Rule: keep the giant
visible type pure (`Light. Measured.`, `81,224 SQM`), and load keyword density into the
surfaces crawlers read that don't clutter the design:

- **Eyebrows & section labels** — these are naturally descriptive, so make them
  keyword-rich: e.g. "Melbourne · Commercial & Industrial Photography, Film & Aerial"
  (already in Ch I). Every chapter gets one keyword-bearing eyebrow.
- **A visually-hidden phrase in each chapter's heading** (`<span class="vh">…</span>`) —
  full descriptive keyword sentence for crawlers/screen-readers, invisible to the eye.
  (In Ch I's `<h1>` already.) Legitimate, not cloaking — the text is truthful.
- **Alt text** — describe the real scene AND the service ("aerial site mapping of a
  Craigieburn industrial estate at dusk").
- **Section `<h2>`s** — phrase them so the visible words carry keywords where it's natural
  ("Every square metre, measured", "Commercial property, filmed").
- **Schema** — already keyword-complete in `index.html` head. Add `Service` items per
  chapter (photography, videography, aerial, floor plans, site mapping) as II–V land.

**COMMERCIAL highlight decision (settled):** header lockup keeps SIXTH VISION dominant with
COMMERCIAL in **full ink** (not faint grey) — highlighted by clarity, not size. The ONE
hero-scale COMMERCIAL moment belongs in the **Ch V footer** — the studio name set huge as a
sign-off. Do NOT enlarge COMMERCIAL in the header; a sub-brand descriptor that competes with
the master mark reads cheaper, not bigger.

## 3. THE ONE IDEA TYING IT TOGETHER

**Chapter I opens in fog before sunrise. Chapter V closes with the sun risen over that
same fog sea** — same location, same footage, two moments. The light journey literally
completes on one landscape. Keep this; it is the payoff for the whole `--sun` mechanic.

---

## 4. CHAPTERS II–V — WHAT'S DECIDED

Declare each chapter's light range on the section, exactly as Chapter I does:
`<section data-sun-from="..." data-sun-to="...">`.

| # | Chapter | `--sun` | Job |
|---|---|---|---|
| II | **The Measure** | .20 → .42 | ✅ **BUILT.** Intro → full-bleed film (the site stating its deal metrics) → editorial gallery of his REAL annotated plans, asymmetric with per-plate parallax + unmask reveals. **Lesson learned the hard way: do NOT draw survey lines onto a photo.** Two attempts (PIL static overlay, then an animated draw-on) both read as a discount real-estate flyer and were rejected. His own annotation IS the product and it is already professional — present it, don't imitate it. Stock has no equivalent (searched: returns plain aerials, paper maps, compasses). |
| III | **The Light** | .42 → .62 | The product, performed. Day/dusk slider on the registered pair. |
| IV | **The Work** | .62 → .82 | Proof. Editorial gallery, asymmetric, big. Seven images ready. |
| V | **The Close** | .82 → 1.0 | Convert. Golden. Sectors folded in, contact, footer. |

**Scroll-driven annotation needs a per-section progress value.** `light.js` already
computes section progress for `--sun` — extend it to also write `--p` (0→1) on elements
carrying `data-progress`, then drive `stroke-dashoffset` from it. ~10 lines.

---

## 5. TOOLING THAT WORKS (don't rediscover this)

- **Screenshots:** `scratchpad/cdpshot.js <url> <w> <h> <out.png> [dsf] [waitMs]`.
  Headless Chrome enforces a **~550px minimum window width**, so `--window-size=390,844`
  silently lays out at 526px and crops — which *fabricates mobile bugs that don't exist*.
  cdpshot uses CDP `Emulation.setDeviceMetricsOverride` and is correct. Zero deps.
- **Console + light-engine state:** `scratchpad/console.js <url>`.
- **Serve over HTTP** (`preview_start` → port 8131), never `file://` — over file:// the
  crossorigin font preloads are CORS-blocked and bury real errors in noise.
- **`?still=1`** renders the settled composition with no reveal animation — this is how
  layout gets judged. **`?sun=0.75`** forces a light stop for contrast checks.
- **Image sourcing:** `scratchpad/source.py` (Pexels + Unsplash, by shot brief),
  `source_video.py` (Pexels video). Keys in `.claude/.env`, gitignored.
  **Both APIs 403 without a `User-Agent` header.**
- **Bump `?v=` on every CSS/JS edit.** Currently `v=120`.

---

## 6. CORRECTION TO MY EARLIER REPORT

I previously flagged that the repo's `d2d-*` WebPs "do not look like genuine
day-to-dusk pairs." **That was wrong.** I judged from thumbnails. At full size,
`016 → 016_d2d` is a real conversion: replaced twilight sky, every interior light
switched on, highlights compressed. The repo assets are correct and Ankkush's real d2d
work is genuinely good — it is the honest option for Chapter III whenever the demo is
swapped back to real work.

---

## 7. SECURITY

`.claude/.env` holds Pexels + Unsplash keys and is gitignored. **The keys were pasted
in chat, so rotate both** (one click in each dashboard) once the demo is signed off.
