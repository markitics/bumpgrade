# Affiliate And Referral Management

Issues #89, #109, #111, #113, #115, #193, #195, #273, #275, #277, #279, #281,
and #424 add the first
affiliate/referral source-data, preview surface, privacy-safe click capture
path, checkout attribution evidence path, review-only commission ledger path,
owner review/reversal action boundary, public-safe partner report contract, and
read-only payout preparation plus owner-confirmed payout preparation record
owner-reviewed fraud review record, owner-confirmed fraud enforcement record,
public-safe partner portal status pages, and owner-reviewed partner notification
readiness, send preflight, and provider readiness record contracts for parent
issue #19/#424. Issue #19 is now the live affiliate/referral MVP boundary. Issue
#424 tracks remaining payout execution, partner notification sends, private
payout/tax data, authenticated private partner portals, buyer attribution
finalization, and direct agent-safe affiliate/referral writes as one pending
post-MVP execution bucket.

## Live Public-Safe Routes

- `/affiliates/source-data`: JSON contract for seeded affiliate programs,
  partner records, referral links, attribution rules, commission rules,
  public-safe partner reports, commission ledger fixtures, payout batches,
  read-only payout preparation, review flags, audit events, and write
  boundaries.
- `/affiliates/indie-launch-partners`: semantic preview of the same fixture
  program for humans and browser agents.
- `/affiliates/indie-launch-partners/partners/launch-circle`: public-safe
  partner portal status page for aggregate referral, commission,
  payout-readiness, fraud, and notification status without partner email, buyer,
  payout account, tax, Stripe, provider, message, queue, or raw-row data.
- `/api/affiliates/clicks`: public POST endpoint for seeded referral clicks.
- `/api/commerce/checkout`: sandbox checkout endpoint can attach eligible
  referral click IDs as public-safe attribution evidence.
- `/api/affiliates/commission-ledger`: confirmed POST endpoint that creates
  one review-only, non-payable commission ledger row from trusted checkout
  attribution.
- `/api/admin/affiliates/commission-ledger/actions`: owner-gated POST endpoint
  for review, hold, and reversal actions on review-only commission evidence.
- `/api/admin/affiliates/payout-preparation-records`: owner-gated GET/POST
  endpoint for confirmed payout preparation evidence.
- `/api/admin/affiliates/fraud-review-records`: owner-gated GET/POST endpoint
  for confirmed fraud review evidence.
- `/api/admin/affiliates/fraud-enforcement-records`: owner-gated GET/POST
  endpoint for confirmed fraud enforcement records without payout or partner
  notification side effects.
- `/api/admin/affiliates/notification-readiness-records`: owner-gated GET/POST
  endpoint for confirmed partner notification readiness evidence.
- `/api/admin/affiliates/notification-send-preflights`: owner-gated GET/POST
  endpoint for confirmed partner notification send preflight evidence.
- `/api/admin/affiliates/notification-provider-readiness`: owner-gated GET/POST
  endpoint for confirmed partner notification provider readiness evidence.
- `/admin/affiliates`: owner-gated page for reviewing and recording payout
  preparation, fraud review, partner notification readiness, send preflight, and
  provider readiness evidence.
- `/affiliates/source-data.partnerReportSummary`: aggregate partner report rows
  for clicks, attributed checkouts, review-only ledgers, owner review actions,
  commission evidence totals, payout-readiness caveats, and redaction flags.
- `/affiliates/source-data.partnerPortalSummary`: aggregate partner portal rows
  with portal routes, partner status, referral link IDs, partner report IDs,
  payout readiness blockers, fraud/notification status, non-live execution
  boundaries, and redaction flags.
- `/affiliates/source-data.payoutPreparationSummary`: aggregate payout
  preparation rows for eligible, blocked, and reversed fixture ledgers,
  readiness checklist items, review action counts, and redaction flags.
- `/affiliates/source-data.payoutPreparationRecords`: aggregate confirmed
  payout preparation record counts and latest redacted metadata.
- `/affiliates/source-data.fraudReviewRecords`: aggregate confirmed fraud
  review record counts and latest redacted metadata.
- `/affiliates/source-data.fraudEnforcementRecords`: aggregate confirmed fraud
  enforcement record counts and latest redacted metadata.
- `/affiliates/source-data.partnerNotificationReadinessRecords`: aggregate
  confirmed partner notification readiness record counts and latest redacted
  metadata.
- `/affiliates/source-data.partnerNotificationSendPreflightRecords`: aggregate
  confirmed partner notification send preflight record counts and latest
  redacted metadata.
- `/affiliates/source-data.partnerNotificationProviderReadinessRecords`:
  aggregate confirmed partner notification provider readiness record counts and
  latest redacted metadata.

## Stable IDs

The contract introduces stable IDs for:

- `affiliateProgramId`
- `affiliatePartnerId`
- `affiliatePartnerPortalId`
- `affiliatePartnerPortalRoute`
- `affiliatePartnerPortalStatus`
- `affiliatePartnerReportId`
- `payoutPreparationId`
- `payoutPreparationRecordId`
- `payoutPreparationRecordStatus`
- `fraudReviewRecordId`
- `fraudReviewRecordStatus`
- `fraudEnforcementRecordId`
- `fraudEnforcementRecordStatus`
- `partnerNotificationReadinessRecordId`
- `partnerNotificationReadinessRecordStatus`
- `partnerNotificationSendPreflightRecordId`
- `partnerNotificationSendPreflightRecordStatus`
- `partnerNotificationProviderReadinessRecordId`
- `partnerNotificationProviderReadinessRecordStatus`
- `referralLinkId`
- `referralClickId`
- `checkoutIntentId`
- `referralAttributionId`
- `reviewOnlyCommissionLedgerId`
- `commissionReviewActionId`
- `attributionRuleId`
- `commissionRuleId`
- `commissionLedgerId`
- `payoutBatchId`
- `reviewFlagId`
- `auditEventId`
- `agentActionId`

These IDs are public-safe handles for agent reads. They are not provider IDs,
private database IDs, payout account IDs, tax IDs, Stripe customer IDs, or real
buyer identifiers.

## Current Boundary

The live MVP can capture seeded referral clicks with idempotency, destination
route validation, hashed request evidence, aggregate-only public reporting, and
can attach eligible referral clicks to sandbox checkout intents as attribution
evidence. It can also create review-only commission ledger evidence from a
trusted sandbox checkout intent with referral attribution, and an owner session
can review, hold, or reverse that evidence without making it payable. It also
exposes public-safe partner reports that aggregate click, attribution,
review-only ledger, and owner review action evidence without private buyer,
payout, tax, Stripe, raw click, raw checkout, or private actor fields. Issue
#195 adds read-only payout preparation rows and checklist blockers that link
partner reports, ledger fixtures, owner review evidence, and refund-window
caveats without payout accounts, tax forms, Stripe payout IDs, partner
notification payloads, raw ledger rows, private actor identity, or private
review reasons. Issue #273 lets owner sessions record payout preparation
evidence after exact confirmation, idempotency, current program revision checks,
payout batch status checks, and ledger count/total checks while still excluding
payout accounts, tax data, Stripe payout IDs, partner notification payloads,
buyer data, raw ledger rows, raw actor identity, private fraud signals, and
private notes from public source data. Issue #275 lets owner sessions record
fraud review evidence after exact confirmation, idempotency, current program
revision checks, payout batch status checks, review flag checks, and linked
ledger count checks while still excluding fraud enforcement, payable commission
state, payout accounts, tax data, Stripe payout IDs, partner notification
payloads, buyer data, raw ledger/click/checkout rows, raw actor identity,
private fraud signals, and private notes from public source data. It proves
affiliate/referral click-to-checkout-to-ledger-to-review-to-report-to-preparation-to-fraud-review semantics, not payable commissions, fraud
enforcement, or payout capability. Issue #277 lets owner sessions record
partner notification readiness evidence after exact confirmation, idempotency,
current program revision checks, partner report checks, payout batch status
checks, payout preparation record status checks, fraud review record status
checks, review flag checks, and linked ledger count checks while still
excluding partner sends, provider calls, queue dispatch, recipient emails,
message bodies, provider message IDs, fraud enforcement, payable commission
state, payout accounts, tax data, Stripe payout IDs, buyer data, raw
ledger/click/checkout rows, raw actor identity, private fraud signals, and
private notes from public source data. It proves notification readiness
semantics, not partner notification sending.
Issue #279 lets owner sessions record partner notification send preflight
evidence after exact confirmation, idempotency, current program revision checks,
partner report checks, payout batch status checks, payout preparation record
status checks, fraud review record status checks, notification readiness record
status checks, review flag checks, linked ledger count checks, and provider-send
disabled checks while still excluding partner sends, provider-send enablement,
provider calls, send payloads, queue dispatch, recipient emails, message bodies,
provider message IDs, fraud enforcement, payable commission state, payout
accounts, tax data, Stripe payout IDs, buyer data, raw ledger/click/checkout
rows, raw actor identity, private fraud signals, and private notes from public
source data. It proves send preflight semantics, not partner notification
sending or provider configuration.
Issue #281 lets owner sessions record partner notification provider readiness
evidence after exact confirmation, idempotency, current program revision checks,
partner report checks, payout batch status checks, payout preparation record
status checks, fraud review record status checks, notification readiness record
status checks, send preflight record status checks, review flag checks, linked
ledger count checks, provider-configuration-disabled checks, provider secret
redaction checks, sender credential redaction checks, and provider-send disabled
checks while still excluding provider configuration, provider secrets, sender
credentials, partner sends, provider-send enablement, provider calls, send
payloads, queue dispatch, recipient emails, message bodies, provider message
IDs, fraud enforcement, payable commission state, payout accounts, tax data,
Stripe payout IDs, buyer data, raw ledger/click/checkout rows, raw actor
identity, private fraud signals, and private notes from public source data. It
proves provider readiness semantics, not provider configuration or partner
notification sending.
Issue #424 lets owner sessions record fraud enforcement decisions after exact
confirmation, idempotency, current program revision checks, payout batch status
checks, fraud review record status checks, review flag checks, and linked ledger
count checks while still excluding payable commission state, Stripe payouts,
payout account storage, tax data, partner notification sends, provider calls,
buyer data, raw ledger/click/checkout rows, raw actor identity, private fraud
signals, and direct public agent writes. It proves owner-visible fraud
enforcement state, not payout execution, partner notification sending, or agent
affiliate writes. Issue #424 also exposes public-safe partner portal status
pages so partners can inspect aggregate report, payout-readiness, fraud, and
notification status without private partner auth, buyer data, payout account,
tax, Stripe payout IDs, provider secrets, message bodies, queue rows, raw rows,
or direct public agent writes.

Tracked by issue #424, not live in the MVP:

- cookie assignment;
- buyer attribution finalization;
- payable commission writes;
- direct agent review writes;
- payout batch execution;
- payout preparation as payable state;
- payout account storage;
- tax form collection;
- Stripe payout actions;
- authenticated private partner portals;
- partner notification sends;
- notification provider configuration;
- notification provider secrets;
- notification provider calls;
- notification queue dispatch;
- confirmed-write agent APIs.

Future writes must require actor identity, explicit confirmation, idempotency,
stale-state checks, audit correlation, private-data redaction, refund-window
checks, owner review before payout, provider/payment safety, and rollback or
dispute paths.

## Related Contracts

- `/offers/source-data`: offer IDs used by commission rules.
- `/analytics/source-data`: purchase/refund event IDs used by ledger fixtures.
- `/commerce/source-data`: checkout intent, referral attribution evidence,
  review-only commission ledger evidence, owner review/reversal actions, and
  billing safety patterns.
- `/agent-docs/source-data`: manifest entry for future MCP resources.
