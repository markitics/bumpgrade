# Affiliate And Referral Management

Issues #89, #109, #111, #113, #115, and #193 add the first
affiliate/referral source-data, preview surface, privacy-safe click capture
path, checkout attribution evidence path, review-only commission ledger path,
owner review/reversal action boundary, and public-safe partner report contract
for parent issue #19.

## Live Public-Safe Routes

- `/affiliates/source-data`: JSON contract for seeded affiliate programs,
  partner records, referral links, attribution rules, commission rules,
  public-safe partner reports, commission ledger fixtures, payout batches,
  review flags, audit events, and write boundaries.
- `/affiliates/indie-launch-partners`: semantic preview of the same fixture
  program for humans and browser agents.
- `/api/affiliates/clicks`: public POST endpoint for seeded referral clicks.
- `/api/commerce/checkout`: sandbox checkout endpoint can attach eligible
  referral click IDs as public-safe attribution evidence.
- `/api/affiliates/commission-ledger`: confirmed POST endpoint that creates
  one review-only, non-payable commission ledger row from trusted checkout
  attribution.
- `/api/admin/affiliates/commission-ledger/actions`: owner-gated POST endpoint
  for review, hold, and reversal actions on review-only commission evidence.
- `/affiliates/source-data.partnerReportSummary`: aggregate partner report rows
  for clicks, attributed checkouts, review-only ledgers, owner review actions,
  commission evidence totals, payout-readiness caveats, and redaction flags.

## Stable IDs

The contract introduces stable IDs for:

- `affiliateProgramId`
- `affiliatePartnerId`
- `affiliatePartnerReportId`
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

This slice can capture seeded referral clicks with idempotency, destination
route validation, hashed request evidence, aggregate-only public reporting, and
can attach eligible referral clicks to sandbox checkout intents as attribution
evidence. It can also create review-only commission ledger evidence from a
trusted sandbox checkout intent with referral attribution, and an owner session
can review, hold, or reverse that evidence without making it payable. It also
exposes public-safe partner reports that aggregate click, attribution,
review-only ledger, and owner review action evidence without private buyer,
payout, tax, Stripe, raw click, raw checkout, or private actor fields. It proves
affiliate/referral click-to-checkout-to-ledger-to-review-to-report semantics,
not payable commissions or payout capability.

Not live in this slice:

- cookie assignment;
- buyer attribution finalization;
- payable commission writes;
- direct agent review writes;
- fraud enforcement;
- payout account storage;
- tax form collection;
- Stripe payout actions;
- private partner portals;
- partner notifications;
- confirmed-write agent APIs.

Future writes must require actor identity, explicit confirmation, idempotency,
stale-state checks, audit correlation, private-data redaction, refund-window
checks, and owner review before payout.

## Related Contracts

- `/offers/source-data`: offer IDs used by commission rules.
- `/analytics/source-data`: purchase/refund event IDs used by ledger fixtures.
- `/commerce/source-data`: checkout intent, referral attribution evidence,
  review-only commission ledger evidence, owner review/reversal actions, and
  billing safety patterns.
- `/agent-docs/source-data`: manifest entry for future MCP resources.
