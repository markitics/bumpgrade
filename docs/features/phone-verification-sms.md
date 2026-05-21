# Phone Verification And SMS Provider Research

Issue #53 records the current phone verification and SMS provider research. This
is a planning note only. Bumpgrade does not collect phone numbers, send SMS
codes, enable SMS marketing, or require phone verification today.

Research checked on 2026-05-21. Pricing, compliance rules, supported countries,
and carrier registration requirements change often; refresh the linked vendor
pages before buying or enabling a provider.

## Recommendation

Do not build phone collection yet. Keep email/password Better Auth, verified
email, Turnstile, rate limits, and owner/publisher session checks as the current
launch path.

When phone verification becomes necessary, use Better Auth as the product-level
verification boundary and plug in one SMS provider behind it. The first provider
decision should be:

1. Better Auth Infrastructure SMS if Mark wants the smallest auth-specific
   integration and accepts Better Auth as the managed SMS vendor.
2. Twilio Verify if Bumpgrade wants the most mainstream dedicated verification
   product with SMS, voice, WhatsApp, email, push, and device approval paths.
3. AWS End User Messaging Notify if Bumpgrade wants a provider-managed OTP flow
   inside AWS with no phone-number provisioning, while still hosting Bumpgrade on
   Cloudflare Workers.
4. Telnyx Verify if unit cost and direct telecom controls matter more than
   choosing the most common default.

Vonage, Bird, and Sinch remain viable alternatives, especially for global
routing, WhatsApp fallback, voice fallback, or later messaging-provider
negotiation. They are not a better first default for Bumpgrade until there is a
specific geography, channel, or pricing reason.

## Cloudflare Fit

Cloudflare does not appear to offer a native managed SMS OTP or phone-number
verification product comparable to Twilio Verify or AWS Notify. The relevant
Cloudflare primitives are:

- Workers to call an external SMS provider API.
- Worker secrets for provider credentials.
- D1/KV/Queues/Cron for audit state, retry state, cooldowns, and abuse controls.
- Turnstile as a CAPTCHA alternative before requesting an OTP.

Cloudflare's own Workers SMS tutorial uses Twilio as the SMS provider, which is
the correct pattern for Bumpgrade if the app stays Cloudflare-first.

## Better Auth Fit

Bumpgrade already uses Better Auth. Better Auth's phone-number plugin supports
`send-otp` and `verify` endpoints and expects the application to provide a
`sendOTP` function. That makes it a good seam for Twilio Verify, AWS Notify,
Telnyx Verify, Vonage Verify, Bird Verify, Sinch Verification, or Better Auth's
managed SMS infrastructure.

Future Bumpgrade phone verification should keep the phone-number state in the
auth/account boundary, not scattered across funnels, checkout, or publisher
tenant setup.

## Stripe Fit

Stripe Checkout can collect a phone number on payment and subscription sessions,
and the resulting phone number can be retrieved from Checkout Session, Customer,
Account, or webhook data. That is useful transactional data when Bumpgrade needs
a phone number for a purchase.

Do not treat Stripe-hosted checkout, Customer Portal, login links, or account
flows as Bumpgrade account phone verification. Stripe can collect or manage a
phone value inside Stripe-hosted flows, but Bumpgrade still needs its own
auth-level verification state before using a phone number as a login factor,
publisher trust signal, or anti-abuse gate.

## Provider Comparison

| Provider | Current fit | Cost signal checked | Complexity notes |
| --- | --- | --- | --- |
| Better Auth Infrastructure SMS | Smallest integration if Bumpgrade accepts a managed auth SMS vendor. | Pro plan lists transactional SMS at `$0.09 / SMS`. | Good fit with Better Auth plugin semantics. Still needs Cloudflare secrets, rate limits, audit state, and provider-spend controls. |
| Twilio Verify | Best default for a dedicated verification product and common integrations. | US SMS shows `$0.05` per successful verification plus US SMS channel cost. | Mature, broad channels, but still requires fraud controls, spend limits, account setup, and country/channel policy. |
| AWS End User Messaging Notify | Good AWS-managed OTP option without provisioning phone numbers. | Pricing page shows `$0.045` per successful OTP verification plus SMS message price. | Not Cloudflare-native, but simple to call from Workers. Requires AWS credentials, IAM, spend limits, and regional/compliance review. |
| Telnyx Verify | Lower successful-verification fee and telecom-oriented controls. | Verify API page shows `$0.03` per successful verification plus SMS API pricing. | Good candidate if cost matters. Requires provider setup, phone/country policy, and delivery testing. |
| Vonage Verify | Mature OTP product with SMS-to-voice fallback. | Verify Conversion page shows `EUR 0.052 / USD 0.0572` per successful verification plus messaging/voice rates. | Useful if fallback and global routing perform better for target users. Compare real destination pricing before choosing. |
| Bird Verify | Good if Bumpgrade wants SMS, WhatsApp, and email verification in one workflow. | Public docs reviewed; pricing was not stable enough to record as a fixed number here. | Verify supports Email, WhatsApp, and SMS, including automatic fallback patterns. Needs workspace/channel setup and pricing refresh. |
| Sinch Verification | Good global alternative with SMS, voice, flash-call, and data options. | Public docs say pricing depends on request, country, and operator; current pricing list is in their dashboard. | Strong option for global delivery and dashboard metrics, but price comparison needs an account/dashboard export. |
| Raw SNS/SMS API | Useful for custom transactional SMS, not the first OTP default. | AWS SMS pricing varies by destination; sandbox phone verification exists for testing sends. | More app-owned OTP logic and compliance burden unless using AWS Notify. |

## Staged Path

1. Keep phone numbers out of Bumpgrade until a specific abuse, account-recovery,
   publisher-trust, or customer-communication need is recorded.
2. If phone verification becomes needed, create a new implementation issue with
   the exact user journey, provider choice, and success/failure evidence.
3. Add Better Auth phone-number plugin support behind Turnstile, cooldowns,
   E.164 validation, per-IP and per-phone rate limits, idempotency, provider
   spend caps, and public-safe redaction.
4. Store only normalized verified phone state and redacted provider receipt
   metadata. Do not store OTP codes, raw provider payloads, private phone
   numbers in public source data, or prompt-visible phone identifiers.
5. Treat SMS marketing separately from auth OTP. Marketing SMS needs consent,
   STOP/unsubscribe handling, sender registration, region-specific compliance,
   suppression state, and a different public claim.

## Future Acceptance Criteria

A future implementation issue should not be considered done until:

- Signed-out and over-limit requests are rejected before provider calls.
- OTP sends require Turnstile or equivalent abuse friction when exposed publicly.
- Phone inputs are normalized to E.164 and rejected before storage when invalid.
- Verification attempts have a small maximum, cooldowns, expiry, and replay
  protection.
- Provider credentials live only in Cloudflare Worker secrets or the provider's
  managed infrastructure.
- Source-data routes expose only counts, statuses, stable IDs, and redaction
  flags.
- Work-log and user-journey entries cite the provider, issue, PR, CI, deploy,
  and smoke evidence.

## Sources

- Cloudflare Turnstile overview: https://developers.cloudflare.com/turnstile/
- Cloudflare Workers Twilio SMS tutorial: https://developers.cloudflare.com/workers/tutorials/github-sms-notifications-using-twilio/
- Better Auth phone-number plugin: https://better-auth.com/docs/plugins/phone-number
- Better Auth SMS service: https://better-auth.com/docs/infrastructure/services/sms
- Better Auth pricing: https://better-auth.com/pricing
- Twilio Verify docs: https://www.twilio.com/docs/verify
- Twilio Verify pricing: https://www.twilio.com/en-us/verify/pricing
- AWS End User Messaging Notify: https://docs.aws.amazon.com/sms-voice/latest/userguide/notify.html
- AWS End User Messaging pricing: https://aws.amazon.com/end-user-messaging/pricing/
- Telnyx Verify pricing: https://telnyx.com/pricing/verify-api
- Vonage Verify getting started: https://developer.vonage.com/en/verify/getting-started
- Vonage Verify pricing: https://www.vonage.com/communications-apis/verify/pricing/
- Bird Verify API: https://docs.bird.com/api/verify-api
- Sinch Verification API: https://developers.sinch.com/docs/verification
- Stripe Checkout phone number collection: https://docs.stripe.com/payments/checkout/phone-numbers
