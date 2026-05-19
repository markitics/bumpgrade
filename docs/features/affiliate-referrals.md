# Affiliate And Referral Management

Issues #89, #109, and #111 add the first affiliate/referral source-data,
preview surface, privacy-safe click capture path, and checkout attribution
evidence path for parent issue #19.

## Live Public-Safe Routes

- `/affiliates/source-data`: JSON contract for seeded affiliate programs,
  partner records, referral links, attribution rules, commission rules,
  commission ledger fixtures, payout batches, review flags, audit events, and
  write boundaries.
- `/affiliates/indie-launch-partners`: semantic preview of the same fixture
  program for humans and browser agents.
- `/api/affiliates/clicks`: public POST endpoint for seeded referral clicks.
- `/api/commerce/checkout`: sandbox checkout endpoint can attach eligible
  referral click IDs as public-safe attribution evidence.

## Stable IDs

The contract introduces stable IDs for:

- `affiliateProgramId`
- `affiliatePartnerId`
- `referralLinkId`
- `referralClickId`
- `checkoutIntentId`
- `referralAttributionId`
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
evidence. It proves affiliate/referral click-to-checkout semantics, not payable
commissions or payout capability.

Not live in this slice:

- cookie assignment;
- buyer attribution finalization;
- commission writes;
- fraud enforcement;
- payout account storage;
- tax form collection;
- Stripe payout actions;
- partner notifications;
- confirmed-write agent APIs.

Future writes must require actor identity, explicit confirmation, idempotency,
stale-state checks, audit correlation, private-data redaction, refund-window
checks, and owner review before payout.

## Related Contracts

- `/offers/source-data`: offer IDs used by commission rules.
- `/analytics/source-data`: purchase/refund event IDs used by ledger fixtures.
- `/commerce/source-data`: checkout intent, referral attribution evidence, and
  billing safety patterns.
- `/agent-docs/source-data`: manifest entry for future MCP resources.
