# Affiliate And Referral Management

Issue #89 adds the first read-only affiliate/referral source-data and preview
surface for parent issue #19.

## Live Public-Safe Routes

- `/affiliates/source-data`: JSON contract for seeded affiliate programs,
  partner records, referral links, attribution rules, commission rules,
  commission ledger fixtures, payout batches, review flags, audit events, and
  write boundaries.
- `/affiliates/indie-launch-partners`: semantic preview of the same fixture
  program for humans and browser agents.

## Stable IDs

The contract introduces stable IDs for:

- `affiliateProgramId`
- `affiliatePartnerId`
- `referralLinkId`
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

This slice is read-only. It proves affiliate/referral semantics, not live
tracking or payout capability.

Not live in this slice:

- live referral click capture;
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
