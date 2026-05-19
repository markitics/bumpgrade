# Affiliate And Referral Management

Issues #89 and #109 add the first affiliate/referral source-data, preview
surface, and privacy-safe click capture path for parent issue #19.

## Live Public-Safe Routes

- `/affiliates/source-data`: JSON contract for seeded affiliate programs,
  partner records, referral links, attribution rules, commission rules,
  commission ledger fixtures, payout batches, review flags, audit events, and
  write boundaries.
- `/affiliates/indie-launch-partners`: semantic preview of the same fixture
  program for humans and browser agents.
- `/api/affiliates/clicks`: public POST endpoint for seeded referral clicks.

## Stable IDs

The contract introduces stable IDs for:

- `affiliateProgramId`
- `affiliatePartnerId`
- `referralLinkId`
- `referralClickId`
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
route validation, hashed request evidence, and aggregate-only public reporting.
It proves affiliate/referral semantics and click capture, not buyer attribution
or payout capability.

Not live in this slice:

- cookie assignment;
- buyer attribution;
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
- `/commerce/source-data`: checkout intent and billing safety patterns.
- `/agent-docs/source-data`: manifest entry for future MCP resources.
