# Working Agreements

This is the durable handoff for how Mark wants Codex, Claude, and other agents
to work on Cheeky Pint. Read it before substantial project work, especially on a
fresh computer, after conversation compaction, or when joining work another
agent started.

## Source Of Truth

- Treat `AGENTS.md` as the agent entrypoint for this repository.
- Treat this file as the durable project source of truth for how agents should
  work with Mark on this codebase.
- Treat GitHub issues, PRs, labels, and `main` as the engineering source of
  truth for active work.
- Promote recurring preferences into docs instead of relying on chat history,
  local notes, or one machine's memory.
- Keep local machine setup and secrets out of Git unless they are safe examples
  or documented setup steps.

## Parallel Agents

Many agents may work at the same time. That is expected.

- Main moving while your branch is open is normal, not a crisis.
- Work in focused branches so other agents can keep merging small PRs.
- Fetch before important decisions: `git fetch origin`.
- If your branch is behind `origin/main`, inspect whether the changes matter.
  Integrate latest main before final validation or when CI/review shows drift.
- Do not revert someone else's work unless Mark explicitly asks.
- Do not make broad refactors just because nearby code changed.
- If conflicts happen, resolve only the files your issue actually needs.
- Keep durable state in GitHub issues, PRs, and docs so another agent can recover
  without reading your chat.

## Default Posture

- Keep moving autonomously on reversible decisions.
- Pause for Mark only when work is genuinely blocked, destructive, financially or
  legally consequential, or requires access/secrets that cannot be inferred.
- If a non-blocking decision needs Mark's attention, record it and continue.
- If a blocker affects only one issue, park that issue with notes and continue to
  the next independent task.
- Never state guesses as facts. Say what was checked and how confident you are.
- Do not ask Mark to perform checks that an agent can perform directly.

## Issue And Branch Lifecycle

Expected feature flow:

1. If Mark's message implies multiple work items, create or update GitHub issues
   for those items before implementing any one item.
2. Turn an idea into a GitHub issue when there is no suitable existing issue.
3. Prefer one issue, one branch, and one PR per shippable feature slice.
4. For large features, create a parent issue plus linked child issues. Each child
   should be independently shippable and have its own branch, PR, validation, and
   evidence.
5. Create a feature branch even for small changes, usually
   `codex/<short-description>`.
6. Use a separate worktree for feature branches when practical, under
   `/Users/mark/Documents/code/cheekypint-worktrees`.
7. Make focused milestone commits. The branch history should show the real work,
   not one giant commit plus a long PR summary.
8. Push the branch to GitHub. Branch work left only on one laptop is fragile.
9. Open a PR with a real multiline body and clear validation notes.
10. Keep meaningful PRs as drafts while CI settles.
11. When CI is green, mark the PR ready and wait briefly for Codex/GitHub review
    if available.
12. Address important review feedback before merge.
13. Squash-merge into `main`.
14. Delete the source branch and local worktree after merge unless Mark asks to
    keep them.
15. Fast-forward local `main` from GitHub.

Squash merge keeps `main` readable while the closed PR remains the place to
inspect branch commits, screenshots, discussion, and checks. A PR with one branch
commit but several distinct milestones in prose is a process smell unless the
change truly was indivisible.

## Required Product Surfaces

Keep the core visibility routes current:

- `https://cheekypint.com/features`: public feature showcase. Each major feature
  should have a clear status badge: `live` or `pending`. Pending features must
  link to roadmap item(s).
- `/admin/roadmap`: source-of-truth admin view of main feature ideas, status,
  owner/agent, issue links, PR links, and current blockers.
- `/admin/work-log`: durable diary of how agents used their time. It is for Mark
  and future agents, not marketing copy.
- `/admin/user-journeys`: named journeys tied to main features. Each journey
  should connect a user goal to feature(s), source material, happy path, edge
  cases, and validation evidence.

When a feature ships or changes status, update the relevant route or create a
tracking issue if the route does not exist yet.

## Agent-Ready Product Contract

Agent readiness is a first-class product surface.

- Prefer stable server-side manifests, APIs, MCP tools, and model-readable docs
  over browser automation.
- Keep `public/llms.txt` and public `/agent-docs/...` accurate as agent
  capabilities change.
- If the project has episodes, clips, speakers, transcripts, or source media,
  give them stable IDs and provenance metadata.
- Do not invent source facts. Agent answers about clips or speakers must cite the
  transcript, clip, source, timestamp, or issue that supports the claim.
- Public or destructive writes need confirmation text, idempotency keys, audit
  correlation, redaction, and stale-state checks.
- Do not pass secrets or private identifiers as prompt-visible tool input.
- Do not satisfy agent parity with hidden browser-only admin workflows when a
  server-side contract should exist.

## PR Screenshots

- Visible UI work needs screenshots in the PR description.
- GitHub `blob` URLs and private `raw.githubusercontent.com` URLs can 404 for
  reviewers without repo auth. Do not rely on them as durable screenshot links.
- Branch-scoped screenshot links become brittle after branch deletion.
- Prefer committed screenshots in both `docs/pr-screenshots/` and
  `public/pr-screenshots/` when a durable deployed link is needed.
- Use deployed `https://cheekypint.com/pr-screenshots/...` URLs after the
  screenshot has reached `main` and production.
- For open PRs before deployment, use GitHub uploaded image attachment URLs that
  load without authentication.
- Verify screenshot URLs with a browser or `curl -I` before marking the PR ready
  or sending a ship notice.
- Refresh PR screenshot links after follow-up commits if the UI changed.

## CI And Verification

- Use the cheapest validation that gives real signal while developing.
- Use broader validation before finalizing when the change touches shared
  runtime behavior, auth, data, deployment, payments, email, agent contracts, or
  user-critical flows.
- After every push to a branch with an open PR, watch CI on the latest commit.
- Do not hand back a red PR as finished.
- If CI fails, inspect the first meaningful failure, reproduce locally when
  practical, fix it, push again, and watch the new run.
- Do not call a failure flaky without evidence.
- Do not skip tests, remove assertions, or continue stacking feature work on a
  red PR.

## Work Log Wrap-Up

After a substantive work burst, shipped feature, merged PR, or roadmap movement:

- Add an entry to `/admin/work-log` through the project's configured storage or
  script.
- Cross-post a concise version as a PR comment when a PR was involved.
- Include issues, PRs, docs updated, validation, production URLs, screenshots,
  blockers, and what another agent should know next.
- Treat work-log entries as durable project memory. Do not include secrets,
  private inbox bodies, raw tokens, or private user data.

## Mark Attention

Use `MARK ACTION REQUIRED` only when Mark must do something before progress can
continue. Include the exact action, why it is needed, and where to report
completion.

Use `MARK ATTENTION REQUIRED` for important non-blocking decisions, risks,
tradeoffs, paid-account caveats, or follow-ups that Mark should not miss. Record
the item in the agreed project attention surface or email it, then keep moving.

## Documentation

- Keep docs short enough that future agents will actually read them.
- Update docs in the same PR as contract changes.
- Add durable decisions to `docs/decision-log.md` if present.
- Add production/deployment facts to `docs/operations.md` if present.
- Add feature behavior to `docs/features/<feature>.md` if present.
- Keep `docs/README.md` current when adding or moving important docs.
