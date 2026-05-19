import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import {
  audienceUnsubscribeIssue,
  hashUnsubscribeEmail,
  normalizeUnsubscribeEmail,
  normalizeUnsubscribeReason,
} from "@/lib/audience-unsubscribe";
import { sha256Hex } from "@/lib/audience-opt-in";

type UnsubscribeBody = {
  email?: unknown;
  idempotencyKey?: unknown;
  reason?: unknown;
};

type UnsubscribeRuntime = {
  db: D1Database;
};

type SubscriberRow = {
  id: string;
  email: string;
};

type SuppressionRow = {
  id: string;
  email_hash: string;
  subscriber_id: string | null;
  status: string;
  idempotency_key: string;
};

async function getRuntime(): Promise<UnsubscribeRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

async function parseBody(request: NextRequest): Promise<UnsubscribeBody> {
  try {
    return (await request.json()) as UnsubscribeBody;
  } catch {
    return {};
  }
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

function requestClientIp(request: NextRequest) {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
}

async function optionalHash(value: string | null) {
  if (!value) return null;
  return sha256Hex(value);
}

function publicResponse(input: {
  row: SuppressionRow;
  normalizedEmail: string;
  duplicate: boolean;
}) {
  return NextResponse.json({
    ok: true,
    status: "unsubscribed",
    duplicate: input.duplicate,
    suppressionEntryId: input.row.id,
    normalizedEmail: input.normalizedEmail,
    emailDeliveryEnabled: false,
    message: "Unsubscribe preference recorded. Email delivery is not enabled yet.",
    redaction: {
      privateContactDataIncluded: false,
      providerIdsIncluded: false,
      subscriberExistenceRevealed: false,
    },
  });
}

async function findSuppressionByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT id, email_hash, subscriber_id, status, idempotency_key
      FROM audience_suppression_entries
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<SuppressionRow>();
}

export async function POST(request: NextRequest) {
  const { db } = await getRuntime();
  const body = await parseBody(request);
  const email = normalizeUnsubscribeEmail(body.email);
  if (!email) {
    return jsonError(400, "invalid_email", "Enter a valid email address.");
  }

  const idempotencyKey =
    typeof body.idempotencyKey === "string" && body.idempotencyKey.trim()
      ? body.idempotencyKey.trim()
      : `audience-unsubscribe-${crypto.randomUUID()}`;
  const existing = await findSuppressionByIdempotency(db, idempotencyKey);
  if (existing) {
    return publicResponse({ row: existing, normalizedEmail: email, duplicate: true });
  }

  const emailHash = await hashUnsubscribeEmail(email);
  const subscriber = await db
    .prepare("SELECT id, email FROM audience_subscribers WHERE email = ?")
    .bind(email)
    .first<SubscriberRow>();

  if (subscriber) {
    await db
      .prepare("UPDATE audience_subscribers SET status = 'unsubscribed', updated_at = unixepoch() WHERE id = ?")
      .bind(subscriber.id)
      .run();
  }

  const suppressionId = `suppression-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_suppression_entries (
        id, email_hash, subscriber_id, status, suppression_kind, source_route, reason, idempotency_key,
        ip_hash, user_agent_hash, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, 'active', 'unsubscribe', '/api/audience/unsubscribe', ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      suppressionId,
      emailHash,
      subscriber?.id ?? null,
      normalizeUnsubscribeReason(body.reason),
      idempotencyKey,
      await optionalHash(requestClientIp(request)),
      await optionalHash(request.headers.get("user-agent")),
      JSON.stringify({
        issue: audienceUnsubscribeIssue,
        privateContactDataIncluded: false,
        subscriberExistenceRevealed: false,
        emailDeliveryEnabled: false,
      }),
    )
    .run();

  const row = await findSuppressionByIdempotency(db, idempotencyKey);
  if (!row) {
    return jsonError(500, "suppression_not_created", "The unsubscribe preference could not be saved.");
  }

  return publicResponse({ row, normalizedEmail: email, duplicate: false });
}
