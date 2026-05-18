---
name: status-update
description: Use when the user says $STATUS_UPDATE, STATUS_UPDATE, asks for a status update in a long-running thread, asks whether anything is blocked, asks what has shipped versus what is in flight, asks what another agent can safely pick up, or wants a compact signal-from-noise report before deciding whether to interrupt, delegate, or let Codex continue.
metadata:
  short-description: Separate shipped, blocked, in-flight, and delegable work
---

# Status Update

Use this skill to give Mark a compact, evidence-backed checkpoint during a
long-running agent thread.

The purpose is not to archive or clean up the thread. The purpose is to tell
Mark what is durable, what is fragile, what needs him, and what another agent
could safely take over.

## Core Rules

- Treat GitHub `main`, merged PRs, closed issues, pushed branches, issue
  comments, checked-in docs, and work-log entries as durable sources of truth.
- Treat chat-only context, local dirty files, unpushed commits, draft PRs, and
  issue worktrees as fragile until proven durable.
- Never state guesses as facts. If evidence is incomplete, say what was checked
  and give a confidence level.
- Do not ask Mark to run checks an agent can run directly.
- Do not claim a branch, PR, worktree, deploy, or screenshot is cleaned up unless
  you verified it.
- Do not let a status request erase the active goal. If work should continue
  after the report, say the next checkpoint and resume.

## Evidence Pass

Before reporting, quickly refresh the durable and local state that applies:

1. Identify the project, active goal, newest user instruction, and current
   checklist.
2. If this is a repo, inspect:
   - current branch and `git status --short --branch`;
   - relevant worktrees and dirty/clean state;
   - local branches created or used by this thread;
   - open and recently merged PRs tied to those branches/issues;
   - issues created, updated, closed, or marked active by this thread;
   - CI/deploy/review state for open PRs;
   - whether `/features`, `/admin/roadmap`, `/admin/work-log`, and
     `/admin/user-journeys` were updated when relevant.
3. Prefer CLI/API checks over browser login. If repo instructions name a token
   source, use it.
4. If evidence is expensive or unavailable, do not stall the report. Say exactly
   what was not checked and how that limits confidence.

## Report Shape

Keep the report short enough that Mark can read it quickly. Use these sections:

### Status

- One sentence: done, continuing, blocked, or partially complete.
- Evidence timestamp and timezone.
- Evidence sources checked.

### Needs Mark / Blocked

List only items that genuinely need Mark:

- missing credential, permission, billing, device, account access, API key, or
  external setup;
- a product or technical decision an agent should not make unilaterally;
- a destructive or irreversible action requiring explicit approval.

For each item, include the exact requested action, why it blocks progress, and
where the blocker is documented. If there are no Mark blockers, say so.

### Landed On GitHub Main

List completed work that is safe if this laptop disappears:

- merged/closed PR links and issue links;
- what shipped in plain language;
- evidence that the work is on GitHub `main`;
- cleanup verification for source branches and worktrees, if checked.

### In Flight / Fragile

List work Mark should probably let this session finish:

- draft/open PRs not yet mergeable;
- local dirty files, unpushed commits, or branch-only commits;
- worktrees with useful partial work;
- running CI, deploys, device tests, or review waits;
- analysis or implementation not captured in GitHub/docs/work log.

For each item, include the branch/worktree/PR path, what would be wasted if the
session ended, and the next concrete action.

### Not Started / Safe To Delegate

List work identified but essentially not started:

- GitHub issues with enough context for another agent;
- docs or specs already on `main`;
- no meaningful local-only work to preserve before another agent starts.

For each item, include the issue/doc link and why it is safe to hand off.

### Next Move

End with one concise recommendation:

- let this session continue;
- Mark should do the named unblocker;
- another agent can take the named issues;
- the work appears done and a cleanup/archive pass is appropriate.

## Good Prompt Shape

```text
$STATUS_UPDATE

I do not want to reread the thread. Tell me what is blocked, what has landed on
GitHub main, what is still in flight and fragile, and what is not started but
safe to delegate to another agent.
```
