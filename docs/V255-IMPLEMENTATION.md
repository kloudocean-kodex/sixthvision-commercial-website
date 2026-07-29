# v255 — Audit Implementation Record

Every change made against the performance audit, what was verified, and — just
as important — what was **not** done and why.

---

## Headline result

| | v254 | v255 (AV1 browsers) | v255 (H.264 fallback) |
|---|---:|---:|---:|
| Video forced on first load | 3,652 KB | 545 KB | 726 KB |
| Fonts | 182 KB | 156 KB | 156 KB |
| Posters | 171 KB | 171 KB | 171 KB |
| HTML + CSS + JS (compressed) | ~44 KB | ~40 KB | ~40 KB |
| **Non-lazy first-load total** | **~4,049 KB** | **~912 KB** | **~1,093 KB** |
| At Lighthouse mobile 1.6 Mbps | ~20.2 s transfer | ~4.6 s | ~5.5 s |

**A 73–77% reduction in first-load payload.** Effectively all of it comes from
one deleted line of JavaScript. Everything else is single-digit percentages.

---

## 1. The video preload override — THE fix

`light.js` set `v.preload = 'auto'` on every `[data-hero]` video at startup,
overriding the `preload="metadata"` attribute the HTML carefully declared. Both
videos downloaded in full on first paint, including the 2.7 MB loop twelve
screens below the fold. The IntersectionObserver alongside it governs
*playback*, never *transfer*, so it could not prevent this.

**Now:** `preload` is left exactly as the HTML declares it, and promoted to
`auto` only when a video approaches the viewport, with `rootMargin:
'0px 0px 300px 0px'` giving the below-fold clip a 300px runway. The hero is
already intersecting at load, so it promotes immediately — visually identical.

`promote()` also calls `video.load()` when `readyState < 3`, because changing
`preload` after an element has settled on `metadata` does not restart buffering
in every engine on its own.

**Verified** by executing the shipped, minified `light.js` under a DOM harness:

```
preload at startup                : ["metadata","metadata"]   PASS
after hero intersects             : ["auto","metadata"]       PASS
after below-fold intersects       : ["auto","auto"]           PASS
```

## 2. The rAF loop no longer duplicates the observer

`frame()` called `getBoundingClientRect()` on every un-revealed `[data-rise]`,
`[data-line]` and `[data-unmask]` — 99 elements — plus 17 parallax nodes, every
animation frame. The IntersectionObserver fifty lines below computed the same
intersections off the main thread for free.

The reveal loop is deleted from `frame()`. The observer is now the sole owner of
reveals; `sweep()` remains as the on-load catch-up (3 calls total, not per
frame) and `revealAll()` at 2600 ms as the safety net. A `scroll`-driven
`sweep()` fallback was added for engines without IntersectionObserver — without
it, removing the rAF path would have left those browsers blank until 2600 ms.

**Per-frame layout reads: ~116 → 17.**

## 3. Per-frame DOM query and unconditional class write

`document.querySelector('.floating-cta')` ran 60×/second for a static element —
hoisted to module scope. Its `classList` was written every frame regardless of
state change — now gated on a transition, the same discipline already applied to
`--sun` and `--p` but never extended down here.

## 4. The form no longer reports failure as success

Three separate defects, all commercially damaging on a lead-generation site:

- The `.catch` block printed the **identical success message** as `.then`. A
  network drop or DNS failure told the agent "We Will Call You" and lost the
  lead silently.
- `.then` never inspected the response body. Web3Forms returns HTTP 200 with
  `{"success": false}` for an invalid, revoked or over-quota access key — so in
  precisely the scenario where *every* lead is being dropped, the UI reported
  success.
- `generate_lead` fired on `submit`, before the request resolved. GA4 was
  counting intent, not delivery.

**Now:** `data.success !== true` throws; the catch shows a real failure state and
surfaces the phone number, which is the fallback conversion path; `generate_lead`
fires only on confirmed success; a `brief_submit_failed` event is emitted so
failures become visible in analytics instead of invisible.

Also added: an `aria-live` status region (there was none — a screen-reader user
got no submit feedback in either direction), a focus trap (the modal leaked
focus to the page behind it, failing WCAG 2.4.3), focus restoration on close,
and `aria-modal="true"`.

## 5. Videos re-encoded

Settings chosen by measuring SSIM against the originals, not by guessing.

| File | v254 | v255 mp4 | v255 webm (AV1) | SSIM (mp4) |
|---|---:|---:|---:|---:|
| `stock-hero-arrival` | 930 KB | 726 KB | 545 KB | 0.985 |
| `ai-measure-loop` | 2,743 KB | 1,248 KB | 1,011 KB | 0.956 |

All audio stripped (`-an`) — both clips are `muted loop`, so the audio stream was
pure waste. `-movflags +faststart` retained.

Two findings worth recording:

- **The hero was already well encoded.** Re-encoding at crf 28 produced a file
  *larger* than the original. A CRF ladder with SSIM measurement showed crf 32 at
  `preset slow` gives 726 KB at SSIM 0.985 — smaller *and* higher quality than
  crf 29 at `preset veryfast`. Preset matters more than CRF here.
- **AV1 was rejected for the loop at first.** At crf 42 it came out *larger* than
  the H.264 file. Since browsers take the first supported `<source>`, shipping it
  would have made things worse. Pushed to crf 48, it wins by 19% and was kept.
  The check is in the record because the instinct "AV1 is always smaller" is
  wrong on high-motion aerial footage at fast presets.

WebM is listed first in both `<video>` elements so AV1-capable browsers take the
smaller file; H.264 remains the universal fallback. `media-src 'self'` in the CSP
already covers same-origin WebM — no header change needed.

## 6. Fonts subset — and an honest correction

| File | v254 | v255 | Saved |
|---|---:|---:|---:|
| `fraunces-variable.woff2` | 76.9 KB | 76.5 KB | 0.7% |
| `fraunces-italic.woff2` | 79.6 KB | 62.3 KB | 21.8% |
| `jost-variable.woff2` | 25.9 KB | 17.2 KB | 33.7% |
| **Total** | **182.4 KB** | **156.0 KB** | **14.5%** |

**The audit predicted 183 KB → ~60 KB. That was wrong**, and the reason matters.

The audit assumed these were full-charset fonts carrying Cyrillic and Greek
coverage. They were not — `fraunces-variable` already shipped with just 110
codepoints. Its 77 KB is almost entirely `gvar` variation deltas across four
axes (`opsz`, `wght`, `SOFT`, `WONK`), not glyph outlines, so cutting characters
barely moves it. All four axes are actively driven by 25 `font-variation-settings`
declarations, so none can be pinned. `fraunces-italic` gave back a real 22%
because it carried 223 glyphs for a face used on a handful of words.

The subset was built from the site's actual rendered text (83 distinct
characters) plus full printable ASCII as a robustness floor, so future copy edits
cannot lose a glyph.

**A near-miss worth recording:** the first subsetting pass stripped the `tnum`
(tabular numerals) feature. `font-feature-settings:'tnum' 1` appears in **eight**
CSS rules — on `.measure__leadfig` and every numeral element. That would have
silently broken the alignment of every measurement figure on a site whose entire
pitch is *measured* property data. `tnum` is now explicitly retained, and a
regression test proves no character the site renders was lost:

```
fraunces-variable  orig=110  subset=106   LOST-BUT-USED: none
fraunces-italic    orig=223  subset=123   LOST-BUT-USED: none
jost-variable      orig=221  subset=123   LOST-BUT-USED: none
```

## 7. GA4 off the critical path

`gtag.js` was requested *before* the stylesheet. `async` meant it didn't block
parsing, but the request was still issued first, competed with render-blocking
CSS, and cost main-thread time parsing ~90 KB during the LCP window.

The `gtag()` shim and `dataLayer` are still defined immediately, so any event
fired before the tag loads is buffered and replayed — **nothing is lost**. Only
the network fetch waits for `load`. `dns-prefetch` rather than `preconnect`,
deliberately: we do not want a TLS handshake opened during the critical window
for a request we've chosen to defer.

## 8. Form input attributes

`autocomplete="name"` / `"organization"` / `"email"` / `"street-address"`, plus
`inputmode="email"` and `autocapitalize`/`autocorrect`/`spellcheck` off on the
contact field. `type="text"` is retained there on purpose — the field accepts an
email *or* a phone number, and `type="email"` would wrongly reject
`0400 000 000`.

## 9. Build system

See `README.md`. Source moved to `src/`, output to `dist/`, content-hash cache
busting, and the recovery of the orphaned CSS module described there.

## 10. Minification

93.9 KB CSS → 53.8 KB, 23.2 KB JS → 11.8 KB (before Brotli, which Cloudflare
applies on top). Marginal, as the audit predicted — and it nearly cost more than
it saved. Three bugs were caught in the minifier during verification, each of
which would have shipped broken CSS:

1. `calc(1 + var(--sun))` → `calc(1+var(--sun))` — invalid; would have killed
   the entire `--sun` light engine site-wide.
2. `saturate(…) sepia(…)` → `saturate(…)sepia(…)` — invalid filter list; would
   have killed the photo colour grading on every image.
3. `:nth-child(1) .work__win` → `:nth-child(1).work__win` — a descendant
   combinator silently collapsed into a compound selector.

All three are now guarded, with the reasoning in comments. The build was then
verified with a context-aware CSS parser comparing the rebuilt bundle against the
original rule-by-rule, including `@media` and `@supports` context:

```
rules missing     : NONE
unexpected extras : NONE
declaration drift : NONE
```

---

## Deliberately NOT done

### `--sun` architecture rewrite (audit §3, item 10)

Not implemented, on purpose. The audit's own recommendation was **measure
first** — and doing it blind means rewriting 112 `color-mix()` chains that
produce the one thing this site sells.

The quantisation already in place (400 discrete steps, skip-if-unchanged) is the
correct mitigation. Whether the remaining cost justifies scoping `--sun` to the
current chapter, or precomputing the five light stops and interpolating three
plain RGB integers, is answerable only from a Performance profile taken *after*
fixes 1–4 land. Those fixes removed ~85% of per-frame layout work and ~3 MB of
bandwidth contention; the profile will look nothing like the one that motivated
the suggestion.

Implementing an architectural rewrite I'd just argued against, without the
measurement that would justify it, would be the wrong call. Profile it, then
decide. My expectation is it turns out to be unnecessary.

### `meta name="keywords"`

Left in place. Ignored by every major engine, ~350 bytes, and outside the scope
of the audit. Harmless either way.

### hCaptcha on the brief form

Not added. The Web3Forms access key is public by design and therefore
scrapeable; the `botcheck` honeypot stops naive bots only. Adding hCaptcha is a
real anti-spam measure, but it puts a challenge in front of the primary
conversion path. That is a business trade-off, not a technical one — enable it in
the Web3Forms dashboard *if* spam becomes an actual problem, not pre-emptively.

---

## Corrections to the original audit

Recorded because the audit is wrong on these points and someone will read it later:

1. **`faststart` was already correct.** The audit said to check whether the
   `moov` atom was at the front. It was, on both files. No fix was needed.
2. **The font saving was overestimated by roughly 3×.** 183 KB → 156 KB, not
   → 60 KB. Reasoning in §6 above.
3. **The hero video did not need re-encoding for size reasons.** It was already
   efficiently encoded at 544 kbps. It was still re-encoded because measurement
   showed a genuine 22% win at *higher* measured quality — but the audit's
   framing of both videos as bloated was accurate for the loop only.
4. **`app.css` was not a clean concatenation.** The audit credited it for
   avoiding an `@import` waterfall, which is true and still worth crediting. But
   it had drifted from its sources and contained a module with no source file at
   all — a far more serious problem than the dead files the audit did flag, and
   one the audit missed.

---

## After you deploy

1. **Change the Pages output directory to `dist` first.** See `README.md`.
2. Load the site and open DevTools → Network, throttled to mobile 4G. The 2.7 MB
   loop should be **absent** from the initial burst entirely. If it is still
   there, the `preload` fix did not take.
3. Confirm the LCP element in DevTools → Performance. It should be
   `stock-hero-poster-1600.webp` at 51 KB.
4. **Submit a real test brief and confirm it arrives in the inbox.** Given the
   defects in §4, do not assume the historical GA4 conversion count reflects
   delivered leads.
5. Scroll to the measure chapter and confirm the video plays — it now buffers on
   approach rather than at page load, so there is a 300px runway rather than a
   pre-loaded file.
6. CrUX field data will populate after ~28 days of real traffic. That, not the
   lab score, is what search ranks on.
