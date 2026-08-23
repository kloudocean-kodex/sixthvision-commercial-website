#!/usr/bin/env python3
"""Apply GrowthProof measurement v1 to the Sixth Vision source tree.

This script is intentionally idempotent. It patches the existing audited interaction
layer instead of replacing it, then the normal build pipeline produces dist/.

Goals:
- explicit non-PII GA4 events for phone/email/WhatsApp commercial intent
- first-touch campaign attribution carried into successful Web3Forms submissions
- a random lead_id shared between the Web3Forms email and GA4 generate_lead event
- no names, emails, phone numbers, agency names, addresses, or messages sent to GA4
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = ROOT / "src" / "js" / "light.js"
MARKER = "GROWTHPROOF-MEASUREMENT-V1"


def require_once(text: str, needle: str, label: str) -> None:
    count = text.count(needle)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one match, found {count}")


def main() -> None:
    text = JS.read_text(encoding="utf-8")
    if MARKER in text:
        print("GrowthProof measurement v1 already applied; no source patch needed.")
        return

    form_marker = "    /* ---- §FORM — Commercial Brief modal + GA4 ---------------------------- */"
    require_once(text, form_marker, "form marker")

    telemetry = r'''    /* GROWTHPROOF-MEASUREMENT-V1
       Commercial-intent telemetry only. Never send form-entered PII to GA4.
       Link destinations are intentionally NOT included in event parameters: tel:
       and mailto: URLs can themselves contain personal information. */
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

'''
    text = text.replace(form_marker, telemetry + form_marker, 1)

    form_decl = "    const form = modal.querySelector('form');\n    if (!form) return;\n"
    require_once(text, form_decl, "form declaration")

    attribution = r'''

    /* First-touch attribution is session-scoped and contains no form-entered PII.
       Query strings are NOT copied wholesale: only known marketing parameters are
       retained, while landing/referrer values are reduced to origin + pathname. */
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
'''
    text = text.replace(form_decl, form_decl + attribution, 1)

    sending = "      say('Sending your brief\\u2026');\n"
    require_once(text, sending, "sending status")
    submit_context = r'''      const leadId = gpNewLeadId();
      gpEnsureHidden('lead_id', leadId);
      gpEnsureHidden('submitted_at', new Date().toISOString());
'''
    text = text.replace(sending, sending + submit_context, 1)

    generate_pattern = re.compile(
        r"          if \(typeof window\.gtag === 'function'\) \{\n"
        r"            window\.gtag\('event', 'generate_lead', \{\n"
        r"              event_category: 'conversion',\n"
        r"              event_label: 'Commercial Media Brief',\n"
        r"              value: 1\n"
        r"            \}\);\n"
        r"          \}"
    )
    replacement = r'''          /* lead_id is random/non-PII and is also sent with the Web3Forms
             submission, allowing an authorised operator to reconcile the GA4 event
             to a real lead without putting contact details into Analytics. */
          const propertyCategory = form.querySelector('[name="property_category"]');
          gpEvent('generate_lead', {
            event_category: 'conversion',
            form_name: 'commercial_brief',
            lead_id: leadId,
            property_category: propertyCategory ? propertyCategory.value : 'unspecified'
          });'''
    text, count = generate_pattern.subn(replacement, text, count=1)
    if count != 1:
        raise SystemExit(f"generate_lead block: expected one replacement, found {count}")

    failure_pattern = re.compile(
        r"          if \(typeof window\.gtag === 'function'\) \{\n"
        r"            window\.gtag\('event', 'brief_submit_failed', \{ event_category: 'error' \}\);\n"
        r"          \}"
    )
    failure_repl = "          gpEvent('brief_submit_failed', { event_category: 'error', lead_id: leadId });"
    text, count = failure_pattern.subn(failure_repl, text, count=1)
    if count != 1:
        raise SystemExit(f"brief_submit_failed block: expected one replacement, found {count}")

    JS.write_text(text, encoding="utf-8")
    print("Applied GrowthProof measurement v1 to src/js/light.js")


if __name__ == "__main__":
    main()
