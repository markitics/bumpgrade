#!/usr/bin/env bash
set -euo pipefail

npm run cf:build

node <<'NODE'
const fs = require("node:fs");

const file = ".open-next/cloudflare/next-env.mjs";
const lines = fs.readFileSync(file, "utf8").split(/\n/).filter(Boolean);
const seen = new Set();
const kept = [];

for (const line of lines) {
  const match = line.match(/^export const ([a-zA-Z_$][\w$]*) = /);
  const key = match?.[1] ?? line;
  if (seen.has(key)) continue;
  seen.add(key);
  kept.push(line);
}

fs.writeFileSync(file, `${kept.join("\n")}\n`);
console.log(`Prepared OpenNext env exports: ${kept.length}`);
NODE

# Keep cache population and Worker upload separate so deploy does not append
# duplicate generated next-env exports before Wrangler bundles the Worker.
scripts/with-cloudflare-env.sh npm exec opennextjs-cloudflare populateCache remote
scripts/with-cloudflare-env.sh env OPEN_NEXT_DEPLOY=true npm exec wrangler deploy
