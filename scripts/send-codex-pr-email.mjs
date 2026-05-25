#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const defaultAccountId = "a139381edda59e39115f93920d1569fd";
const defaultFrom = "codex@bumpgrade.com";
const defaultFromName = "Bumpgrade Codex";

function usage() {
  console.log("Usage: npm run codex:email-pr -- --pr <number> [--version <worker-version>] [--dry-run]");
  process.exit(1);
}

function parseArgs(argv) {
  const args = {
    to: process.env.CODEX_NOTICE_TO ?? process.env.BUMPGRADE_EMAIL_FORWARD_TO ?? process.env.EMAIL_FORWARD_TO ?? null,
    from: process.env.CODEX_NOTICE_FROM ?? defaultFrom,
    fromName: process.env.CODEX_NOTICE_FROM_NAME ?? defaultFromName,
    accountId: process.env.CLOUDFLARE_EMAIL_ACCOUNT_ID ?? defaultAccountId,
    dryRun: false,
    summaries: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") {
      args.dryRun = true;
      continue;
    }

    const next = argv[index + 1];
    if (!next) usage();
    index += 1;

    if (arg === "--pr") args.pr = next;
    else if (arg === "--to") args.to = next;
    else if (arg === "--from") args.from = next;
    else if (arg === "--from-name") args.fromName = next;
    else if (arg === "--version") args.version = next;
    else if (arg === "--summary") args.summaries.push(next);
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.pr) usage();
  if (!args.to) throw new Error("Set CODEX_NOTICE_TO or BUMPGRADE_EMAIL_FORWARD_TO, or pass --to, before sending.");
  return args;
}

function getPr(number) {
  const output = execFileSync(
    "gh",
    ["pr", "view", String(number), "--json", "number,title,url,body,mergedAt,mergeCommit"],
    { encoding: "utf8" },
  );
  return JSON.parse(output);
}

function bodySummaries(body) {
  const lines = String(body ?? "").split("\n");
  const start = lines.findIndex((line) => /^(##\s+)?what'?s done/i.test(line.trim()));
  if (start === -1) return [];

  const bullets = [];
  for (const line of lines.slice(start + 1)) {
    if (/^##\s+/.test(line.trim())) break;
    const match = line.match(/^\s*[*-]\s+(.+)/);
    if (match) bullets.push(match[1].trim());
  }
  return bullets.slice(0, 6);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeEmail({ pr, version, summaries }) {
  const items = summaries.length > 0 ? summaries : bodySummaries(pr.body);
  const subject = `Codex shipped Bumpgrade PR #${pr.number}: ${pr.title}`;
  const bullets = items.map((item) => `- ${item}`).join("\n");
  const text = [
    `Hi Mark, Codex just shipped Bumpgrade PR #${pr.number}: ${pr.title}.`,
    "",
    bullets,
    "",
    `PR: ${pr.url}`,
    "Live site: https://bumpgrade.com",
    version ? `Cloudflare Worker version: ${version}` : null,
    "",
    "Reply to this email if you want this same Codex thread to pick up feedback.",
  ]
    .filter(Boolean)
    .join("\n");

  const htmlBullets =
    items.length > 0
      ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : "";
  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111">',
    `<p>Hi Mark, Codex just shipped Bumpgrade PR #${pr.number}: <strong>${escapeHtml(pr.title)}</strong>.</p>`,
    htmlBullets,
    `<p>PR: <a href="${escapeHtml(pr.url)}">${escapeHtml(pr.url)}</a></p>`,
    '<p>Live site: <a href="https://bumpgrade.com">https://bumpgrade.com</a></p>',
    version ? `<p>Cloudflare Worker version: ${escapeHtml(version)}</p>` : "",
    "<p>Reply to this email if you want this same Codex thread to pick up feedback.</p>",
    "</div>",
  ].join("");

  return { subject, text, html };
}

async function sendEmail({ accountId, token, from, fromName, to, email }) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/email/sending/send`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      to: [to],
      from: { address: from, name: fromName },
      reply_to: from,
      subject: email.subject,
      text: email.text,
      html: email.html,
      headers: {
        "X-Bumpgrade-Codex-Notice": "pr-shipped",
      },
    }),
  });

  const payload = await response.json().catch(() => undefined);
  return { response, payload };
}

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function statusFromResult(ok, result) {
  if (!ok) return "failed";
  if (Array.isArray(result?.delivered) && result.delivered.length > 0) return "delivered";
  if (Array.isArray(result?.queued) && result.queued.length > 0) return "queued";
  if (Array.isArray(result?.permanent_bounces) && result.permanent_bounces.length > 0) return "bounced";
  return "accepted";
}

function insertSql({ id, args, pr, email, payload, status, error }) {
  const now = Math.floor(Date.now() / 1000);
  return `INSERT INTO codex_outbound_messages (
  id, message_kind, status, provider, from_email, from_name, to_emails_json, subject, text_body, html_body,
  pr_number, github_url, worker_version, cloudflare_result_json, error, sent_at, created_at, updated_at
) VALUES (
  ${sqlString(id)}, 'pr_shipped', ${sqlString(status)}, 'cloudflare-rest', ${sqlString(args.from)},
  ${sqlString(args.fromName)}, ${sqlString(JSON.stringify([args.to]))}, ${sqlString(email.subject)},
  ${sqlString(email.text)}, ${sqlString(email.html)}, ${Number(pr.number)}, ${sqlString(pr.url)},
  ${sqlString(args.version ?? null)}, ${sqlString(JSON.stringify(payload?.result ?? null))}, ${sqlString(error)},
  ${now}, ${now}, unixepoch()
)
ON CONFLICT(id) DO UPDATE SET
  status=excluded.status,
  cloudflare_result_json=excluded.cloudflare_result_json,
  error=excluded.error,
  sent_at=excluded.sent_at,
  updated_at=excluded.updated_at;`;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with exit ${result.status}`);
}

function writeD1(sql) {
  const tempDir = mkdtempSync(path.join(tmpdir(), "bumpgrade-codex-email-"));
  const sqlFile = path.join(tempDir, "outbound.sql");
  writeFileSync(sqlFile, sql, "utf8");
  try {
    run("./scripts/with-cloudflare-env.sh", [
      "npx",
      "--yes",
      "wrangler",
      "d1",
      "execute",
      "bumpgrade-prod",
      "--remote",
      "--file",
      sqlFile,
    ], { stdio: "inherit" });
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

const args = parseArgs(process.argv.slice(2));
const pr = getPr(args.pr);
const email = makeEmail({ pr, version: args.version, summaries: args.summaries });
const id = `codex-outbound-pr-${pr.number}-${Date.now()}`;

if (args.dryRun) {
  console.log(JSON.stringify({ id, from: args.from, fromName: args.fromName, to: args.to, subject: email.subject }, null, 2));
  process.exit(0);
}

const token = process.env.CLOUDFLARE_EMAIL_API_TOKEN ?? process.env.CLOUDFLARE_API_TOKEN;
if (!token) throw new Error("Set CLOUDFLARE_EMAIL_API_TOKEN or CLOUDFLARE_API_TOKEN before sending.");

const { response, payload } = await sendEmail({
  accountId: args.accountId,
  token,
  from: args.from,
  fromName: args.fromName,
  to: args.to,
  email,
});
const status = statusFromResult(response.ok && payload?.success === true, payload?.result);
const error = response.ok && payload?.success ? null : payload?.errors?.[0]?.message ?? `Cloudflare Email returned ${response.status}.`;

writeD1(insertSql({ id, args, pr, email, payload, status, error }));

console.log(`Codex PR email ${status} for PR #${pr.number} to ${args.to} from ${args.from}.`);
if (error) console.log(`Provider error: ${error}`);
if (status === "failed" || status === "bounced") process.exitCode = 2;
