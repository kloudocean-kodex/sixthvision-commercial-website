#!/usr/bin/env node
'use strict';
// Deterministic, dependency-free test of the public first-touch bridge.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const script = fs.readFileSync(path.join(__dirname, '../static/assets/js/commercial-first-touch.v1.js'), 'utf8');
const key = 'sv_growthproof_first_touch_v1';
const cache = new Map();
const storage = {
  getItem(name) { return cache.has(name) ? cache.get(name) : null; },
  setItem(name, value) { cache.set(name, value); }
};

function loadPage(page, referrer, overrideStorage = storage) {
  const parsed = new URL(page);
  const sandbox = {
    URL, URLSearchParams, Date,
    location: { href: parsed.href, search: parsed.search },
    document: { referrer },
    sessionStorage: overrideStorage
  };
  vm.runInNewContext(script, sandbox, { filename: 'commercial-first-touch.v1.js', timeout: 1000 });
}

loadPage(
  'https://sixthvisioncommercial.com.au/commercial-property-photography-melbourne/?utm_source=google&utm_medium=cpc&utm_campaign=commercial_launch&gclid=test-click',
  'https://www.google.com/search?q=commercial+photographer'
);
const first = JSON.parse(cache.get(key));
assert.equal(first.landing_path, 'https://sixthvisioncommercial.com.au/commercial-property-photography-melbourne/');
assert.equal(first.referrer_path, 'https://www.google.com/search');
assert.equal(first.utm_source, 'google');
assert.equal(first.utm_medium, 'cpc');
assert.equal(first.utm_campaign, 'commercial_launch');
assert.equal(first.gclid, 'test-click');
assert.equal(first.growthproof_measurement_version, 'v1');
assert.ok(first.captured_at);
assert.ok(!first.landing_path.includes('?'));
assert.ok(!first.referrer_path.includes('?'));

// Clicking the newly deployed satellite CTA navigates within the same origin.
// An existing first-touch record must never be overwritten by internal referral.
loadPage('https://sixthvisioncommercial.com.au/?brief=1', 'https://sixthvisioncommercial.com.au/commercial-property-photography-melbourne/');
assert.deepEqual(JSON.parse(cache.get(key)), first);

// In restrictive browsers sessionStorage may throw. No page should crash.
assert.doesNotThrow(() => loadPage('https://sixthvisioncommercial.com.au/measured-site-plans-melbourne/', '', {
  getItem() { throw new Error('storage restricted'); },
  setItem() { throw new Error('storage restricted'); }
}));

console.log('Commercial first-touch bridge browser contract passed.');
