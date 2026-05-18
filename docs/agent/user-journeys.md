# User Journeys

`/admin/user-journeys` should connect product features to the actual paths users
take through Bumpgrade.

Every main feature should have at least one journey. The journey should be useful
to humans and agents: clear enough to test, discuss, and update when behavior
changes.

## Journey Template

```md
# [Journey Name]

Feature: [feature id/name]
Feature status: live | pending
Roadmap issue(s): [links]
Primary user: [role/persona]
User goal: [what they want to accomplish]

Source evidence:
- [feature/competitor/source/funnel/offer/checkout ids, if relevant]

Happy path:
1. [step]
2. [step]
3. [step]

Edge cases:
- [empty state, auth state, permission boundary, bad source, missing media, etc.]

Agent access:
- Can agents read this journey? [yes/no/path]
- Can agents act on it? [yes/no/tool/contract]
- Confirmation required? [yes/no/details]

Validation:
- [test command, screenshot, production URL, issue/PR]
```

## Rules

- Tie each journey to one or more main features.
- Link roadmap issues and PRs.
- Include source evidence IDs for comparison, funnel, checkout, billing, and
  agent-facing journeys.
- Record whether the journey is live in production or pending.
- Update journeys when feature behavior changes.
- Do not let `/admin/user-journeys` become a stale list of aspirations.

## Agent Use

Agents should consult user journeys before changing UX, feature status, or agent
contracts. If a change alters the happy path or important edge cases, update the
journey in the same PR.
