import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const stripeSource = readFileSync("src/lib/stripe.ts", "utf8");
const webhookSource = readFileSync("src/app/api/stripe/webhook/route.ts", "utf8");
const wranglerConfig = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));

const checks = [
  {
    name: "Stripe live secret prefers Cloudflare runtime env",
    source: stripeSource,
    pattern: /return env\.STRIPE_SECRET_KEY_LIVE \?\? process\.env\.STRIPE_SECRET_KEY_LIVE;/,
  },
  {
    name: "Stripe sandbox secret prefers Cloudflare runtime env",
    source: stripeSource,
    pattern: /return env\.STRIPE_SECRET_KEY_SANDBOX \?\? process\.env\.STRIPE_SECRET_KEY_SANDBOX;/,
  },
  {
    name: "Webhook live secret prefers Cloudflare runtime env",
    source: webhookSource,
    pattern: /return env\.STRIPE_WEBHOOK_SECRET_LIVE \?\? process\.env\.STRIPE_WEBHOOK_SECRET_LIVE;/,
  },
  {
    name: "Webhook sandbox secret prefers Cloudflare runtime env",
    source: webhookSource,
    pattern: /return env\.STRIPE_WEBHOOK_SECRET_SANDBOX \?\? process\.env\.STRIPE_WEBHOOK_SECRET_SANDBOX;/,
  },
  {
    name: "Webhook APP_ENV prefers Cloudflare runtime env",
    source: webhookSource,
    pattern: /return env\.APP_ENV \?\? process\.env\.APP_ENV \?\? process\.env\.NODE_ENV \?\? "development";/,
  },
];

for (const check of checks) {
  assert.match(check.source, check.pattern, check.name);
}

assert.equal(
  wranglerConfig.vars?.NEXT_PRIVATE_MINIMAL_MODE,
  "1",
  "Worker runtime vars keep NEXT_PRIVATE_MINIMAL_MODE enabled for deployed OpenNext routes",
);

console.log(`runtime secret precedence checks passed (${checks.length + 1})`);
