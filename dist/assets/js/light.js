(() => {
'use strict';
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let forced = null;
const m = /[?&]sun=([0-9.]+)/.exec(location.search);
if (m) {
forced = Math.max(0, Math.min(1, parseFloat(m[1])));
root.style.setProperty('--sun', forced);
}
const chapters = Array.from(document.querySelectorAll('[data-sun-from]')).map(el => ({
el,
from: parseFloat(el.getAttribute('data-sun-from')),
to: parseFloat(el.getAttribute('data-sun-to'))
}));
const targets = Array.from(document.querySelectorAll('[data-rise],[data-line],[data-unmask]'));
const parallax = Array.from(document.querySelectorAll('[data-parallax]'));
const progress = Array.from(document.querySelectorAll('[data-progress]'));
const floatingCta = document.querySelector('.floating-cta');
let lastCtaVisible = null;
let ticking = false;
let idleAt = 0;
let scrollY = 0;
let lastPar = -1;
let lastSun = -1;
const lastProgress = [];
const compareSizers = [];
function sizeCompares() { for (let i = 0; i < compareSizers.length; i++) compareSizers[i](); }
function revealAll() {
targets.forEach(el => el.classList.add('is-in'));
progress.forEach(el => el.style.setProperty('--p', '1'));
}
if (reduce) {
revealAll();
initInteractions();
return;
}
const still = /[?&]still=1/.test(location.search);
if (!still) {
root.classList.add('reveal-ready');
setTimeout(sweep, 120);
setTimeout(sweep, 700);
setTimeout(revealAll, 2600);
if (document.visibilityState === 'hidden') revealAll();
}
function measureChapters() {
for (let i = 0; i < chapters.length; i++) {
chapters[i].top = chapters[i].el.offsetTop;
chapters[i].h = chapters[i].el.offsetHeight || 1;
}
}
function sunAt(head) {
if (!chapters.length) return 0.5;
const first = chapters[0];
const last = chapters[chapters.length - 1];
for (let i = 0; i < chapters.length; i++) {
const c = chapters[i];
const top = c.top, h = c.h || 1;
if (head < top) return i === 0 ? first.from : chapters[i - 1].to;
if (head < top + h) {
const t = (head - top) / h;
return c.from + (c.to - c.from) * (t < 0 ? 0 : t > 1 ? 1 : t);
}
}
return last.to;
}
measureChapters();
addEventListener('load', () => { measureChapters(); setTimeout(measureChapters, 1200); });
let reMeasure;
addEventListener('scroll', () => {
clearTimeout(reMeasure);
reMeasure = setTimeout(measureChapters, 250);
}, { passive: true });
function sweep() {
const vhNow = window.innerHeight;
const pending = [];
for (let i = 0; i < targets.length; i++) {
const el = targets[i];
if (el.classList.contains('is-in')) continue;
if (el.getBoundingClientRect().top < vhNow * 0.88) pending.push(el);
}
for (let i = 0; i < pending.length; i++) pending[i].classList.add('is-in');
}
function frame() {
scrollY = window.pageYOffset || root.scrollTop;
const vhNow = window.innerHeight;
const head = scrollY + vhNow / 2;
const sun = forced === null ? sunAt(head) : forced;
const progressValues = [];
for (let pi = 0; pi < progress.length; pi++) {
const r = progress[pi].getBoundingClientRect();
const p = (vhNow * 0.82 - r.top) / (vhNow * 0.48);
progressValues.push(p < 0 ? 0 : p > 1 ? 1 : p);
}
const parallaxOffsets = [];
const shouldUpdateParallax = parallax.length && lastPar !== scrollY;
if (shouldUpdateParallax) {
const limit = Math.min(56, vhNow * 0.07);
for (let k = 0; k < parallax.length; k++) {
const el2 = parallax[k];
if (el2.tagName && el2.tagName.toLowerCase() === 'video') {
parallaxOffsets.push(null);
continue;
}
const rate = parseFloat(el2.getAttribute('data-parallax')) || 0.08;
const rect = el2.getBoundingClientRect();
const o = (rect.top + rect.height / 2 - vhNow / 2) * -rate;
parallaxOffsets.push(Math.max(-limit, Math.min(limit, o)));
}
}
const wantCta = scrollY > vhNow * 0.7;
if (forced === null) {
const q = Math.round(sun * 400) / 400;
if (q !== lastSun) { lastSun = q; root.style.setProperty('--sun', q.toFixed(4)); }
}
for (let pj = 0; pj < progress.length; pj++) {
const qp = Math.round(progressValues[pj] * 200) / 200;
if (qp !== lastProgress[pj]) {
lastProgress[pj] = qp;
progress[pj].style.setProperty('--p', qp.toFixed(3));
}
}
if (shouldUpdateParallax) {
for (let k2 = 0; k2 < parallax.length; k2++) {
if (parallaxOffsets[k2] !== null) {
parallax[k2].style.transform = `translate3d(0,${parallaxOffsets[k2].toFixed(2)}px,0)`;
}
}
lastPar = scrollY;
}
if (floatingCta && wantCta !== lastCtaVisible) {
lastCtaVisible = wantCta;
floatingCta.classList.toggle('is-visible', wantCta);
}
}
function loop() {
frame();
if (Date.now() < idleAt) {
requestAnimationFrame(loop);
} else {
ticking = false;
}
}
function kick() {
scrollY = window.pageYOffset || root.scrollTop;
idleAt = Date.now() + 500;
if (!ticking) {
ticking = true;
requestAnimationFrame(loop);
}
}
let resizeRaf;
addEventListener('resize', () => {
if (resizeRaf) cancelAnimationFrame(resizeRaf);
resizeRaf = requestAnimationFrame(() => {
measureChapters();
sizeCompares();
kick();
});
}, { passive: true });
addEventListener('scroll', kick, { passive: true });
addEventListener('load', kick);
kick();
if ('IntersectionObserver' in window) {
const io = new IntersectionObserver((entries) => {
for (let i = 0; i < entries.length; i++) {
if (entries[i].isIntersecting) {
entries[i].target.classList.add('is-in');
io.unobserve(entries[i].target);
}
}
}, { rootMargin: '0px 0px -12% 0px' });
targets.forEach(t => io.observe(t));
} else {
addEventListener('scroll', sweep, { passive: true });
}
initInteractions();
function initInteractions() {
const vids = Array.from(document.querySelectorAll('video[data-hero]'));
vids.forEach(v => {
v.muted = true;
v.playsInline = true;
});
function playVideo(video) {
const go = () => {
const p = video.play();
if (p && p.catch) p.catch(() => {});
};
if (video.readyState >= 3) {
go();
} else if (!video.__waiting) {
video.__waiting = true;
video.addEventListener('canplaythrough', () => {
video.__waiting = false;
go();
}, { once: true });
setTimeout(() => { if (video.__waiting) { video.__waiting = false; go(); } }, 2500);
}
}
function promote(video) {
if (video.preload !== 'auto') {
video.preload = 'auto';
if (video.readyState < 3) video.load();
}
}
if ('IntersectionObserver' in window) {
const videoObserver = new IntersectionObserver((entries) => {
for (let i = 0; i < entries.length; i++) {
const entry = entries[i];
const video = entry.target;
if (entry.isIntersecting && !document.hidden) {
promote(video);
playVideo(video);
} else {
video.pause();
}
}
}, { threshold: 0.08, rootMargin: '0px 0px 300px 0px' });
vids.forEach(v => videoObserver.observe(v));
} else {
vids.forEach(v => { promote(v); playVideo(v); });
}
document.addEventListener('visibilitychange', () => {
if (document.hidden) {
vids.forEach(v => v.pause());
} else {
ticking = false;
kick();
vids.forEach(v => { if (v.preload === 'auto') playVideo(v); });
}
});
document.querySelectorAll('.compare').forEach(c => {
const win = c.querySelector('.compare__win');
const after = c.querySelector('.compare__after');
const afterImg = after ? after.querySelector('img') : null;
const bar = c.querySelector('.compare__bar');
if (!win || !after || !bar) return;
win.setAttribute('role', 'slider');
win.setAttribute('aria-label', 'Day to dusk lighting comparison');
win.setAttribute('aria-valuemin', '0');
win.setAttribute('aria-valuemax', '100');
win.setAttribute('tabindex', '0');
function size() {
if (afterImg) afterImg.style.width = `${win.getBoundingClientRect().width}px`;
}
function set(p) {
p = p < 0 ? 0 : p > 1 ? 1 : p;
const pct = `${(p * 100).toFixed(2)}%`;
after.style.width = pct;
bar.style.left = pct;
const valNow = Math.round(p * 100);
win.setAttribute('aria-valuenow', valNow.toString());
win.setAttribute('aria-valuetext', `${valNow}% dusk`);
}
function fromX(x) {
const r = win.getBoundingClientRect();
set((x - r.left) / r.width);
}
compareSizers.push(size);
size();
if (afterImg && !afterImg.complete) {
afterImg.addEventListener('load', size, { once: true });
}
let down = false;
win.addEventListener('pointerdown', (e) => {
down = true;
try { win.setPointerCapture(e.pointerId); } catch (err) {}
fromX(e.clientX);
e.preventDefault();
});
win.addEventListener('pointermove', (e) => { if (down) fromX(e.clientX); });
win.addEventListener('pointerup', () => { down = false; });
win.addEventListener('pointercancel', () => { down = false; });
win.addEventListener('keydown', (e) => {
const cur = parseFloat(after.style.width) || 50;
if (e.key === 'ArrowLeft') { set((cur - 4) / 100); e.preventDefault(); }
else if (e.key === 'ArrowRight') { set((cur + 4) / 100); e.preventDefault(); }
else if (e.key === 'Home') { set(0); e.preventDefault(); }
else if (e.key === 'End') { set(1); e.preventDefault(); }
});
set(0.5);
});
function gpEvent(name, params) {
if (typeof window.gtag !== 'function') return;
window.gtag('event', name, params || {});
}
function gpCtaLocation(el) {
if (el.closest('.chrome')) return 'header';
if (el.closest('.close__cta')) return 'closing_cta';
if (el.closest('.site-footer')) return 'footer';
if (el.closest('.floating-cta')) return 'floating_cta';
return 'page';
}
[
['a[href^="tel:"]', 'phone_click', 'phone'],
['a[href^="mailto:"]', 'email_click', 'email'],
['a[href*="wa.me/"]', 'whatsapp_click', 'whatsapp']
].forEach(([selector, eventName, channel]) => {
document.querySelectorAll(selector).forEach(link => {
link.addEventListener('click', () => {
gpEvent(eventName, {
event_category: 'commercial_intent',
contact_channel: channel,
cta_location: gpCtaLocation(link)
});
});
});
});
const modal = document.querySelector('.brief-modal');
if (!modal) return;
const openBtns = document.querySelectorAll('[data-open-brief]');
const closeBtns = document.querySelectorAll('.brief-modal__close, .brief-modal__backdrop');
let lastFocused = null;
const openModal = (e) => {
if (e) e.preventDefault();
lastFocused = document.activeElement;
modal.classList.add('is-open');
modal.removeAttribute('aria-hidden');
document.body.style.overflow = 'hidden';
const firstInput = modal.querySelector(
'.brief-form__input, .brief-form__select, .brief-form__textarea'
) || modal.querySelector('.brief-modal__close');
if (firstInput) firstInput.focus();
if (typeof window.gtag === 'function') {
window.gtag('event', 'open_brief_modal', { event_category: 'engagement' });
}
};
const closeModal = () => {
modal.classList.remove('is-open');
modal.setAttribute('aria-hidden', 'true');
document.body.style.overflow = '';
if (lastFocused && lastFocused.focus) lastFocused.focus();
};
openBtns.forEach(b => b.addEventListener('click', openModal));
closeBtns.forEach(b => b.addEventListener('click', closeModal));
addEventListener('keydown', (e) => {
if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
});
modal.addEventListener('keydown', (e) => {
if (e.key !== 'Tab') return;
const f = Array.from(modal.querySelectorAll(
'a[href],button:not([disabled]),input:not([type="hidden"]):not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'
)).filter(el => el.offsetParent !== null);
if (!f.length) return;
const first = f[0], last = f[f.length - 1];
if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
});
const form = modal.querySelector('form');
if (!form) return;
const GP_ATTR_KEY = 'sv_growthproof_first_touch_v1';
const GP_ATTR_NAMES = [
'landing_path', 'referrer_path', 'utm_source', 'utm_medium', 'utm_campaign',
'utm_term', 'utm_content', 'gclid', 'msclkid', 'captured_at',
'growthproof_measurement_version'
];
function gpPathOnly(raw) {
if (!raw) return '';
try {
const u = new URL(raw, location.href);
return u.origin + u.pathname;
} catch (err) {
return '';
}
}
function gpFirstTouch() {
try {
const saved = JSON.parse(sessionStorage.getItem(GP_ATTR_KEY) || '{}');
if (saved && saved.captured_at) return saved;
} catch (err) {}
const q = new URLSearchParams(location.search);
const first = {
landing_path: gpPathOnly(location.href),
referrer_path: gpPathOnly(document.referrer),
utm_source: q.get('utm_source') || '',
utm_medium: q.get('utm_medium') || '',
utm_campaign: q.get('utm_campaign') || '',
utm_term: q.get('utm_term') || '',
utm_content: q.get('utm_content') || '',
gclid: q.get('gclid') || '',
msclkid: q.get('msclkid') || '',
captured_at: new Date().toISOString(),
growthproof_measurement_version: 'v1'
};
try { sessionStorage.setItem(GP_ATTR_KEY, JSON.stringify(first)); } catch (err) {}
return first;
}
function gpEnsureHidden(name, value) {
let input = form.querySelector(`input[type="hidden"][name="${name}"]`);
if (!input) {
input = document.createElement('input');
input.type = 'hidden';
input.name = name;
form.appendChild(input);
}
input.value = value == null ? '' : String(value);
return input;
}
function gpNewLeadId() {
if (window.crypto && typeof window.crypto.randomUUID === 'function') {
return window.crypto.randomUUID();
}
return `sv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
const gpAttribution = gpFirstTouch();
GP_ATTR_NAMES.forEach(name => gpEnsureHidden(name, gpAttribution[name] || ''));
const status = modal.querySelector('.brief-form__status');
const btn = form.querySelector('.brief-form__btn');
const BTN_IDLE = 'Submit Commercial Brief \u2192';
function say(msg) { if (status) status.textContent = msg; }
function resetBtn() {
if (!btn) return;
btn.disabled = false;
btn.textContent = BTN_IDLE;
btn.style.background = '';
}
form.addEventListener('submit', (e) => {
e.preventDefault();
if (btn) { btn.disabled = true; btn.textContent = 'Sending brief\u2026'; }
say('Sending your brief\u2026');
const leadId = gpNewLeadId();
gpEnsureHidden('lead_id', leadId);
gpEnsureHidden('submitted_at', new Date().toISOString());
fetch('https://api.web3forms.com/submit', {
method: 'POST',
body: new FormData(form)
})
.then(res => res.json().catch(() => ({ success: false, message: 'Malformed response' })))
.then(data => {
if (!data || data.success !== true) {
throw new Error((data && data.message) || 'Submission rejected');
}
if (btn) {
btn.textContent = 'Brief received \u2014 we will call you';
btn.style.background = '#4A8C57';
}
say('Brief received. We will call you back shortly.');
const propertyCategory = form.querySelector('[name="property_category"]');
gpEvent('generate_lead', {
event_category: 'conversion',
form_name: 'commercial_brief',
lead_id: leadId,
property_category: propertyCategory ? propertyCategory.value : 'unspecified'
});
setTimeout(() => { closeModal(); form.reset(); resetBtn(); say(''); }, 2500);
})
.catch(() => {
if (btn) {
btn.disabled = false;
btn.textContent = 'Could not send \u2014 call 0474 126 276';
btn.style.background = '#8C4A4A';
}
say('That did not send. Please call 0474 126 276 or email sixthvision.mel@gmail.com and we will pick it up straight away.');
gpEvent('brief_submit_failed', { event_category: 'error', lead_id: leadId });
});
});
}
const y = document.getElementById('yr');
if (y) y.textContent = new Date().getFullYear().toString();
})();