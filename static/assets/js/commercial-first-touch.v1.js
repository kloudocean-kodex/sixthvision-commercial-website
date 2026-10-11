(() => {
  'use strict';
  // Same first-touch schema and same-origin session key as the canonical
  // Commercial homepage. Captures only marketing parameters and URL paths,
  // never form fields, contact details, query strings or hash fragments.
  const KEY = 'sv_growthproof_first_touch_v1';
  try {
    const existing = JSON.parse(sessionStorage.getItem(KEY) || 'null');
    if (existing && existing.captured_at) return;
  } catch (_) {}

  function pathOnly(raw) {
    if (!raw) return '';
    try {
      const url = new URL(raw, location.href);
      return url.origin + url.pathname;
    } catch (_) {
      return '';
    }
  }

  const params = new URLSearchParams(location.search);
  const first = {
    landing_path: pathOnly(location.href),
    referrer_path: pathOnly(document.referrer),
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_term: params.get('utm_term') || '',
    utm_content: params.get('utm_content') || '',
    gclid: params.get('gclid') || '',
    msclkid: params.get('msclkid') || '',
    captured_at: new Date().toISOString(),
    growthproof_measurement_version: 'v1'
  };
  try { sessionStorage.setItem(KEY, JSON.stringify(first)); } catch (_) {}
})();
