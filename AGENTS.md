# Agent Instructions

Never state guesses as facts. If unsure, say what was checked, what is unknown,
and your confidence level.

If you are about to ask Mark to do something, first check whether you can do it
yourself through the shell, browser, repo, GitHub, app UI, or available tools.

When something needs Mark's attention but does not need to block the current
work, email `m@rkmoriarty.com` or record it in the agreed project attention
channel, then keep moving and watch for a reply.

## Project Constants

- Project: `Bumpgrade`
- Domain: `bumpgrade.com`
- GitHub repo: `markitics/bumpgrade`
- Default feature branch prefix: `codex/`
- Suggested worktree parent: `/Users/mark/Documents/code/2026/bumpgrade-worktrees`
- Target stack: Cloudflare-first, including Workers/Pages, D1, R2, KV,
  Queues/Cron, Email Routing/Sending, Turnstile, and Better Auth where useful.

## Must-Follow Rules

- Treat `AGENTS.md` as the shared source of truth for Codex, Claude, and other
  agents. If `CLAUDE.md` exists, it should point back here instead of duplicating
  separate rules.
- Before substantial project work, read `docs/working-agreements.md`. Use
  `docs/README.md` as the docs map when you need deeper context.
- Treat GitHub `main` as the cross-machine source of truth. Do not rely on
  Dropbox sync, local-only branches, stale worktrees, or chat history as durable
  project memory.
- Do not work directly on local `main` except for fast-forward pulls and tiny
  inspection tasks. Feature work belongs on a dedicated branch.
- If local `main` is dirty before a pull, preserve the local work first with a
  branch, stash, or patch. Never overwrite uncommitted notes or code.
- Main moving while an agent is working is normal. Do not be alarmed if
  `origin/main` changed after your branch started. Fetch, inspect, integrate the
  latest main when needed, resolve conflicts carefully, and keep going.
- Protect secrets. Never commit `.env` files, API keys, webhook secrets, raw
  tokens, private credentials, session cookies, private inbox bodies, or private
  user data.

## Required Product Surfaces

Keep these surfaces current whenever features, roadmap state, or agent work
changes:

- Public `https://bumpgrade.com/features`: major features live or planned. Use
  a `live` badge when the feature is available in production. Use a `pending`
  badge plus links to roadmap item(s) when it is planned but not live.
- Admin `/admin/roadmap`: the main identified features, status, issue/PR links,
  and what is active, next, pending, or shipped.
- Admin `/admin/work-log`: how agents used their time. Update after substantive
  work bursts, shipped features, merged PRs, or roadmap state changes.
- Admin `/admin/user-journeys`: user journeys tied cleanly to the main features.
  Every main feature should have at least one named journey, owner/user goal,
  expected path, edge cases, and evidence links.

Do not ship a feature and leave these surfaces stale. If a route does not exist
yet, create or update a GitHub issue that clearly tracks the missing surface.

## Agent-Ready Default

Bumpgrade must be 100 percent agent-ready. A capable agent should be able to
answer and act on project-specific requests such as "show me Bumpgrade's
ClickFunnels comparison evidence" or "create a draft funnel for this offer"
without scraping hidden UI or guessing from vibes.

Default architecture:

- Public, crawlable docs for agents: `public/llms.txt` and `/agent-docs/...`.
- Stable server-side manifests and APIs for agent-readable project state.
- MCP tools/resources for direct agent access when a workflow becomes important.
- ChatGPT app or Claude-specific affordances layered on top of the same contracts,
  not separate product semantics.
- Feature, roadmap, competitor, source, funnel, product, checkout, customer,
  subscription, automation, and permission metadata with stable IDs.
- Source-grounded answers: cite feature IDs, roadmap items, competitor source
  URLs, commit/PR evidence, and timestamped work-log entries. Do not invent
  claims, pricing, quotes, integrations, customers, or source evidence.
- Agent writes must use explicit confirmation, idempotency, audit correlation,
  stale-state checks, and redaction for public, destructive, billing-impacting,
  creator-speech, or moderation actions.

Read `docs/agent/agent-ready.md` before building agent-facing behavior.

## Issue And Branch Workflow

- When Mark gives a message that contains or implies multiple work items, create
  or update the relevant GitHub issues before implementing any one item.
- Turn meaningful ideas, bugs, and follow-ups into GitHub issues. Do not leave
  important work only in chat.
- Use one issue, one branch, and one PR when practical.
- Bundle genuinely related behind-the-scenes changes into the same issue/PR
  when they serve one product outcome. Keep unrelated fixes separate.
- For meaty features, create a parent issue plus linked child issues for
  independently shippable slices. Keep the shared contract in the parent issue.
- When beginning an issue, add or update active ownership labels if the repo uses
  them, such as `status:active` and `codex:<session-name>`.
- Create a feature branch even for small changes, usually
  `codex/<short-description>`.
- Make focused interim commits that reflect real milestones. Mark should be able
  to inspect the PR commit list and see what actually happened.
- Push branch work to GitHub. GitHub is the durable source of truth.

## PR And Merge Rules

- Open one PR for the issue. Use a real multiline PR body, not escaped `\n`
  text from a shell argument.
- For UI-visible work, include actual embedded screenshots in the PR
  description using Markdown image syntax, such as `![alt](url)`. Bare
  screenshot links alone are not enough when screenshots exist.
- Screenshots must work for reviewers. Do not rely on private GitHub `blob` URLs,
  private `raw.githubusercontent.com` URLs, or branch-scoped repo links as durable
  screenshot evidence.
- Prefer screenshots committed under both `docs/pr-screenshots/` and
  `public/pr-screenshots/` when durable deployed links are needed.
- For open PRs before deployment, use GitHub uploaded image attachment URLs that
  return 200 without repo authentication.
- Before finalizing or emailing a PR notice with screenshots, verify each
  screenshot URL loads without GitHub auth.
- If no screenshots exist because the work is docs-only, tooling-only, or
  otherwise not visible in the UI, say that explicitly in the PR body.
- Keep meaningful PRs as drafts while CI is still settling.
- When CI is green, mark meaningful PRs ready and wait briefly for Codex/GitHub
  review if available. Treat important review findings as blocking.
- Squash-merge completed PRs into `main` unless Mark explicitly asks otherwise.
  The branch may have 3-20 useful commits; `main` should receive one clean commit.
- After merge, delete the source branch, remove the local worktree if one was
  used, prune stale refs when useful, and fast-forward local `main`.
- Because PRs are squash-merged, local Git ancestry may not prove a branch is
  merged. Use GitHub PR state as the cleanup source of truth.

## Validation

- Run the relevant local validation before handing work back.
- Use fast focused checks while debugging, then broader checks before finalizing
  when risk justifies it.
- After every push to a branch with an open PR, watch CI on the latest commit.
- If CI fails, inspect the first real failure, reproduce locally when practical,
  fix it, push again, and watch the new run.
- Do not call a failure flaky without evidence.
- Do not skip tests, remove assertions, or stack more feature work on top of a
  red PR.
- Keep validation notes factual: list commands that passed, then separately call
  out blockers or unverified areas.

## Live Error Intake

When an agent observes a live user-facing server, API, build, deploy, or
production error, capture it in GitHub before deep implementation work:

1. Search open issues for the affected route, feature, response status, and safe
   error text.
2. If a matching issue exists, comment with the new occurrence.
3. If no matching issue exists, create a new issue with safe evidence.
4. Continue implementation after the issue/comment exists unless the error itself
   is the active issue.

Do not paste secrets, raw tokens, private inbox bodies, session cookies, payment
identifiers, or private user data into GitHub.

## Documentation

- Keep `docs/README.md` as the docs map.
- Keep durable workflow expectations in `docs/working-agreements.md`.
- Keep agent-facing design and contracts in `docs/agent/agent-ready.md`.
- Keep screenshot rules in `docs/agent/pr-screenshots.md`.
- Keep work-log rules in `docs/agent/work-log.md`.
- Keep user journey rules in `docs/agent/user-journeys.md`.
- Append important architectural decisions to a decision log if one exists.
- Update docs in the same PR as the behavior when the doc is part of the product
  contract.

## Shipping Communication

- Send shipped email only for merged work that is user-visible, owner-visible, or
  materially actionable for Mark: product UI/content changes, live feature
  launches, user-impacting bug fixes, roadmap/status movement, production
  incidents resolved, or anything Mark explicitly asked to be emailed about.
- Do not send low-signal shipped email for tiny internal PRs, docs-only edits,
  tests, lint, refactors, plumbing, dependency housekeeping, or agent workflow
  tweaks unless they are bundled with a qualifying user-facing change or need
  Mark's action.
- Use the quiet path for non-qualifying merged PRs: PR comment, issue update,
  and `/admin/work-log` entry when the work should be durable. Keep polling for
  replies before unrelated large work, but do not create new email just to say an
  internal PR merged.
- When roadmap state changes, call it out explicitly in the PR and work-log:
  include the item name/ID, previous status, new status, issue/PR, and live or
  admin URL.

## Codex Session Email Identity

If project email sending is configured:

- Default Codex project mail should come from
  `Bumpgrade Codex <codex@bumpgrade.com>`.
- If per-session reply routing is configured later and Mark starts a chat with
  `session name: ...`, use that exact value as the display name and send from
  `Session Name <codex+session+name@bumpgrade.com>`.
- Preserve capitalization/spaces in the display name; lowercase and `+`-join
  the plus-address local part.
- If Mark does not provide a session name before email is needed, create a
  concise context-derived session name first.
- When a thread emails from `codex@bumpgrade.com` or a per-session address,
  periodically check for replies and attachments before starting unrelated large
  work.
