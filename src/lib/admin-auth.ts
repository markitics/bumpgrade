import { headers as nextHeaders } from "next/headers";

import { createAuth, getAppEnv, getRuntimeEnvValue } from "@/lib/auth";
import type { AdminIdentity, AdminRole } from "@/lib/admin-roles";
export { roleLabel } from "@/lib/admin-roles";

const DEFAULT_OWNER_EMAILS = ["m@rkmoriarty.com"];

export type SessionAdminState = {
  identity: AdminIdentity | null;
  userId: string | null;
  userEmail: string | null;
  userEmailVerified: boolean | null;
  userName: string | null;
  denialReason: "signed_out" | "not_allowlisted" | "email_unverified" | "session_unavailable" | null;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseEmailList(value: string | undefined) {
  if (!value) return [];

  return value
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

function uniqueEmails(emails: string[]) {
  return Array.from(new Set(emails.map(normalizeEmail)));
}

export function getOwnerEmails() {
  return uniqueEmails([
    ...DEFAULT_OWNER_EMAILS,
    ...parseEmailList(getRuntimeEnvValue("PLATFORM_OWNER_EMAILS")),
    ...parseEmailList(getRuntimeEnvValue("BUMPGRADE_OWNER_EMAILS")),
    ...parseEmailList(getRuntimeEnvValue("OWNER_EMAILS")),
  ]);
}

export function getRoleForEmail(email: string | null | undefined): Exclude<AdminRole, "automation"> | null {
  if (!email) return null;

  const normalized = normalizeEmail(email);
  if (getOwnerEmails().includes(normalized)) return "owner";

  return null;
}

function canUseUnverifiedAdminEmail(role: Exclude<AdminRole, "automation">) {
  const enforceEmailVerification = getRuntimeEnvValue("BUMPGRADE_ENFORCE_EMAIL_VERIFICATION") === "true";
  return role === "owner" && getAppEnv() !== "production" && !enforceEmailVerification;
}

export async function getSessionAdminState(headers: Headers): Promise<SessionAdminState> {
  try {
    const session = await createAuth().api.getSession({
      headers,
    });
    const user = session?.user;
    const role = getRoleForEmail(user?.email);

    if (!user) {
      return {
        identity: null,
        userId: null,
        userEmail: null,
        userEmailVerified: null,
        userName: null,
        denialReason: "signed_out",
      };
    }

    const normalizedEmail = normalizeEmail(user.email);
    const emailVerified = user.emailVerified === true;

    if (!role) {
      return {
        identity: null,
        userId: user.id,
        userEmail: normalizedEmail,
        userEmailVerified: emailVerified,
        userName: user.name || user.email,
        denialReason: "not_allowlisted",
      };
    }

    if (!emailVerified && !canUseUnverifiedAdminEmail(role)) {
      return {
        identity: null,
        userId: user.id,
        userEmail: normalizedEmail,
        userEmailVerified: emailVerified,
        userName: user.name || user.email,
        denialReason: "email_unverified",
      };
    }

    return {
      identity: {
        role,
        email: normalizedEmail,
        userId: user.id,
        name: user.name || user.email,
      },
      userId: user.id,
      userEmail: normalizedEmail,
      userEmailVerified: emailVerified,
      userName: user.name || user.email,
      denialReason: null,
    };
  } catch (error) {
    console.error("admin session check failed", error);

    return {
      identity: null,
      userId: null,
      userEmail: null,
      userEmailVerified: null,
      userName: null,
      denialReason: "session_unavailable",
    };
  }
}

export async function getCurrentAdminState() {
  return getSessionAdminState(new Headers(await nextHeaders()));
}
