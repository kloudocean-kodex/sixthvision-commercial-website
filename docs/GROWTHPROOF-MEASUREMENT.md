# GrowthProof Measurement v1

This document describes the measurement contract proposed by PR #1. It is intentionally narrower than a general analytics specification: the purpose is to connect commercial-intent actions to qualified-lead outcomes without sending visitor-entered personal information to Google Analytics.

## Events

- `open_brief_modal` — visitor opens the commercial brief form.
- `phone_click` — visitor activates a `tel:` CTA.
- `email_click` — visitor activates the explicit footer `mailto:` escape hatch.
- `whatsapp_click` — visitor activates a `wa.me` CTA.
- `generate_lead` — emitted only after Web3Forms returns `success === true`.
- `brief_submit_failed` — emitted after a rejected or failed Web3Forms submission.

The contact-intent events contain only generic channel and CTA-location metadata. Link destinations are deliberately excluded because telephone and email URLs can contain personal information.

## Lead reconciliation

On form submission the browser creates a random `lead_id`. The same ID is sent:

1. as a hidden field in the Web3Forms submission received by Sixth Vision; and
2. as a non-PII parameter on the successful GA4 `generate_lead` event.

This allows an authorised operator to reconcile a measured conversion to the actual lead without putting the prospect's name, email address, phone number, agency, street address or message into GA4.

## First-touch fields

The Web3Forms lead record receives a session-scoped first-touch snapshot containing only:

- landing origin + path (query string stripped)
- referrer origin + path (query string stripped)
- `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`
- `gclid`, `msclkid`
- capture/submission timestamps
- measurement-version marker

These fields are for attribution in the lead record. They are not copied into the GA4 lead event.

## Production verification gate

Before merging/deploying, all of the following must pass:

```bash
python3 -m py_compile build.py scripts/apply_growthproof_measurement.py tests/verify_growthproof.py
python3 build.py
node --check dist/assets/js/light.js
python3 tests/verify_growthproof.py
git diff --check
```

After production deployment, perform one controlled end-to-end verification:

1. open a tagged test URL;
2. verify phone/email/WhatsApp CTA events in GA4 realtime/debug tooling without sending contact details;
3. submit one clearly identified test commercial brief;
4. verify Web3Forms delivery and the generated `lead_id`;
5. verify the same `lead_id` appears on the GA4 `generate_lead` event;
6. ensure the test lead is excluded from real qualified-lead/revenue reporting;
7. refresh GrowthProof and verify the new event inventory.

`generate_lead` should be configured as a GA4 key event only after the successful production test.

## Non-goals

This change does not redesign the website, change the GA4 property, replace Web3Forms, alter client-facing contact details, publish private lead data, merge Google Business Profiles, or make a revenue claim from a click/event alone.
