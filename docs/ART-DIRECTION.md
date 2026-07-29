# SIXTH VISION COMMERCIAL — ART DIRECTION
## "THE LIGHT CHANGES"

**Decide once. Execute everywhere. Do not design section-by-section.**
This document is the contract. If a decision isn't here, derive it from the concept below —
never invent locally.

---

## 1. THE CONCEPT

> **He does not sell photographs. He sells light.**

His signature deliverable is **day-to-dusk conversion** — he shoots at 2pm and delivers the
building glowing at twilight. That is the product. So the website *performs the product.*

**The entire page is one continuous light journey.** The visitor arrives in cool morning
light and descends through the day. Ground colour, photographic grade, shadow depth and
accent warmth all interpolate together as they scroll. By the contact section they are
standing in golden hour.

**This is not a gimmick bolted on. It is the business rendered as an experience.**

### Why this is the X-factor
- It is his literal craft, performed rather than described.
- Cinematic by definition — every film has a light arc; now this page has one.
- Radically minimal: one interpolating variable drives the whole system.
- Honours the owner's rule — **no dark grounds.** Dusk here is warm amber-cream, never black.
- No competitor in Melbourne commercial property media is doing anything like it.

### The line
> **Light. Measured.**
Two words. Light = his craft and this site's mechanic. Measured = the annotation service,
the precision, the restraint. Use it as the brand line everywhere.

---

## 2. THE LIGHT SCALE (the spine of everything)

One scroll-linked custom property, `--sun`, runs `0 → 1` across the document.
**Every colour in the system is derived from it.** Nothing is hard-coded per section.

| Stop | `--sun` | Ground | Feeling |
|---|---|---|---|
| **Dawn** | 0.00 | `#F4F5F3` cool porcelain | arrival, clarity, air |
| **Morning** | 0.25 | `#F7F6F2` neutral alabaster | the work begins |
| **Midday** | 0.50 | `#F8F5EE` warm paper | substance, proof |
| **Afternoon** | 0.75 | `#F6EFE2` amber cream | warmth, trust |
| **Golden** | 1.00 | `#F2E7D3` low gold | the close |

Ink warms in step: `#14161A` (dawn) → `#241C12` (golden) — never pure black.
Accent deepens: `#8A7A5E` (dawn) → `#7A5A22` (golden).
**Contrast is re-verified at every stop.** All text ≥ 4.5:1 at *all five* stops or the stop is wrong.

**Implementation:** interpolate `--sun` from scroll position, drive tokens with `color-mix()`.
Falls back to the Midday palette with no JS. `prefers-reduced-motion` → Midday, static.

---

## 3. TYPOGRAPHY

Two faces. Both self-hosted, both free for commercial use — **no dependency on anyone's
subscription.** (Adobe Fonts is for comping only; shipping it ties the client's site to
Pradeep's CC account.)

| Role | Face | Status | Why |
|---|---|---|---|
| **Display** | **Fraunces** | ✅ **IN REPO — 76KB subset** | Variable with `opsz 9–144` + `wght 100–900` + **SOFT** + **WONK** axes. The optical-size axis gives genuinely different letterforms at 160px vs 20px — real typography, not font-picking. Warm, editorial, confident. Reads gallery/A24, not Vogue. |
| **Utility** | **Hanken Grotesk** | ✅ **IN REPO — 23KB subset** | Invisible by design. Invisible typography is expensive typography. |

~99KB for the entire type system. **Zodiak/Switzer (Fontshare) were investigated and dropped**
— Fontshare blocks programmatic fetch (HTTP 406). Fraunces is the stronger choice regardless.
`newsreader-variable.woff2` (81KB) remains in the repo as a fallback display option.

**Scale — fixed, nothing between:** `160 · 120 · 96 · 72 · 60 · 48 · 32 · 24 · 20 · 18 · 16 · 14`
**Tracking — fixed:** hero `-.055em` · display `-.04em` · head `-.025em` · body `-.008em` · caps `.18em`
**Measure:** 58–64ch maximum. Never wider.

**The rule that fixes last build:** headlines are **huge** (120–160), body is **sparse**.
If a section has more than ~45 words of body copy, it is a brochure, not a gallery. Cut it.

---

## 4. LAYOUT PHILOSOPHY

**Image-led. Always.** Last build inverted this and that is precisely why it read as
$200 freelance work.

- **Full-bleed photography carries every chapter.** Type sits *on* or *beside* image — rarely alone on empty ground.
- **Asymmetry, not centred blocks.** Off-axis compositions, deliberate imbalance.
- **One idea per screen.** A chapter may occupy 2–3 viewport heights. Generous emptiness is the luxury; *timid* emptiness is the failure.
- **Hairlines, never shadows or rounded cards.** 1px rules at 13% ink.
- **Numbers are typography.** `81,224 SQM` set at 160 as an editorial statement — not a technical overlay. Measurement *is* the poetry here.

**Fewer, bigger chapters.** Five outstanding beats nine mediocre.

---

## 5. THE FIVE CHAPTERS (structure is final)

| # | Chapter | Light | Job |
|---|---|---|---|
| **I** | **Arrival** — full-bleed hero, the clean McKellar loop | Dawn | Stop them. "Light. Measured." |
| **II** | **The Measure** — his annotation craft as the signature moment | Morning | The differentiator, done beautifully |
| **III** | **The Light** — day→dusk slider, full-bleed, his REAL pair | Midday→Afternoon | The product, performed |
| **IV** | **The Work** — editorial gallery, asymmetric, big | Afternoon | Proof |
| **V** | **The Close** — sectors folded in, contact, footer | Golden | Convert |

**DELETED per owner: the "Price it in thirty seconds" estimate configurator.** Gone entirely.

---

## 6. FIXING "THE MEASURE" (was rated ULTRA BAD)

The idea is right; the execution failed. Diagnosis and fix:

| Failure | Fix |
|---|---|
| Gold lines vanished on a bright daylight aerial | **Use a dusk/low-light aerial as the base.** Annotation must sit on a dark, quiet field. |
| Labels clipped off image edges | **Safe margin: no annotation within 12% of any edge.** Verify at 5 viewport widths. |
| Thin, weak strokes | Heavier stroke, luminous — the line should feel *drawn in light* |
| Cold and technical | Warm the annotation to the champagne family; it is craft, not a HUD |
| Small type | The area figure is the hero: **large, editorial**, not a chip |

Consider building it full-bleed at 2 viewport heights, annotation drawing as it passes.

---

## 7. IMAGERY

- **Ankkush's real work everywhere it represents his work** — hero, portfolio, the d2d slider,
  the measure section. Non-negotiable. 137 graded WebP already in `assets/img/`.
- **Stock is permitted (owner approved) to raise the visual bar** — atmospherics, sector
  coverage he lacks (retail, hospitality, construction), texture. **Never** in portfolio,
  case studies, or the d2d slider.
- **Adobe Stock if credits exist** — ask; it beats Unsplash decisively. Brief exact shots.
- **The grade must follow `--sun`.** Images warm as the page descends —
  CSS `filter: sepia() saturate() hue-rotate()` layered subtly over the baked grade.
  This is what makes the light journey feel *real* rather than a background-colour trick.

---

## 8. MOTION — "camera, not CSS"

Everything must feel like a lens, never a slide transition.

- **Slow dolly** `cubic-bezier(.16,1,.3,1)`, 1.5–2.5s. Nothing snappy. Nothing bouncy.
- **Clip-path unmask** for images — they are revealed like a frame opening, not faded in.
- **Masked line reveals** for type — rises from behind an edge with ~1.4° rotation.
- **Micro-parallax 0.06–0.12 only.** Anything more reads cheap.
- **Film grain 5.5%**, animated. Felt, never seen.
- **No** GSAP, Lenis, scroll-hijack, magnetic cursor, WebGL. Performance *is* the proof —
  99/100 is what won the residential job. A 2MB bundle isn't expensive-feeling, it's expensive-to-load.

---

## 9. NON-NEGOTIABLE PROCESS RULES (these caused the last failure)

1. **LOOK AT IT.** The preview pane reports `visibilityState:"hidden"` → rAF ~1 frame/700ms,
   no scroll events, dead IO, screenshots time out. **Composite sections offline with PIL and
   `Read` the JPG — every 2–3 sections, not at the end.** Numbers are not art direction.
2. **Bump `?v=` on every CSS/JS edit.** Stale cache burned ~6 debug cycles last build.
3. **Content visible by default.** Hidden states only under `html.reveal-ready`, with a
   scroll-geometry sweep as primary and timed failsafes. A dead observer must never hide the page.
4. **Contrast-check at every light stop** before moving on.
5. **All filenames lowercase.** Verify on a case-sensitive host, not Windows.
6. **Build the design system + Chapter I completely, then stop and show the owner.**
   Do not build all five and reveal at the end. That is how nine mediocre sections happened.

---

## 10. THE TEST

Before shipping any chapter, ask:

> Would this frame hang in a gallery? Would a Melbourne leasing agent forward it to a
> client because it makes *their* asset look expensive?

If the honest answer is "it's fine" — it is not finished. **"Fine" is the enemy.**

---

# 11. ⛔ CRITICAL — REJECT THE "GOD-TIER" PROMPTS

Three elaborate master-prompts were supplied (2026-07-20) by other AIs. **Do not use any of them.**
They all brief Sixth Vision Commercial as a **licensed commercial real-estate AGENCY** —
"$500M+ transacted", "91% off-market deal flow", listings CMS, Deal Radar map, IM download
gating, yield calculator, and a footer declaring it *"a licensed real estate agent in VIC/NSW/QLD"*
with AFSL disclosures.

**Ankkush is a PHOTOGRAPHER.** He shoots commercial property *for* agencies. No listings,
no transactions, no licence.

Using those briefs would:
1. **Destroy his business** — Rutherfords, VICRE, Capital & Co., URI are his **CLIENTS**, not
   competitors. Positioning him as an agency makes him their competitor. He loses his client base.
2. **Constitute misrepresentation** — claiming to be a licensed real estate agent is regulated by
   Consumer Affairs Victoria.
3. **Fabricate proof** — invented case studies and dollar figures, for a brand whose entire
   credibility is "we show you the real numbers."

**His real competitors:** Urban Angles, Avian, Skycam. Not JLL/CBRE.

**What IS worth keeping from them (adopted):**
- **Banned clichés — never write:** passionate · bespoke · seamless · cutting-edge · world-class ·
  tailored solutions · customer-centric · industry-leading · innovative · end-to-end · synergy · trusted partner.
- **Zero placeholders.** Every word production-ready. No lorem, no "TBD".
- **Reason before writing.** Decide, then execute.
- **Challenge the brief** rather than obey it. (That principle is what caught this error.)

---

# 12. ADOBE CREATIVE CLOUD PRO — WHAT IS AND ISN'T USABLE

Owner has CC Pro. Researched and verified:

| Benefit | Verdict |
|---|---|
| **Adobe Fonts** (30,000+) | ⚠️ **COMPING ONLY.** Adobe forbids self-hosting; fonts must load from Adobe's servers, and *"your client's website must load Adobe Fonts through their own Creative Cloud subscription."* If Pradeep's subscription lapses, **Ankkush's typography breaks.** Never ship it. Audition **Freight Big Pro / Acumin Pro / Kepler** for ideas; avoid Trajan (film-poster cliché). |
| **Adobe Stock free collection** (1M+) | ✅ Usable, licensed for commercial use. Better curated than Unsplash. Owner must pull manually — no API access here. |
| **Firefly** (1000 credits/mo) | ✅ Legitimate for **Generative Expand** — extending Ankkush's real 3:2 aerials into ultra-wide cinematic crops, and removing distractions (bins, signage). ❌ **Never** generate fake property imagery for a photographer's portfolio. |
| **LinkedIn Premium** (3 mo free, partner perk) | ✅ Genuinely useful — for **ProddyG's** outreach, not this site. |

---

# 13. FONTS — CURRENT STATE (verified, in the repo)

- ✅ **`fraunces-variable.woff2` — 76KB, DOWNLOADED AND SUBSET.** Axes confirmed live:
  `opsz 9–144`, `wght 100–900`, **SOFT 0–100**, **WONK 0–1**. The optical-size axis means
  genuinely different letterforms at 160px vs 20px — that is real typography, not font-picking.
  **This is the display face.** Warm, editorial, confident; reads gallery/A24 not Vogue.
- ✅ **`hankengrotesk-variable.woff2` — 23KB, subset.** Keep as the utility face.
  Invisible by design; invisible typography is expensive typography.
- ✅ `newsreader-variable.woff2` — 81KB, subset. Fallback display option.
- ❌ **Fontshare (Zodiak/Switzer) blocks programmatic fetch (HTTP 406).** If wanted, the owner
  must download the zips manually from fontshare.com. Not a blocker — Fraunces is stronger.

**Total shipped type budget: ~99KB for the whole system.**

---

# 14. THE DUSK SOLUTION FOR "THE MEASURE" (do this — no stock needed)

The Measure failed because gold annotation vanished on a bright daylight aerial. The fix is
better than buying a stock dusk photo:

> **Apply his own day-to-dusk conversion to his own daylight aerial.**
> The section then *demonstrates the exact service he sells*, on his real work, with the dark
> base the annotation needs. Thematically perfect and completely honest.

Source: `Downloads\commercial\Photos\021.jpg` (clean industrial estate aerial).
Output: `assets/img/measure-dusk-{700,1000,1400,1900}.webp`

**Recipe (numpy/PIL — was written but not yet run):**
1. Exposure ×0.46 (~2.5 stops under daylight)
2. Filmic shoulder `a/(a+0.42)*0.86` — deepen without crushing
3. Split-tone: shadows `[0.86,0.94,1.22]` blue-violet · highlights `[1.22,1.06,0.86]` sodium-warm,
   mixed by `clip(lum*2.1,0,1)`
4. Horizon glow: `(clip(1-y*2.6,0,1)**1.7) * [0.20,0.11,0.035] * 0.85`
5. Relight windows: `emit=clip((lum-0.70)/0.30,0,1)`, tint `[1.0,0.80,0.52]`, GaussianBlur(9), add ×0.55
6. Vignette `1-0.30*clip(r,0,1)**1.9`
7. Grain σ=3.4/255
Then render a side-by-side proof JPG and **look at it** before using.

**Note:** Unsplash page-scraping stopped working (markup changed) — don't burn time on it.
Adobe Stock free collection or manual Unsplash download are the stock routes if ever needed.
