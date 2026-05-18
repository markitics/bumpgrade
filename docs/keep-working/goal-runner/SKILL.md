---
name: goal-runner
description: Use when the user asks Codex to pursue a long-running or overnight goal autonomously, says "don't stop", "keep going", "work until complete", "email me but don't wait", "park blockers and continue", asks for goal-style Codex behavior, or wants resilient execution across many steps/issues without premature final answers.
metadata:
  short-description: Keep marching on long-running goals
---

# Goal Runner

Use this skill for durable execution goals that may take many steps, issues,
branches, tests, external services, or hours of work.

## Operating Contract

Start by identifying:

- Objective: the durable goal in one sentence.
- Done condition: the verifiable state that means the run can stop.
- Stop conditions: user says stop, all useful work is blocked, or the done
  condition is reached.
- First checkpoint: the next concrete action that advances the goal.
- Update channel: where to leave compact status, blockers, and handoff notes.
- Continuation mechanism: current turn, heartbeat/automation, CLI goal mode, or
  another available wakeup path.

Then keep working until a stop condition is true. Do not send a final answer just
because the user asks a small question, one issue is blocked, or one milestone
completed.

If the user gives a broad command such as "build the app, don't stop" or "keep
shipping issues until this is done", treat that as permission to make reversible
product and engineering decisions. Ask only when the next step is destructive,
legally/financially consequential, needs unavailable credentials, or would
change the goal itself.

## Active Goal Register

Maintain an explicit active-goal register while the run is active:

- Active goal.
- Active checkpoint.
- Parked items with exact unblock conditions.
- Current durable artifact: issue, PR, branch, work log, doc, or checklist.
- Last user directive and whether it is a side note, status request, redirect,
  pause, or stop.

A new user message does not automatically replace the active goal. Classify it
first:

- Side note/question: answer briefly in commentary, update the register if
  useful, and return to the active checkpoint.
- Redirect: update the active goal/checkpoint and continue.
- Pause/stop/report-only: stop work and send a final or status response.
- Ambiguous but compatible: incorporate it and continue.
- Ambiguous and potentially destructive: ask the minimum clarifying question.

## Execution Loop

1. Keep a checklist with exactly one active checkpoint.
2. Work in small verifiable milestones.
3. Validate after each meaningful change.
4. Commit, push, and report according to the repo workflow.
5. If a blocker appears, record it, notify the user through the requested channel
   if applicable, and immediately move to other useful work.
6. Revisit parked blockers periodically when there is a plausible reply, changed
   state, or newly available tool/access.
7. When no obvious next task remains, refresh the durable artifact and search the
   relevant queue before deciding that all useful work is blocked.

## Repo Work Discipline

For issue-driven repository work:

- Keep one active issue/branch in write mode at a time unless the user explicitly
  asks for parallel implementation and write scopes are disjoint.
- Use subagents for read-only exploration, validation, or clearly separated
  implementation slices.
- Keep progress artifacts in durable places: GitHub issues/PRs, repo docs,
  branch commits, screenshots, work-log entries, or tracked checklists.
- Chat-only state is not enough for long runs.
- When an issue is blocked, comment the blocker and next step on the issue/PR,
  park it, and continue to the next eligible issue.
- If several issue queues exist, obey the user's queue filter first.

## Blockers

A blocker is not a reason to stop unless it blocks all useful progress.

When blocked:

- State the exact missing credential, login, device, API, billing, account, or
  permission.
- Park the task with notes in the appropriate durable place.
- Continue with the next independent task.
- If the user asked for email updates, send the blocker email but do not wait for
  a reply before continuing other work.
- If a tool asks for an approval that cannot be granted in the current
  environment, try a non-destructive alternative. If no alternative exists, park
  that item and keep going elsewhere.
- If the best next decision is a preference question, make a conservative,
  reversible choice, record it for later review, and continue.

## Long Gaps And Resumption

If the user wants work to continue while they are away or across future turns,
use the strongest available continuation mechanism:

- In Codex Desktop, use this skill plus app automations/heartbeats when
  available.
- Inspect existing automations first and prefer updating a matching one over
  creating duplicates.
- Heartbeat prompts should refresh state first: newest user message, branch/PR,
  issue state, and parked blockers.
- Default heartbeat cadence:
  - 10-15 minutes for CI/retry loops, deploy watches, or device smoke tests.
  - 30 minutes for active overnight feature work.
  - 60 minutes for low-urgency monitoring or follow-up checks.
- If no heartbeat/automation is available, keep the current turn alive with
  useful work and frequent concise progress updates.

## Heartbeat Prompt Shape

```text
Use $goal-runner.

Heartbeat: [name].
Scheduled at: [absolute timestamp and timezone].
Stale after: [duration].
Active goal: [durable objective].
Done when: [verifiable stopping condition].

First refresh the newest user message, branch/PR/issue state, and parked
blockers. If the user sent a newer pause, stop, or redirect, obey that instead
of this heartbeat. If this heartbeat is stale and a newer message exists, treat
this as a no-op.

Continue from the latest durable artifact. If blocked, record the blocker,
notify through the requested channel, park it, and move to the next useful task.
Do not send a final answer unless the goal is done, explicitly stopped, or all
useful work is blocked.
```

## Status Updates

Progress reports should be compact and factual:

- Current checkpoint.
- What changed since the last update.
- What was verified.
- What is parked or blocked.
- What will happen next.

Avoid vague "still working" updates.

## Good Prompt Shape

```text
Use $goal-runner.

Objective: [one durable objective].
Done when: [verifiable stopping condition].
Do not stop until done, I explicitly stop you, or all useful work is blocked.
If I ask a side question, answer in commentary and continue.
If something needs me, email/message me, park that item, and keep doing other
useful work.
Every [interval], leave a compact progress update.
Before sending a final answer, verify the whole goal is truly complete or fully
blocked.
```
