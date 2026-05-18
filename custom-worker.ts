// OpenNext generates the actual Next.js Worker at build time. This wrapper
// keeps a stable Cloudflare Worker entrypoint for future email, routing, and
// markdown handling.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore The generated Worker exists after `opennextjs-cloudflare build`.
import nextWorker from "./.open-next/worker.js";

const defaultForwardTo = "m@rkmoriarty.com";
const maxInboundTextLength = 20_000;
const trustedSenderEmails = new Set([
  "m@rkmoriarty.com",
  "markeffect@gmail.com",
  "markmoriarty@stripe.com",
  "mark@awesound.com",
]);

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

async function captureInboundCodexEmail(message: ForwardableEmailMessage, env: Cloudflare.Env) {
  const id = `codex-inbound-${crypto.randomUUID()}`;
  const receivedAt = new Date();
  const forwardTo = env.EMAIL_FORWARD_TO?.trim() || defaultForwardTo;
  let forwardedAt: Date | null = null;
  let forwardError: string | null = null;

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
  const trustedSender = fromEmail ? trustedSenderEmails.has(fromEmail) : false;

  try {
    await env.DB.prepare(
      `INSERT INTO codex_inbound_messages (
        id, mailbox, from_email, from_name, trusted_sender, subject, snippet, text_body,
        raw_storage_key, raw_size, message_id, in_reply_to, references_header, status,
        received_at, forwarded_at, forward_error, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unread', ?, ?, ?, unixepoch(), unixepoch())`,
    )
      .bind(
        id,
        message.to.toLowerCase(),
        fromEmail,
        extractSenderName(fromHeader),
        trustedSender ? 1 : 0,
        subject,
        rawSnippet(raw),
        raw.slice(0, maxInboundTextLength) || null,
        rawStorageKey,
        message.rawSize ?? raw.length,
        headerValue(message.headers, "message-id"),
        headerValue(message.headers, "in-reply-to"),
        headerValue(message.headers, "references"),
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

const worker: ExportedHandler<Cloudflare.Env> = {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    return nextWorker.fetch(request, env, ctx);
  },

  async email(message, env) {
    await captureInboundCodexEmail(message, env);
  },
};

export default worker;
