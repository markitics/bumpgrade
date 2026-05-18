# Keep Working

This folder stores repo-tracked versions of Mark's long-running Codex skills.
They are included here so a new computer, cloud agent, or separate Codex project
can recover the same working style without relying on one laptop's
`~/.codex/skills` folder.

## Files

- `goal-runner/SKILL.md`: use when Mark wants an agent to keep going across many
  issues, PRs, checks, blockers, or hours of work.
- `status-update/SKILL.md`: use when Mark asks for a compact status report that
  separates landed, blocked, fragile, and delegable work.

## Install On A Laptop

From the repo root:

```bash
mkdir -p ~/.codex/skills/goal-runner
cp docs/keep-working/goal-runner/SKILL.md ~/.codex/skills/goal-runner/SKILL.md
diff -u docs/keep-working/goal-runner/SKILL.md ~/.codex/skills/goal-runner/SKILL.md

mkdir -p ~/.codex/skills/status-update
cp docs/keep-working/status-update/SKILL.md ~/.codex/skills/status-update/SKILL.md
diff -u docs/keep-working/status-update/SKILL.md ~/.codex/skills/status-update/SKILL.md
```

Restart Codex Desktop if it was already open.

## Use Goal Runner

```text
Use $goal-runner.

Objective: [one durable objective].
Done when: [verifiable stopping condition].
Do not stop until done, I explicitly stop you, or all useful work is blocked.
If I ask a side question, answer in commentary and continue.
If something needs me, email/message me, park that item, and keep doing other
useful work.
Every 30 minutes, leave a compact progress update.
Before sending a final answer, verify the whole goal is truly complete or fully
blocked.
```

## Use Status Update

```text
$STATUS_UPDATE

I do not want to reread the thread. Tell me what is blocked, what has landed on
GitHub main, what is still in flight and fragile, and what is not started but
safe to delegate to another agent.
```
