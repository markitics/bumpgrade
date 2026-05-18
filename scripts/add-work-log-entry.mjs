#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

function usage(exitCode = 1) {
  console.log(`Usage: npm run work-log:add -- --file ./entry.json [--comment-pr 123] [--local] [--dry-run]`);
  process.exit(exitCode);
}

function parseArgs(argv) {
  const args = { file: "", commentPr: "", database: "bumpgrade-prod", local: false, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") usage(0);
    else if (arg === "--file") args.file = argv[++index] ?? "";
    else if (arg === "--comment-pr") args.commentPr = argv[++index] ?? "";
    else if (arg === "--database") args.database = argv[++index] ?? "";
    else if (arg === "--local") args.local = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.file) usage();
  return args;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlTimestamp(value) {
  const seconds = Math.floor(new Date(value).getTime() / 1000);
  if (!Number.isFinite(seconds)) throw new Error(`Invalid timestamp: ${value}`);
  return String(seconds);
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeEntry(input) {
  if (!input.title || !input.promptFromMark) {
    throw new Error("Entry requires title and promptFromMark.");
  }
  const completedAt = input.completedAt ?? new Date().toISOString();
  const firstPromptAt = input.firstPromptAt ?? completedAt;
  return {
    id: input.id ?? `work-log-${completedAt.slice(0, 10)}-${slugify(input.title)}`,
    title: input.title,
    agentName: input.agentName ?? "Codex",
    agentKind: input.agentKind ?? "codex",
    sessionName: input.sessionName ?? "bumpgrade-bootstrap",
    promptFromMark: input.promptFromMark,
    githubIssues: normalizeArray(input.githubIssues),
    closedPrs: normalizeArray(input.closedPrs),
    featuresUpdated: normalizeArray(input.featuresUpdated),
    roadmapUpdated: normalizeArray(input.roadmapUpdated),
    userJourneysUpdated: normalizeArray(input.userJourneysUpdated),
    documentationUpdated: normalizeArray(input.documentationUpdated),
    validation: normalizeArray(input.validation),
    flagsAttention: input.flagsAttention ?? null,
    firstPromptAt,
    completedAt,
    relevantUrls: normalizeArray(input.relevantUrls),
    prCommentUrl: input.prCommentUrl ?? null,
  };
}

function insertSql(entry) {
  return `INSERT INTO admin_work_log_entries (
  id, title, agent_name, agent_kind, session_name, prompt_from_mark,
  github_issues_json, closed_prs_json, features_updated_json, roadmap_updated_json,
  user_journeys_updated_json, documentation_updated_json, validation_json,
  flags_attention, first_prompt_at, completed_at, relevant_urls_json, pr_comment_url, updated_at
) VALUES (
  ${sqlString(entry.id)}, ${sqlString(entry.title)}, ${sqlString(entry.agentName)}, ${sqlString(entry.agentKind)},
  ${sqlString(entry.sessionName)}, ${sqlString(entry.promptFromMark)}, ${sqlString(JSON.stringify(entry.githubIssues))},
  ${sqlString(JSON.stringify(entry.closedPrs))}, ${sqlString(JSON.stringify(entry.featuresUpdated))},
  ${sqlString(JSON.stringify(entry.roadmapUpdated))}, ${sqlString(JSON.stringify(entry.userJourneysUpdated))},
  ${sqlString(JSON.stringify(entry.documentationUpdated))}, ${sqlString(JSON.stringify(entry.validation))},
  ${sqlString(entry.flagsAttention)}, ${sqlTimestamp(entry.firstPromptAt)}, ${sqlTimestamp(entry.completedAt)},
  ${sqlString(JSON.stringify(entry.relevantUrls))}, ${sqlString(entry.prCommentUrl)}, unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  title=excluded.title,
  prompt_from_mark=excluded.prompt_from_mark,
  github_issues_json=excluded.github_issues_json,
  closed_prs_json=excluded.closed_prs_json,
  features_updated_json=excluded.features_updated_json,
  roadmap_updated_json=excluded.roadmap_updated_json,
  user_journeys_updated_json=excluded.user_journeys_updated_json,
  documentation_updated_json=excluded.documentation_updated_json,
  validation_json=excluded.validation_json,
  flags_attention=excluded.flags_attention,
  completed_at=excluded.completed_at,
  relevant_urls_json=excluded.relevant_urls_json,
  pr_comment_url=excluded.pr_comment_url,
  updated_at=excluded.updated_at;`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with exit ${result.status}`);
  return result.stdout ?? "";
}

function commentOnPr(prNumber, entry) {
  const body = `## Agent work log: ${entry.title}

- Prompt from Mark: ${entry.promptFromMark}
- Issues: ${entry.githubIssues.map((issue) => issue.number ? `#${issue.number}` : issue.url).join(", ") || "None"}
- PRs: ${entry.closedPrs.map((pr) => pr.number ? `#${pr.number}` : pr.url).join(", ") || "None"}
- Validation: ${entry.validation.join("; ") || "None recorded"}
- Attention: ${entry.flagsAttention ?? ""}
- Completed at: ${entry.completedAt}`;
  const tempDir = mkdtempSync(path.join(tmpdir(), "bumpgrade-work-log-"));
  const inputFile = path.join(tempDir, "comment.json");
  writeFileSync(inputFile, JSON.stringify({ body }), "utf8");
  try {
    const output = run("gh", ["api", "-X", "POST", `repos/markitics/bumpgrade/issues/${prNumber}/comments`, "--input", inputFile]);
    return JSON.parse(output).html_url ?? null;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

function writeD1(sql, args) {
  const tempDir = mkdtempSync(path.join(tmpdir(), "bumpgrade-work-log-"));
  const sqlFile = path.join(tempDir, "entry.sql");
  writeFileSync(sqlFile, sql, "utf8");
  try {
    const wranglerArgs = ["--yes", "wrangler", "d1", "execute", args.database, args.local ? "--local" : "--remote", "--file", sqlFile];
    const command = args.local ? "npx" : "./scripts/with-cloudflare-env.sh";
    const commandArgs = args.local ? wranglerArgs : ["npx", ...wranglerArgs];
    run(command, commandArgs, { stdio: "inherit" });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

try {
  const args = parseArgs(process.argv.slice(2));
  const entry = normalizeEntry(JSON.parse(readFileSync(args.file, "utf8")));
  if (args.commentPr && !entry.prCommentUrl) {
    entry.prCommentUrl = commentOnPr(args.commentPr, entry);
  }
  const sql = insertSql(entry);
  if (args.dryRun) {
    console.log(sql);
    process.exit(0);
  }
  writeD1(sql, args);
  console.log(`Inserted work-log entry ${entry.id} into ${args.local ? "local" : "remote"} ${args.database}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
