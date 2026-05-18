# Agent-Ready Cheeky Pint

Cheeky Pint should be understandable and operable by agents from the beginning.
Agent readiness is a product surface beside the human web app and admin UI.

The practical goal: Mark should be able to ask Claude Code, ChatGPT, or Codex
something like "pull in some clips from Cheeky Pint where John talks about ..."
and the agent should know where to find source material, how to cite it, what it
is allowed to do, and how to avoid inventing facts.

## Default Architecture

Build in this order:

1. Human-facing pages and admin workflows.
2. Stable server-side data contracts for the same concepts.
3. Public model-readable docs: `public/llms.txt` and `/agent-docs/...`.
4. Agent manifests and HTTP APIs for important reads.
5. MCP tools/resources for repeated agent workflows.
6. ChatGPT app, Claude-specific workflows, or CLI affordances on top of the same
   contracts.

Do not create separate semantics for each client. Web, admin, MCP, ChatGPT, and
Claude workflows should all describe the same underlying product contract.

## Source Material And Clips

If Cheeky Pint has episodes, clips, transcripts, speakers, guests, topics, or
source media, make them first-class data.

Recommended stable concepts:

- `episodeId`: stable id for an episode or source recording.
- `clipId`: stable id for a clip or excerpt.
- `speakerId`: stable id for a speaker or recurring person.
- `transcriptId`: stable id for transcript source.
- `sourceUrl`: canonical media or page URL.
- `startTime` and `endTime`: timestamp boundaries for clips.
- `topicTags`: human-curated or reviewed topic labels.
- `rightsStatus`: whether the source can be quoted, embedded, clipped, or only
  referenced.
- `provenance`: where the material came from and who/what generated it.

Rules:

- Do not invent quotes, clips, speaker names, dates, or episode facts.
- Agent answers about source material must cite stable IDs and timestamps when
  available.
- Generated transcript text should be marked as generated until reviewed.
- If transcript confidence is low, say so and avoid exact quotes.
- Keep private notes, unpublished media, and restricted sources out of public
  agent docs.

## Public Discovery

Keep `public/llms.txt` accurate. It should link to:

- public feature overview;
- public or admin-safe roadmap summary;
- agent docs;
- source/clip docs when public;
- MCP endpoint or setup docs when available;
- clear safety boundaries.

Public agent docs should answer:

- What is Cheeky Pint?
- What can agents read today?
- What can agents do today?
- What is planned but not executable?
- What requires Mark/admin credentials?
- What must not be automated through browser UI?

## MCP And Tooling

MCP is the preferred canonical interface for repeated agent work. ChatGPT apps,
Claude workflows, and CLIs should call the same underlying contracts.

Useful first MCP resources/tools:

- Read feature and roadmap status.
- Read work-log entries.
- Read user journeys.
- Search public episodes/clips/transcripts by speaker, topic, keyword, and time.
- Resolve a source quote to episode/clip/timestamp evidence.
- Draft a feature or journey update from validated source material.
- Create a proposed admin update that requires explicit confirmation before
  writing.

## Write Safety

Any public, destructive, billing-impacting, moderation, source-editing,
publishing, or creator-speech write needs:

- explicit actor identity;
- client/app attribution;
- confirmation text for high-impact actions;
- idempotency key;
- stale-state check;
- audit correlation id;
- before/after summary;
- redacted model-visible output;
- clear rollback or follow-up path when practical.

Never pass secrets, raw provider ids, private database ids, bearer tokens,
storage keys, or private user data as prompt-visible tool input.

## Browser-Agent UX

Browser agents still matter. Human pages should be easy for browser agents to
inspect:

- semantic headings;
- real `button` and `a` elements;
- labels connected to inputs;
- stable accessible names for important controls;
- visible status text;
- no invisible overlays blocking actions;
- no hover-only critical controls;
- predictable route structure.

But browser automation is not agent readiness by itself. If an agent workflow is
important, build a server-side contract or MCP tool.

## Roadmap Discipline

When an agent-facing capability ships, update in the same slice when practical:

- `public/llms.txt`;
- relevant `/agent-docs/...`;
- API/manifest docs;
- `/features` if public-facing;
- `/admin/roadmap`;
- `/admin/user-journeys`;
- `/admin/work-log`.

If any of those are intentionally deferred, create a follow-up issue with the
missing surface named explicitly.
