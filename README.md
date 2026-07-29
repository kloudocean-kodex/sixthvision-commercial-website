# Sixth Vision Commercial — v255

Static site. No framework, no npm, no runtime dependencies. Python 3 builds it.

---

## ⚠️ READ THIS BEFORE YOU DEPLOY

**The Cloudflare Pages build output directory must change from `/` to `dist`.**

If you skip this, Pages will serve the repository root, which no longer contains
`index.html` — the site will 404.

In the Cloudflare dashboard → Pages → your project → **Settings → Builds & deployments**:

| Setting | Old value | New value |
|---|---|---|
| Build command | *(empty)* | `python3 build.py` |
| Build output directory | `/` | `dist` |
| Root directory | `/` | `/` (unchanged) |

If you'd rather not run a build step on Pages at all, run `python3 build.py`
locally, commit `dist/`, and set the output directory to `dist` with an empty
build command. Either works. The output directory change is not optional.

---

## Why the structure changed

v254 deployed the repository root. Two problems came out of that:

1. **67 KB of unused CSS was published to the CDN.** `index.html` loads the
   concatenated `app.css`; the six chapter stylesheets sat next to it, publicly
   fetchable and loaded by nothing. Worse, editing one of them changed nothing
   on the live site — a silent trap for whoever touches this next.

2. **`app.css` had drifted from its own sources.** It contained a seventh
   module, `enterprise-cro-additions`, whose source file was missing from the
   repository entirely — every rule for the floating CTA, the brief modal and
   the brief form lived only inside the built artifact. It had also been
   hand-edited: `align-items:center` on `.footer__legal`, the two
   `a[href*="proddyg.com"]` rules and a `@media (max-width:768px)` footer
   padding rule existed in the bundle and in no source file.

   Regenerating `app.css` from the six known chapter files would have silently
   stripped the styling from the entire lead-capture UI and the ProddyG credit.

Both are fixed. `src/` is now the single source of truth, `dist/` is generated
and disposable, and the build fails loudly if a module is missing.

---

## Layout

```
src/                     ← EDIT HERE
  index.html  404.html
  css/                   7 modules, concatenated in build.py's CSS_MODULES order
    system.css           design tokens — everything derives from --sun
    chapter-i…v.css
    enterprise-cro-additions.css   floating CTA, brief modal, brief form
  js/light.js            the light engine

static/                  ← copied to dist/ verbatim
  assets/img/            85 webp + og.jpg + favicon.svg
  assets/fonts/          3 subset woff2
  assets/video/          2 clips × (mp4 + webm)
  _headers  _redirects  robots.txt  sitemap.xml

dist/                    ← GENERATED. Never edit. Never commit by hand.
build.py                 the build
docs/                    art direction, handoff, cutover notes
```

## Build

```bash
python3 build.py
```

No dependencies beyond the standard library. It concatenates the CSS modules,
minifies CSS/JS/HTML conservatively, copies `static/`, and rewrites the
`__HASH_*__` tokens in the HTML with a content hash of each built asset.

## Cache busting is now automatic

`_headers` marks `/assets/*` `immutable, max-age=31536000`. That is only safe if
the URL changes when the bytes change. v254 relied on hand-bumping `?v=254`, and
its own comment warned that forgetting would pin a stale asset for a year.

The build now derives `?v=` from a SHA-256 of the built file. Change a
stylesheet, the hash changes, the URL changes, the cache is bypassed. Forgetting
is no longer possible.

## Minification is deliberately conservative

Comments and indentation go; token structure does not. Two reasons:

- After Brotli, aggressive minification saves roughly 8 KB on a page that was
  carrying 4 MB of video. It was never the bottleneck.
- The stylesheet is 93 KB of nested `color-mix()` driven by one custom property.
  While writing this build, a naive minifier produced
  `calc(1+var(--sun))` (invalid — would have killed the entire light engine),
  `saturate(…)sepia(…)` (invalid filter list — would have killed the photo
  grading), and turned `:nth-child(1) .work__win` into `:nth-child(1).work__win`
  (a different selector). All three are now explicitly guarded against in
  `minify_css`, with comments explaining why.

**Source comments are never stripped from `src/`.** They are the best
documentation in this codebase.

## Verifying a change

```bash
python3 build.py
node --check dist/assets/js/light.js
```

For CSS, the meaningful check is that `dist/assets/css/app.css` still contains
every rule the previous bundle did. `docs/` records the v255 reconciliation.
