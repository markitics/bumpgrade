# Work Log

`/admin/work-log` is the durable diary of how agents used their time. It is for
Mark and future agents. It should answer: what changed, why, where, how it was
validated, and what remains.

Add one entry after a substantive work burst, typically after shipping a
feature, merging a PR, moving roadmap state, parking an important blocker, or
finishing a long investigation.

## Agent Instructions

After the PR is merged and any required deploy/smoke-test work is complete:

1. Create a work-log entry through the project's configured admin UI, script, API,
   or database writer.
2. Do not include secrets, private inbox bodies, raw tokens, hidden admin data,
   or private user identifiers.
3. Cross-post the same concise summary as a comment on the closed PR when a PR
   was involved.
4. Verify `/admin/work-log` shows the new entry before calling the work wrapped.

## Entry Fields

Every entry should include:

- `title`: concise title.
- `agentName`: `Codex`, `Claude`, or the actual agent name.
- `agentKind`: `codex`, `claude`, `chatgpt`, `human`, or similar.
- `sessionName`: stable session name if known.
- `promptFromMark`: summary of Mark's ask.
- `githubIssues`: issue links touched, created, closed, or moved.
- `closedPrs`: PR links covered by this entry.
- `featuresUpdated`: `/features` entries changed.
- `roadmapUpdated`: `/admin/roadmap` items changed.
- `userJourneysUpdated`: `/admin/user-journeys` entries changed.
- `documentationUpdated`: docs changed.
- `validation`: commands, CI, screenshots, deploys, and smoke checks.
- `flagsAttention`: decisions, tradeoffs, unresolved risks, or follow-ups.
- `firstPromptAt`: timestamp for the ask.
- `doneAt`: timestamp when the work-log entry is written.
- `relevantUrls`: production, admin, screenshot, PR, or issue URLs.

## JSON Example

```json
{
  "title": "Add first Bumpgrade feature catalog",
  "agentName": "Codex",
  "agentKind": "codex",
  "sessionName": "Feature Catalog",
  "promptFromMark": "Mark asked for a public /features page that shows live and pending Bumpgrade features with roadmap links.",
  "githubIssues": [
    {
      "number": 12,
      "title": "Add public feature catalog",
      "url": "https://github.com/markitics/bumpgrade/issues/12"
    }
  ],
  "closedPrs": [
    {
      "number": 18,
      "title": "Add feature catalog",
      "url": "https://github.com/markitics/bumpgrade/pull/18"
    }
  ],
  "featuresUpdated": ["https://bumpgrade.com/features"],
  "roadmapUpdated": ["https://bumpgrade.com/admin/roadmap"],
  "userJourneysUpdated": ["https://bumpgrade.com/admin/user-journeys"],
  "documentationUpdated": ["docs/agent/admin-surfaces.md"],
  "validation": [
    "npm run lint",
    "npm run typecheck",
    "production smoke of /features and /admin/roadmap"
  ],
  "flagsAttention": "",
  "firstPromptAt": "2026-05-17T00:00:00.000Z",
  "doneAt": "2026-05-17T01:00:00.000Z",
  "relevantUrls": [
    "https://bumpgrade.com/features",
    "https://bumpgrade.com/pr-screenshots/issue-12-features.png"
  ]
}
```

## Notes

- The work log supplements GitHub issues, PRs, screenshots, and deployment notes.
  It does not replace them.
- If storage for `/admin/work-log` does not exist yet, create a GitHub issue and
  add a temporary PR comment with the same information.
- Treat work-log entries as durable project memory.
