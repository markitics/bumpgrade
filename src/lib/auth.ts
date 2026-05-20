import { getCloudflareContext } from "@opennextjs/cloudflare";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { memoryAdapter, type MemoryDB } from "better-auth/adapters/memory";
import { nextCookies } from "better-auth/next-js";

import type { AppDb } from "@/db/client";
import { getOptionalDb } from "@/db/client";
import * as schema from "@/db/schema";
import { sendAccountVerificationEmailOrThrow } from "@/lib/account-verification-email";

const localAuthMemoryDb: MemoryDB = {};

function compactOrigins(origins: Array<string | undefined>) {
  return Array.from(new Set(origins.filter((origin): origin is string => Boolean(origin))));
}

function hostFromUrl(value: string | undefined) {
  if (!value) return null;

  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export type BetterAuthSessionBoundary = {
  authUrl: string;
  siteUrl: string | null;
  trustedOrigins: string[];
  cookieDomain: string | null;
  crossSubDomainCookiesEnabled: boolean;
  bumpgradeHostedSubdomainsShareLogin: boolean;
  customDomainsCanShareCookieDirectly: boolean;
  customDomainAuthStrategy: string;
  isolationBoundary: string;
};

export function betterAuthCookieDomain(authUrl: string, configuredCookieDomain = getRuntimeEnvValue("BETTER_AUTH_COOKIE_DOMAIN")) {
  const configured = configuredCookieDomain?.trim().toLowerCase().replace(/^\./, "");
  if (configured) return configured;

  const host = hostFromUrl(authUrl);
  if (host === "bumpgrade.com" || host === "www.bumpgrade.com") return "bumpgrade.com";

  return null;
}

export function describeBetterAuthSessionBoundary(input?: {
  authUrl?: string;
  siteUrl?: string | null;
  cookieDomain?: string | null;
}): BetterAuthSessionBoundary {
  const siteUrl = input?.siteUrl ?? getRuntimeEnvValue("PUBLIC_SITE_URL") ?? null;
  const authUrl = input?.authUrl ?? getRuntimeEnvValue("BETTER_AUTH_URL") ?? siteUrl ?? "http://localhost:3000";
  const cookieDomain = betterAuthCookieDomain(authUrl, input?.cookieDomain ?? undefined);
  const trustedOrigins = compactOrigins([
    authUrl,
    siteUrl ?? undefined,
    "https://bumpgrade.com",
    "https://www.bumpgrade.com",
    "https://*.bumpgrade.com",
    "http://localhost:*",
    "http://127.0.0.1:*",
  ]);

  return {
    authUrl,
    siteUrl,
    trustedOrigins,
    cookieDomain,
    crossSubDomainCookiesEnabled: Boolean(cookieDomain),
    bumpgradeHostedSubdomainsShareLogin: cookieDomain === "bumpgrade.com",
    customDomainsCanShareCookieDirectly: false,
    customDomainAuthStrategy:
      "Use the central bumpgrade.com auth session for identity and return to the custom domain after tenant lookup; do not try to set bumpgrade.com cookies on unrelated publisher-owned domains.",
    isolationBoundary:
      "The shared session proves identity only. Every publisher-site read or write must still resolve the requested hostname to a tenant and enforce tenant-scoped entitlements before returning private data.",
  };
}

export function getRuntimeEnvValue(key: string) {
  const processValue = process.env[key];
  if (processValue) return processValue;

  try {
    const { env } = getCloudflareContext();
    const value = (env as Record<string, string | undefined>)[key];
    if (value) return value;
  } catch {
    // Fall through to process.env for local Next dev and build-time checks.
  }
}

export function getAppEnv() {
  return getRuntimeEnvValue("APP_ENV") ?? process.env.NODE_ENV ?? "development";
}

export function getBetterAuthSecret() {
  const secret = getRuntimeEnvValue("BETTER_AUTH_SECRET");
  if (secret) return secret;

  if (getAppEnv() === "production") {
    throw new Error("BETTER_AUTH_SECRET is not configured.");
  }

  return "bumpgrade-local-dev-better-auth-secret-do-not-use-in-production";
}

export function createAuth(db: AppDb | null = getOptionalDb()) {
  const siteUrl = getRuntimeEnvValue("PUBLIC_SITE_URL");
  const authUrl = getRuntimeEnvValue("BETTER_AUTH_URL") ?? siteUrl ?? "http://localhost:3000";
  const sessionBoundary = describeBetterAuthSessionBoundary({ authUrl, siteUrl });
  const appEnv = getAppEnv();

  if (!db && appEnv === "production") {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }

  return betterAuth({
    appName: "Bumpgrade",
    baseURL: authUrl,
    trustedOrigins: sessionBoundary.trustedOrigins,
    secret: getBetterAuthSecret(),
    advanced: {
      ...(sessionBoundary.cookieDomain
        ? {
            crossSubDomainCookies: {
              enabled: true,
              domain: sessionBoundary.cookieDomain,
            },
          }
        : {}),
      ipAddress: {
        ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
      },
    },
    rateLimit: {
      enabled: appEnv !== "test",
    },
    database: db
      ? drizzleAdapter(db, {
          provider: "sqlite",
          schema,
          usePlural: false,
          transaction: false,
        })
      : memoryAdapter(localAuthMemoryDb),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      async sendVerificationEmail({ user, url }) {
        await sendAccountVerificationEmailOrThrow({ user, url, source: "better-auth" });
      },
    },
    plugins: [nextCookies()],
  });
}
