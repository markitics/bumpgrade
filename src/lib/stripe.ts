import Stripe from "stripe";

import { stripeApiVersion, type StripeMode } from "@/lib/commerce";

type StripeEnv = Pick<
  Cloudflare.Env,
  "STRIPE_ACTIVE_MODE" | "STRIPE_SECRET_KEY_LIVE" | "STRIPE_SECRET_KEY_SANDBOX" | "STRIPE_API_VERSION"
>;

export function stripeModeFromEnv(env: StripeEnv): StripeMode {
  return env.STRIPE_ACTIVE_MODE === "live" ? "live" : "sandbox";
}

export function stripeSecretKeyFromEnv(env: StripeEnv, mode = stripeModeFromEnv(env)) {
  return mode === "live" ? env.STRIPE_SECRET_KEY_LIVE : env.STRIPE_SECRET_KEY_SANDBOX;
}

export function createStripeClient(secretKey: string) {
  return new Stripe(secretKey, {
    apiVersion: stripeApiVersion,
    httpClient: Stripe.createFetchHttpClient(),
    appInfo: {
      name: "Bumpgrade",
      url: "https://bumpgrade.com",
    },
  });
}

export function createStripeClientFromEnv(env: StripeEnv) {
  const mode = stripeModeFromEnv(env);
  const secretKey = stripeSecretKeyFromEnv(env, mode);

  if (!secretKey) {
    throw new Error(`Missing Stripe secret for ${mode} mode.`);
  }

  if (env.STRIPE_API_VERSION && env.STRIPE_API_VERSION !== stripeApiVersion) {
    throw new Error(`STRIPE_API_VERSION must be ${stripeApiVersion}.`);
  }

  return createStripeClient(secretKey);
}
