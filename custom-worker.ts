// OpenNext generates the actual Next.js Worker at build time. This wrapper
// keeps a stable Cloudflare Worker entrypoint for future email, routing, and
// markdown handling.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore The generated Worker exists after `opennextjs-cloudflare build`.
import nextWorker from "./.open-next/worker.js";
import {
  evaluateCodexSenderTrust,
  parseCodexTrustedSenderEmails,
  UNTRUSTED_CODEX_SENDER_REPLY,
} from "./src/lib/codex-mail-trust";

const defaultForwardTo = "";
const maxInboundTextLength = 20_000;
const codexSenderEmail = "codex@bumpgrade.com";
const codexSenderName = "Bumpgrade Codex";
const anonymousPlaygroundCleanupCron = "17 9 * * *";
const anonymousPlaygroundCleanupBatchLimit = 100;

function headerValue(headers: Headers, name: string) {
  return headers.get(name) ?? headers.get(name.toLowerCase()) ?? null;
}

function extractEmailAddress(value: string | null) {
  if (!value) return null;
  const bracketMatch = value.match(/<([^>]+)>/);
  const candidate = (bracketMatch?.[1] ?? value).trim().toLowerCase();
  const emailMatch = candidate.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  return emailMatch?.[0].toLowerCase() ?? null;
}

function extractSenderName(value: string | null) {
  if (!value) return null;
  const withoutAddress = value.replace(/<[^>]+>/g, "").replace(/^"|"$/g, "").trim();
  return withoutAddress || null;
}

function rawSnippet(raw: string) {
  return raw
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, 500);
}

function sqlTimestamp(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

async function sha256Hex(value: string) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function runtimeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function isoFromSeconds(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function replySubject(subject: string | null) {
  if (!subject) return "Re: Bumpgrade Codex";
  return /^re:/i.test(subject) ? subject : `Re: ${subject}`;
}

async function sendUntrustedSenderReply(
  message: ForwardableEmailMessage,
  env: Cloudflare.Env,
  toEmail: string | null,
  subject: string | null,
) {
  if (!toEmail || !env.EMAIL) {
    return { repliedAt: null, error: env.EMAIL ? "Missing reply recipient." : "EMAIL binding unavailable." };
  }

  try {
    await env.EMAIL.send({
      from: { name: codexSenderName, email: codexSenderEmail },
      to: toEmail,
      subject: replySubject(subject),
      headers: {
        ...(headerValue(message.headers, "message-id") ? { "In-Reply-To": headerValue(message.headers, "message-id") ?? "" } : {}),
        ...(headerValue(message.headers, "references") ? { References: headerValue(message.headers, "references") ?? "" } : {}),
      },
      text: UNTRUSTED_CODEX_SENDER_REPLY,
    });
    return { repliedAt: new Date(), error: null };
  } catch (error) {
    return { repliedAt: null, error: error instanceof Error ? error.message : "Untrusted sender reply failed." };
  }
}

async function captureInboundCodexEmail(message: ForwardableEmailMessage, env: Cloudflare.Env) {
  const id = `codex-inbound-${crypto.randomUUID()}`;
  const receivedAt = new Date();
  const forwardTo = env.BUMPGRADE_EMAIL_FORWARD_TO?.trim() || env.EMAIL_FORWARD_TO?.trim() || defaultForwardTo;
  let forwardedAt: Date | null = null;
  let forwardError: string | null = null;
  let autoRepliedAt: Date | null = null;
  let autoReplyError: string | null = null;

  if (forwardTo) {
    try {
      await message.forward(forwardTo);
      forwardedAt = new Date();
    } catch (error) {
      forwardError = error instanceof Error ? error.message : "Email forwarding failed.";
    }
  }

  const raw = await new Response(message.raw).text().catch(() => "");
  const rawStorageKey = raw ? `codex/email/inbound/${id}.eml` : null;
  if (raw && rawStorageKey && env.MAIL) {
    try {
      await env.MAIL.put(rawStorageKey, raw, {
        httpMetadata: {
          contentType: "message/rfc822",
        },
      });
    } catch (error) {
      console.warn("Codex inbound email raw storage failed", {
        id,
        error: error instanceof Error ? error.message : "Unknown R2 write failure.",
      });
    }
  }

  const fromHeader = headerValue(message.headers, "from") ?? message.from;
  const fromEmail = extractEmailAddress(fromHeader);
  const subject = headerValue(message.headers, "subject");
  const trustEvaluation = evaluateCodexSenderTrust(fromEmail, message.headers, {
    trustedSenderEmails: parseCodexTrustedSenderEmails(env.CODEX_TRUSTED_SENDER_EMAILS),
  });

  if (trustEvaluation.status === "untrusted_sender") {
    const replyResult = await sendUntrustedSenderReply(message, env, fromEmail, subject);
    autoRepliedAt = replyResult.repliedAt;
    autoReplyError = replyResult.error;
  }

  const status =
    trustEvaluation.status === "trusted_authenticated"
      ? "unread"
      : trustEvaluation.status === "trusted_unverified"
        ? "held_unverified"
        : autoReplyError
          ? "untrusted_reply_failed"
          : "rejected_untrusted";

  try {
    await env.DB.prepare(
      `INSERT INTO codex_inbound_messages (
        id, mailbox, from_email, from_name, trusted_sender, subject, snippet, text_body,
        raw_storage_key, raw_size, message_id, in_reply_to, references_header, status,
        sender_verification_status, sender_authentication_json, auto_replied_at, auto_reply_error,
        received_at, forwarded_at, forward_error, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
      .bind(
        id,
        message.to.toLowerCase(),
        fromEmail,
        extractSenderName(fromHeader),
        trustEvaluation.trustedSender ? 1 : 0,
        subject,
        rawSnippet(raw),
        raw.slice(0, maxInboundTextLength) || null,
        rawStorageKey,
        message.rawSize ?? raw.length,
        headerValue(message.headers, "message-id"),
        headerValue(message.headers, "in-reply-to"),
        headerValue(message.headers, "references"),
        status,
        trustEvaluation.status,
        JSON.stringify(trustEvaluation.evidence),
        autoRepliedAt ? sqlTimestamp(autoRepliedAt) : null,
        autoReplyError,
        sqlTimestamp(receivedAt),
        forwardedAt ? sqlTimestamp(forwardedAt) : null,
        forwardError,
      )
      .run();
  } catch (error) {
    console.error("Codex inbound email metadata storage failed", {
      id,
      error: error instanceof Error ? error.message : "Unknown D1 write failure.",
    });
  }

  if (forwardError) {
    console.warn("Codex inbound email captured but forwarding failed", { id, forwardTo, forwardError });
  }
}

async function runScheduledAnonymousPlaygroundCleanup(controller: ScheduledController, env: Cloudflare.Env) {
  const scheduledTime = new Date(controller.scheduledTime);
  const idempotencyKey = `scheduled-anonymous-playground-cleanup:${controller.cron}:${scheduledTime.toISOString()}`;
  const rows = await env.DB.prepare(
    `SELECT id, status, claimed_by_user_id, claimed_tenant_id, expires_at
     FROM anonymous_playground_workspaces
     WHERE status IN ('active', 'claimed')
       AND expires_at <= unixepoch()
     ORDER BY expires_at ASC, updated_at ASC
     LIMIT ?`,
  )
    .bind(anonymousPlaygroundCleanupBatchLimit)
    .all<{
      id: string;
      status: "active" | "claimed";
      claimed_by_user_id: string | null;
      claimed_tenant_id: string | null;
      expires_at: number | null;
    }>();

  let expiredCount = 0;
  let activeExpiredCount = 0;
  let claimedRecoveryExpiredCount = 0;

  for (const row of rows.results ?? []) {
    const replacementTokenHash = await sha256Hex(`bumpgrade-anonymous-playground-expired:${row.id}:${idempotencyKey}`);
    const update = await env.DB.prepare(
      `UPDATE anonymous_playground_workspaces
       SET status = 'expired',
           recovery_token_sha256 = ?,
           offer_name = NULL,
           audience = NULL,
           launch_goal = NULL,
           product_format = NULL,
           price_point = NULL,
           lead_magnet = NULL,
           checkout_plan = NULL,
           delivery_plan = NULL,
           follow_up_plan = NULL,
           source_url = NULL,
           selected_importer_slug = NULL,
           metadata_json = ?,
           updated_at = unixepoch(),
           last_seen_at = unixepoch()
       WHERE id = ?
         AND status IN ('active', 'claimed')
         AND expires_at <= unixepoch()`,
    )
      .bind(
        replacementTokenHash,
        JSON.stringify({
          sourceIssueNumber: 466,
          cleanupStatus: "expired",
          cleanupReason: "retention_window_elapsed",
          cleanupActorRole: "cloudflare_cron",
          scheduledCron: controller.cron,
          scheduledAt: scheduledTime.toISOString(),
          rawDraftContentCleared: true,
          recoveryTokenHashReplaced: true,
          privateClaimRecordsPreserved: true,
          publicPublishingEnabled: false,
          liveCheckoutEnabled: false,
          emailSendsEnabled: false,
          fulfillmentEnabled: false,
        }),
        row.id,
      )
      .run();
    if (!update.meta.changes) continue;

    await env.DB.prepare(
      `INSERT OR IGNORE INTO anonymous_playground_audit_events (
        id, workspace_id, event_kind, idempotency_key, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, unixepoch())`,
    )
      .bind(
        runtimeId("anonymous-playground-audit"),
        row.id,
        "anonymous_playground_scheduled_expired",
        `${idempotencyKey}-${row.id}`,
        JSON.stringify({
          sourceIssueNumber: 466,
          cleanupActorRole: "cloudflare_cron",
          scheduledCron: controller.cron,
          scheduledAt: scheduledTime.toISOString(),
          previousStatus: row.status,
          previousExpiresAt: isoFromSeconds(row.expires_at),
          claimedBeforeCleanup: Boolean(row.claimed_by_user_id || row.claimed_tenant_id),
          rawDraftContentCleared: true,
          recoveryTokenHashReplaced: true,
          privateClaimRecordsPreserved: true,
          paidGoLiveRequired: true,
        }),
      )
      .run();

    expiredCount += 1;
    if (row.status === "claimed") claimedRecoveryExpiredCount += 1;
    else activeExpiredCount += 1;
  }

  console.log("Anonymous playground scheduled cleanup completed", {
    cron: anonymousPlaygroundCleanupCron,
    scheduledAt: scheduledTime.toISOString(),
    expiredCount,
    activeExpiredCount,
    claimedRecoveryExpiredCount,
    batchLimit: anonymousPlaygroundCleanupBatchLimit,
  });
}

const worker: ExportedHandler<Cloudflare.Env> = {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    return nextWorker.fetch(request, env, ctx);
  },

  scheduled(controller, env, ctx) {
    ctx.waitUntil(runScheduledAnonymousPlaygroundCleanup(controller, env));
  },

  async email(message, env) {
    await captureInboundCodexEmail(message, env);
  },
};

export default worker;
