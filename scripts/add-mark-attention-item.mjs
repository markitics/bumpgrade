#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

function parseArgs(argv) {
  const args = { file: "", database: "bumpgrade-prod", local: false, dryRun: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--file") args.file = argv[++index] ?? "";
    else if (arg === "--database") args.database = argv[++index] ?? "";
    else if (arg === "--local") args.local = true;
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--help" || arg === "-h") {
      console.log("Usage: npm run for-mark:add -- --file ./attention.json [--local] [--dry-run]");
      process.exit(0);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.file) throw new Error("Missing --file");
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

function normalizeItem(input) {
  if (!input.category || !input.title || !input.summary) {
    throw new Error("Attention item requires category, title, and summary.");
  }
  const now = new Date().toISOString();
  const createdAt = input.createdAt ?? now;
  return {
    id: input.id ?? `mark-attention-${createdAt.slice(0, 10)}-${input.category}-${slugify(input.title)}`,
    category: input.category,
    state: input.state ?? "open",
    urgency: input.urgency ?? (input.category === "blocked" ? "high" : "medium"),
    title: input.title,
    summary: input.summary,
    details: input.details ?? null,
    requiredAction: input.requiredAction ?? null,
    responseInstructions: input.responseInstructions ?? null,
    sessionName: input.sessionName ?? "bumpgrade-bootstrap",
    sessionId: input.sessionId ?? null,
    sessionEmail: input.sessionEmail ?? "codex@bumpgrade.com",
    sourceAgent: input.sourceAgent ?? "Codex",
    sourceKind: input.sourceKind ?? "codex",
    links: Array.isArray(input.links) ? input.links : [],
    metadata: input.metadata ?? {},
    lastActivityAt: input.lastActivityAt ?? createdAt,
    createdAt,
  };
}

function insertSql(item) {
  return `INSERT INTO mark_attention_items (
  id, category, state, urgency, title, summary, details, required_action, response_instructions,
  session_name, session_id, session_email, source_agent, source_kind, links_json, metadata_json,
  last_activity_at, created_at, updated_at
) VALUES (
  ${sqlString(item.id)}, ${sqlString(item.category)}, ${sqlString(item.state)}, ${sqlString(item.urgency)},
  ${sqlString(item.title)}, ${sqlString(item.summary)}, ${sqlString(item.details)}, ${sqlString(item.requiredAction)},
  ${sqlString(item.responseInstructions)}, ${sqlString(item.sessionName)}, ${sqlString(item.sessionId)},
  ${sqlString(item.sessionEmail)}, ${sqlString(item.sourceAgent)}, ${sqlString(item.sourceKind)},
  ${sqlString(JSON.stringify(item.links))}, ${sqlString(JSON.stringify(item.metadata))},
  ${sqlTimestamp(item.lastActivityAt)}, ${sqlTimestamp(item.createdAt)}, unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  category=excluded.category,
  state=excluded.state,
  urgency=excluded.urgency,
  title=excluded.title,
  summary=excluded.summary,
  details=excluded.details,
  required_action=excluded.required_action,
  response_instructions=excluded.response_instructions,
  links_json=excluded.links_json,
  metadata_json=excluded.metadata_json,
  last_activity_at=excluded.last_activity_at,
  updated_at=excluded.updated_at;`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with exit ${result.status}`);
}

function writeD1(sql, args) {
  const tempDir = mkdtempSync(path.join(tmpdir(), "bumpgrade-for-mark-"));
  const sqlFile = path.join(tempDir, "attention.sql");
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
  const item = normalizeItem(JSON.parse(readFileSync(args.file, "utf8")));
  const sql = insertSql(item);
  if (args.dryRun) {
    console.log(sql);
    process.exit(0);
  }
  writeD1(sql, args);
  console.log(`Inserted Mark attention item ${item.id} into ${args.local ? "local" : "remote"} ${args.database}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
