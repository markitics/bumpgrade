#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function parseArgs(argv) {
  const args = { minutes: 70, limit: 20, trustedOnly: true, showBody: false, local: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--all") args.trustedOnly = false;
    else if (arg === "--show-body") args.showBody = true;
    else if (arg === "--local") args.local = true;
    else if (arg === "--minutes") args.minutes = Number(argv[++index] ?? args.minutes);
    else if (arg === "--limit") args.limit = Number(argv[++index] ?? args.limit);
    else if (arg === "--help" || arg === "-h") {
      console.log("Usage: npm run codex:poll-inbox -- [--minutes 70] [--limit 20] [--all] [--show-body] [--local]");
      process.exit(0);
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function sql(args) {
  const trustedClause = args.trustedOnly ? "AND trusted_sender = 1" : "";
  const bodyColumn = args.showBody ? "substr(text_body, 1, 2000) AS body_prefix," : "";
  return `SELECT id, mailbox, from_email, from_name, trusted_sender, subject, status,
  datetime(received_at, 'unixepoch') AS received_at_utc, snippet, ${bodyColumn} raw_storage_key
FROM codex_inbound_messages
WHERE received_at >= unixepoch() - ${Math.max(1, Math.floor(args.minutes)) * 60}
  ${trustedClause}
ORDER BY received_at DESC
LIMIT ${Math.max(1, Math.floor(args.limit))};`;
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.stderr.write(result.stderr ?? "");
    throw new Error(`${command} ${args.join(" ")} failed with exit ${result.status}`);
  }
  return result.stdout ?? "";
}

const args = parseArgs(process.argv.slice(2));
const output = run("./scripts/with-cloudflare-env.sh", [
  "npx",
  "--yes",
  "wrangler",
  "d1",
  "execute",
  "bumpgrade-prod",
  args.local ? "--local" : "--remote",
  "--command",
  sql(args),
]);

process.stdout.write(output);
