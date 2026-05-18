import { and, desc, eq } from "drizzle-orm";

import { getOptionalDb, type AppDb } from "@/db/client";
import { accountVerificationEmails } from "@/db/schema";
import {
  ACCOUNT_VERIFICATION_COOLDOWN_SECONDS,
  ACCOUNT_VERIFICATION_EMAIL_BODY,
  ACCOUNT_VERIFICATION_EMAIL_SUBJECT,
} from "@/lib/account-verification-copy";
import { assertEmailSent, sendTransactionalEmail, simpleEmailHtml, type TransactionalEmailSendResult } from "@/lib/email";

export const ACCOUNT_VERIFICATION_EMAIL_KIND = "account_verification";
export const ACCOUNT_VERIFICATION_EMAIL_FAILURE_MESSAGE = "Confirmation email could not be sent right now.";

type AccountVerificationUser = {
  id?: string | null;
  email: string;
};

type AccountVerificationEmailInput = {
  user: AccountVerificationUser;
  url: string;
  source: "better-auth" | "signed-in-resend";
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function dateToIso(value: Date | number | string | null | undefined) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") return new Date(value > 9999999999 ? value : value * 1000).toISOString();
  return new Date(value).toISOString();
}

export async function recordAccountVerificationEmail(
  input: AccountVerificationEmailInput & { result: TransactionalEmailSendResult },
  db: AppDb | null = getOptionalDb(),
) {
  if (!db) return;

  const now = new Date();
  await db.insert(accountVerificationEmails).values({
    id: `account-verification-${crypto.randomUUID()}`,
    userId: input.user.id ?? null,
    email: normalizeEmail(input.user.email),
    subject: ACCOUNT_VERIFICATION_EMAIL_SUBJECT,
    status: input.result.ok ? "sent" : "failed",
    provider: input.result.provider,
    source: input.source,
    error: input.result.ok ? null : input.result.error.slice(0, 500),
    sentAt: now,
    createdAt: now,
    updatedAt: now,
  });
}

export async function getLatestAccountVerificationEmail(email: string, db: AppDb | null = getOptionalDb()) {
  if (!db) return null;

  const [record] = await db
    .select()
    .from(accountVerificationEmails)
    .where(and(eq(accountVerificationEmails.email, normalizeEmail(email)), eq(accountVerificationEmails.status, "sent")))
    .orderBy(desc(accountVerificationEmails.sentAt))
    .limit(1);

  if (!record) return null;

  const sentAt = dateToIso(record.sentAt);
  const ageSeconds = sentAt ? Math.max(0, Math.floor((Date.now() - new Date(sentAt).getTime()) / 1000)) : null;
  const resendAvailableInSeconds =
    ageSeconds === null ? 0 : Math.max(0, ACCOUNT_VERIFICATION_COOLDOWN_SECONDS - ageSeconds);

  return {
    subject: record.subject,
    status: record.status,
    provider: record.provider,
    source: record.source,
    sentAt,
    resendAvailableInSeconds,
  };
}

export async function sendAccountVerificationEmail(input: AccountVerificationEmailInput) {
  const result = await sendTransactionalEmail({
    to: input.user.email,
    subject: ACCOUNT_VERIFICATION_EMAIL_SUBJECT,
    text: `${ACCOUNT_VERIFICATION_EMAIL_BODY}\n\nConfirm your account: ${input.url}`,
    html: simpleEmailHtml("Confirm your owner email", ACCOUNT_VERIFICATION_EMAIL_BODY, "Confirm email", input.url),
    headers: {
      "X-Bumpgrade-Email-Kind": ACCOUNT_VERIFICATION_EMAIL_KIND,
    },
  });

  await recordAccountVerificationEmail({ ...input, result });
  return result;
}

export function logAccountVerificationEmailFailure(
  input: AccountVerificationEmailInput & { result: Extract<TransactionalEmailSendResult, { ok: false }> },
) {
  console.error("account_verification_email_send_failed", {
    emailKind: ACCOUNT_VERIFICATION_EMAIL_KIND,
    recipientEmail: input.user.email,
    userId: input.user.id ?? null,
    provider: input.result.provider,
    providerError: input.result.error.slice(0, 500),
    source: input.source,
    occurredAt: new Date().toISOString(),
  });
}

export async function sendAccountVerificationEmailOrThrow(input: AccountVerificationEmailInput) {
  const result = await sendAccountVerificationEmail(input);

  if (!result.ok) {
    logAccountVerificationEmailFailure({ ...input, result });
  }

  assertEmailSent(result);
}
