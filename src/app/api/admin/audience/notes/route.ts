import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  audienceCrmTimelineApiRoute,
  audienceCrmTimelineConfirmationText,
  audienceCrmTimelineIssue,
  audienceCrmTimelineStatus,
  audienceCrmTimelineWriteContract,
  normalizeTimelineNoteBody,
} from "@/lib/audience-crm";
import { sha256Hex } from "@/lib/audience-opt-in";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type NoteRequestBody = {
  subscriberId?: unknown;
  noteBody?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
  expectedSubscriberStatus?: unknown;
};

type SubscriberRow = {
  id: string;
  status: string;
};

type TimelineEntryRow = {
  id: string;
  subscriber_id: string;
  entry_kind: string;
  status: string;
  body: string;
  idempotency_key: string;
  created_at: number | string;
};

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return cloudflareEnv.DB;
}

async function parseBody(request: NextRequest): Promise<NoteRequestBody> {
  try {
    return (await request.json()) as NoteRequestBody;
  } catch {
    return {};
  }
}

function parseString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function timestampValue(value: number | string) {
  return new Date(Number(value) * 1000).toISOString();
}

function jsonError(status: number, code: string, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, code, message, redaction: audienceCrmTimelineWriteContract.redaction, ...(extra ?? {}) }, { status });
}

function publicNote(row: TimelineEntryRow, duplicate: boolean) {
  return {
    id: row.id,
    subscriberId: row.subscriber_id,
    entryKind: row.entry_kind,
    status: row.status,
    body: row.body,
    duplicate,
    createdAt: timestampValue(row.created_at),
    privateNoteBodyIncluded: true,
  };
}

async function findNoteByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT id, subscriber_id, entry_kind, status, body, idempotency_key, created_at
      FROM audience_timeline_entries
      WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<TimelineEntryRow>();
}

export async function GET(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  return NextResponse.json({
    ok: true,
    id: audienceCrmTimelineWriteContract.id,
    status: audienceCrmTimelineStatus,
    issue: audienceCrmTimelineIssue,
    route: audienceCrmTimelineApiRoute,
    confirmation: audienceCrmTimelineWriteContract.confirmation,
    contract: audienceCrmTimelineWriteContract,
    redaction: audienceCrmTimelineWriteContract.redaction,
  });
}

export async function POST(request: NextRequest) {
  const adminState = await getSessionAdminState(request.headers);
  if (!adminState.identity) {
    return jsonError(401, "owner_session_required", "Owner session required.", {
      denialReason: adminState.denialReason,
    });
  }

  const body = await parseBody(request);
  const subscriberId = parseString(body.subscriberId);
  const expectedSubscriberStatus = parseString(body.expectedSubscriberStatus);
  const noteBody = normalizeTimelineNoteBody(body.noteBody);
  const idempotencyKey = parseString(body.idempotencyKey) ?? request.headers.get("idempotency-key")?.trim();

  if (!subscriberId) return jsonError(400, "subscriber_required", "A subscriber ID is required.");
  if (!expectedSubscriberStatus) return jsonError(400, "expected_status_required", "The current subscriber status is required.");
  if (!noteBody) return jsonError(400, "note_body_required", "A private note body is required.");
  if (!idempotencyKey) return jsonError(400, "idempotency_key_required", "An idempotency key is required.");
  if (body.confirmationText !== audienceCrmTimelineConfirmationText) {
    return jsonError(400, "confirmation_required", "Exact confirmation text is required before creating a private CRM note.");
  }

  const db = await getDb();
  const existing = await findNoteByIdempotency(db, idempotencyKey);
  if (existing) {
    return NextResponse.json({
      ok: true,
      status: "crm_timeline_note_replayed",
      duplicate: true,
      note: publicNote(existing, true),
      redaction: audienceCrmTimelineWriteContract.redaction,
    });
  }

  const subscriber = await db
    .prepare("SELECT id, status FROM audience_subscribers WHERE id = ?")
    .bind(subscriberId)
    .first<SubscriberRow>();

  if (!subscriber) return jsonError(404, "subscriber_not_found", "The subscriber could not be found.");
  if (subscriber.status !== expectedSubscriberStatus) {
    return jsonError(409, "stale_subscriber_status", "The subscriber status changed before the note was created.", {
      currentSubscriberStatus: subscriber.status,
    });
  }

  const noteId = `timeline-entry-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO audience_timeline_entries (
        id, subscriber_id, entry_kind, body, body_hash, status, idempotency_key,
        actor_user_id, actor_email, metadata_json, created_at, updated_at
      ) VALUES (?, ?, 'owner_note', ?, ?, 'active', ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      noteId,
      subscriber.id,
      noteBody,
      await sha256Hex(noteBody),
      idempotencyKey,
      adminState.identity.userId,
      adminState.identity.email,
      JSON.stringify({
        issue: audienceCrmTimelineIssue,
        publicNoteBodiesIncluded: false,
        privateContactDataIncluded: true,
      }),
    )
    .run();

  const note = await findNoteByIdempotency(db, idempotencyKey);
  if (!note) return jsonError(500, "note_not_created", "The private CRM note could not be saved.");

  return NextResponse.json(
    {
      ok: true,
      status: "crm_timeline_note_recorded",
      duplicate: false,
      note: publicNote(note, false),
      redaction: audienceCrmTimelineWriteContract.redaction,
    },
    { status: 201 },
  );
}
