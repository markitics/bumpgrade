import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextRequest, NextResponse } from "next/server";

import { analyticsDashboard } from "@/lib/analytics-experiments";
import { recordAnalyticsEvent } from "@/lib/analytics-events";
import { audienceAutomationWorkspace } from "@/lib/audience-automation";
import { normalizeOptionalName, normalizeOptInEmail, sha256Hex } from "@/lib/audience-opt-in";

type OptInBody = {
  email?: unknown;
  firstName?: unknown;
  consent?: unknown;
  formId?: unknown;
  idempotencyKey?: unknown;
};

type OptInRuntime = {
  db: D1Database;
};

type SubscriberRow = {
  id: string;
  email: string;
  first_name: string | null;
};

type ExistingConsentRow = {
  subscriber_id: string;
};

async function getRuntime(): Promise<OptInRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

async function parseBody(request: NextRequest): Promise<OptInBody> {
  try {
    return (await request.json()) as OptInBody;
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

async function findSubscriberByConsentIdempotency(db: D1Database, idempotencyKey: string) {
  const existing = await db
    .prepare("SELECT subscriber_id FROM audience_consent_events WHERE idempotency_key = ?")
    .bind(idempotencyKey)
    .first<ExistingConsentRow>();
  if (!existing) return null;

  return db
    .prepare("SELECT id, email, first_name FROM audience_subscribers WHERE id = ?")
    .bind(existing.subscriber_id)
    .first<SubscriberRow>();
}

async function recordAudienceOptInAnalyticsEvent(input: {
  db: D1Database;
  subscriber: SubscriberRow;
  form: (typeof audienceAutomationWorkspace.forms)[number];
  idempotencyKey: string;
  request: NextRequest;
}) {
  const result = await recordAnalyticsEvent(input.db, analyticsDashboard.events, {
    eventDefinitionId: "event-audience-opt-in-created",
    sourceRoute: "/audience/indie-launch-waitlist",
    idempotencyKey: `${input.idempotencyKey}:analytics:event-audience-opt-in-created`,
    publicProperties: {
      formId: input.form.id,
      segmentId: input.form.targetSegmentIds[0] ?? null,
      leadMagnetId: input.form.leadMagnetId,
      consentVersion: "issue-103-consent-statement",
    },
    privateCorrelationId: input.subscriber.id,
    requestIp: requestClientIp(input.request),
    userAgent: input.request.headers.get("user-agent"),
  });

  if (!result.ok) {
    throw new Error(`Audience opt-in analytics event was not recorded: ${result.code}`);
  }
}

function publicResponse(input: {
  subscriber: SubscriberRow;
  formId: string;
  tagIds: string[];
  sequenceId: string;
  duplicate: boolean;
}) {
  return NextResponse.json({
    ok: true,
    status: "subscribed",
    duplicate: input.duplicate,
    subscriberId: input.subscriber.id,
    normalizedEmail: input.subscriber.email,
    firstName: input.subscriber.first_name,
    formId: input.formId,
    tagIds: input.tagIds,
    sequenceId: input.sequenceId,
    emailDeliveryEnabled: false,
    message: "You are on the sandbox launch waitlist. Email delivery is not enabled yet.",
    redaction: {
      privateContactDataIncluded: false,
      providerIdsIncluded: false,
    },
  });
}

export async function POST(request: NextRequest) {
  const { db } = await getRuntime();
  const body = await parseBody(request);
  const form = audienceAutomationWorkspace.forms.find(
    (candidate) => candidate.id === (typeof body.formId === "string" ? body.formId : audienceAutomationWorkspace.forms[0]?.id),
  );
  const sequence = audienceAutomationWorkspace.sequences.find((candidate) => candidate.linkedFormId === form?.id);

  if (!form || !sequence) {
    return jsonError(404, "opt_in_form_not_found", "The requested opt-in form is not available.");
  }

  const email = normalizeOptInEmail(body.email);
  if (!email) {
    return jsonError(400, "invalid_email", "Enter a valid email address.");
  }

  if (body.consent !== true) {
    return jsonError(400, "consent_required", "Consent is required before joining this list.");
  }

  const firstName = normalizeOptionalName(body.firstName);
  const idempotencyKey =
    typeof body.idempotencyKey === "string" && body.idempotencyKey.trim()
      ? body.idempotencyKey.trim()
      : `audience-opt-in-${crypto.randomUUID()}`;
  const duplicateSubscriber = await findSubscriberByConsentIdempotency(db, idempotencyKey);
  if (duplicateSubscriber) {
    await recordAudienceOptInAnalyticsEvent({
      db,
      subscriber: duplicateSubscriber,
      form,
      idempotencyKey,
      request,
    });
    return publicResponse({
      subscriber: duplicateSubscriber,
      formId: form.id,
      tagIds: form.tagIds,
      sequenceId: sequence.id,
      duplicate: true,
    });
  }

  const subscriberId = `subscriber-${crypto.randomUUID()}`;
  const emailHash = await sha256Hex(email);
  await db
    .prepare(
      `INSERT INTO audience_subscribers (
        id, email, email_hash, first_name, status, source_form_id, source_segment_id, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'subscribed', ?, ?, ?, unixepoch(), unixepoch())
      ON CONFLICT(email) DO UPDATE SET
        first_name=COALESCE(excluded.first_name, audience_subscribers.first_name),
        status='subscribed',
        source_form_id=excluded.source_form_id,
        source_segment_id=excluded.source_segment_id,
        updated_at=unixepoch()`,
    )
    .bind(
      subscriberId,
      email,
      emailHash,
      firstName,
      form.id,
      form.targetSegmentIds[0] ?? null,
      JSON.stringify({ issue: 103, source: "public_waitlist_form", privateContactDataIncluded: false }),
    )
    .run();

  const subscriber = await db
    .prepare("SELECT id, email, first_name FROM audience_subscribers WHERE email = ?")
    .bind(email)
    .first<SubscriberRow>();

  if (!subscriber) {
    return jsonError(500, "subscriber_not_created", "The opt-in could not be saved.");
  }

  const ipHash = await optionalHash(requestClientIp(request));
  const userAgentHash = await optionalHash(request.headers.get("user-agent"));
  await db
    .prepare(
      `INSERT OR IGNORE INTO audience_consent_events (
        id, subscriber_id, form_id, consent_statement, consent_kind, status, idempotency_key,
        ip_hash, user_agent_hash, metadata_json, consented_at
      ) VALUES (?, ?, ?, ?, 'launch_follow_up', 'consented', ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      `consent-${crypto.randomUUID()}`,
      subscriber.id,
      form.id,
      form.consentStatement,
      idempotencyKey,
      ipHash,
      userAgentHash,
      JSON.stringify({ issue: 103, rawIpIncluded: false, rawUserAgentIncluded: false }),
    )
    .run();

  for (const tagId of form.tagIds) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO audience_tag_assignments (
          id, subscriber_id, tag_id, source_form_id, status, idempotency_key, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 'active', ?, ?, unixepoch(), unixepoch())`,
      )
      .bind(
        `tag-assignment-${crypto.randomUUID()}`,
        subscriber.id,
        tagId,
        form.id,
        `${idempotencyKey}:${tagId}`,
        JSON.stringify({ issue: 103, privateContactDataIncluded: false }),
      )
      .run();
  }

  await db
    .prepare(
      `INSERT OR IGNORE INTO audience_sequence_enrollments (
        id, subscriber_id, sequence_id, source_form_id, status, idempotency_key, next_step_id,
        metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'draft_enrolled', ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      `sequence-enrollment-${crypto.randomUUID()}`,
      subscriber.id,
      sequence.id,
      form.id,
      `${idempotencyKey}:${sequence.id}`,
      sequence.steps[0]?.id ?? null,
      JSON.stringify({ issue: 103, emailDeliveryEnabled: false, privateContactDataIncluded: false }),
    )
    .run();

  await recordAudienceOptInAnalyticsEvent({
    db,
    subscriber,
    form,
    idempotencyKey,
    request,
  });

  return publicResponse({
    subscriber,
    formId: form.id,
    tagIds: form.tagIds,
    sequenceId: sequence.id,
    duplicate: false,
  });
}
