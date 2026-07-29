# ▶ LIVE CUTOVER RUNBOOK — sixthvisioncommercial.com.au

Build state at time of writing: **`?v=244`**, 97 referenced assets all serving 200,
JSON-LD valid, tags balanced, console clean, no horizontal overflow at 375px.

---

## 0. BEFORE YOU TOUCH DNS — the four owner confirmations

These are the only true blockers. Everything technical is done.

| # | Confirm with Ankkush | Why it matters |
|---|---|---|
| 1 | **The client list** — Steveway, Belle Property, Rutherfords, Harcourts were already public on his own site. Ray White, Barry Plant, LJ Hooker, Hockingstuart, O'Brien, Raine & Horne, Woodards, Professionals, YPA, ABC were **not** — they come from his delivered work. | Naming a client publicly without their OK can sour a working relationship. Ask him to strike any he'd rather not display. |
| 2 | **The four headline stats** — 10+ years, 1,000+ commercial properties, 24-hour delivery, CASA-certified. | They came from his own marketing, but he must stand behind them. **Also get the exact CASA credential** (Accreditation / RePL / ReOC) so the copy can name it precisely instead of the vague "CASA-certified". |
| 3 | **Placeholder imagery** — `ls assets/**/ai-*` and `ls assets/**/stock-*`. Currently 4 AI groups + 20 stock files. | Not launch-*blocking* (all are captioned honestly and none make a false claim about a real address), but every one is a frame that isn't his. |
| 4 | **Belle Property logo** — using the vector he supplied. | Quick eyeball that it's their current mark. |

⚠️ **Do NOT publish an aggregate review score.** His GBP reportedly has ~38 reviews, but I could
not verify the count or the average from here (wordofmouth 403s, GBP needs auth). Publishing an
unverified `aggregateRating` is both an ACL s18 risk and a Google structured-data violation.
The two/three **individual** reviews in the build are verified real and are already marked up
with `Review` schema — that is the safe, correct version. Add `aggregateRating` only once you
read the real number off his Google Business Profile.

---

## 1. PRE-FLIGHT (do these in order, ~30 min)

```bash
# 1. delete the build-only files that must not ship
rm og-card.html            # the OG card source (already rendered to assets/img/og.jpg)
rm -rf archive-v2 archive-25fps .tmp-chrome-*
rm before_measure.png desktop.png 2>/dev/null

# 2. confirm .claude/.env is NOT in the deploy (it holds API keys)
cat .gitignore             # must list .claude/

# 3. final asset + markup sweep
python - <<'PY'
import io,re,os,json
s=io.open('index.html',encoding='utf-8').read()
refs={p.strip().split(' ')[0].split('?')[0]
      for v in re.findall(r'(?:src|srcset|href|poster)="([^"]+)"',s)
      for p in v.split(',') if p.strip().startswith('assets/')}
print('missing:',[u for u in refs if not os.path.exists(u)] or 'none')
for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S): json.loads(m)
print('JSON-LD OK; assets:',len(refs))
PY
```

**Then validate externally (2 min, catches what local checks can't):**
- Rich Results Test → https://search.google.com/test/rich-results (paste the page source)
- Schema validator → https://validator.schema.org/
- OG preview → https://www.opengraph.xyz/ (checks the share card actually resolves)

---

## 2. DEPLOY (Cloudflare Pages — same as the residential site)

```bash
cd C:/Users/gawar/Downloads/sixthvision-commercial
git init && git add -A
git commit -m "Sixth Vision Commercial — full rebuild"
gh repo create kloudocean-kodex/sixthvision-commercial --private --source=. --push
```

Then in Cloudflare Pages: **Create project → Connect to Git → select the repo.**
- Framework preset: **None**
- Build command: *(leave empty)*
- Build output directory: **`/`**

Cloudflare Pages picks up `_headers` and `_redirects` automatically from the root — no config.

**Verify on the `*.pages.dev` URL BEFORE touching DNS.** Check: the hero video plays, the
day/dusk slider drags, the marquee scrolls, the footer is espresso, `/robots.txt` and
`/sitemap.xml` resolve, and a made-up URL like `/portfolio` 301s to `/#work`.

---

## 3. DNS CUTOVER (the only irreversible step)

⚠️ **The domain currently sits with the compromised GoDaddy account** (see the project memory).
Confirm who controls DNS **before** cutover day, or you will be locked out mid-switch.

1. **Lower the TTL to 300s at least 24h beforehand** on the existing records. This is the single
   thing that makes a rollback fast instead of a day-long wait.
2. Cloudflare Pages → Custom domains → add `sixthvisioncommercial.com.au` **and** `www`.
3. Point the apex + `www` at the Pages target as Cloudflare instructs.
4. Wait for the certificate to issue (usually minutes; can be up to an hour).
5. Confirm `https://` works on both apex and `www`, and that one redirects to the other.

**Rollback:** revert the DNS records to the old host. With a 300s TTL you are back within ~5
minutes. Keep a copy of the current DNS records (screenshot the zone) before changing anything.

---

## 4. IMMEDIATELY AFTER GOING LIVE (same day)

```
□ Google Search Console → add the property → submit https://sixthvisioncommercial.com.au/sitemap.xml
□ GSC → URL Inspection → "Request indexing" on the homepage
□ Confirm the old indexed URLs 301 (test /portfolio, /contact, /real-estate-photography)
□ Google Business Profile → update the website link → make sure it points to the new site
□ Update the website link on Instagram, Facebook and YouTube
□ Run PageSpeed Insights on the LIVE url (mobile + desktop) and record the real numbers
□ Send a test enquiry through every contact path: tel:, mailto:, WhatsApp
```

**That last one is the most important line in this document.** The site being replaced has
contact links that point to the wrong phone and the wrong inbox. Do not repeat it — click every
single one on a real phone after go-live.

---

## 5. FIRST WEEK

```
□ Rotate the Pexels + Unsplash API keys (they were pasted in chat) — 2 minutes, no reason to wait
□ Set up a domain email (hello@sixthvisioncommercial.com.au) and swap it in
□ GSC: check Coverage for any 404s the redirects missed
□ Swap in real photography for the highest-visibility placeholders first:
  1. the Chapter I hero video     2. the Chapter III dusk    3. the Chapter IV lead
□ Ask Ankkush for 2–3 more named reviews → drop into the existing pullquote grid
□ Read the real GBP rating + count → only then consider aggregateRating schema
```

---

## 6. DO / DON'T — the standing rules for this codebase

**DO**
- **Bump `?v=` on every CSS/JS edit.** `/assets/*` is cached immutable for a year by `_headers`.
  Forget this and returning visitors keep the old file until 2027.
- **Verify by eye with real screenshots**, not by reading computed values. Numbers can be right
  while it looks wrong — the recurring failure mode on this project.
- **Use `scratchpad/footshot.js <url> <out> <selector>`** for anything below ~16,000px. The page
  is ~18,000px tall, past Chrome's full-page capture limit — `shotfull.js` returns white below it.
- **Prefix every borrowed frame** `stock-` and every AI frame `ai-`, always, so
  `ls assets/**/ai-*` stays a truthful pre-launch check. Two files silently lost their prefix
  during a rename and the check went blind.
- Keep the light system honest: everything derives from `--sun`.

**DON'T**
- **Don't use `--accent` or `--accent-ink` as a background.** They are text-contrast tokens and
  render as a dirty patch. Fills use `--ground-deep` / the `--glass-*` tokens.
- **Don't put a `--sun`-driven CSS filter on a video.** `--sun` changes every scroll frame, so the
  filter re-evaluates per frame over live decoded video. That is a direct cause of stutter.
- **Don't re-encode a video without checking the frame rate divides into 60.** Run
  `python scratchpad/mp4info.py <file>` — it prints the verdict. 25 and 24 fps both judder.
- **Don't add film grain over the video.** There is already a global 5.5% CSS grain layer.
- **Don't invent numbers.** No fabricated review counts, lost-enquiry figures, or performance
  stats. Every claim on this site traces to something real — keep it that way.
- **Don't put `clip-path` on an element that owns a `box-shadow`** — it clips its own shadow.
  That is why `.plate__win` / `.measure__filmwin` / `.work__win` exist as separate elements.
