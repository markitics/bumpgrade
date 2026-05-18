import { getCloudflareContext } from "@opennextjs/cloudflare";

type EmailBinding = {
  send(message: {
    from: string | { name: string; email: string };
    to: string | string[];
    subject: string;
    replyTo?: string | { name: string; email: string };
    cc?: string | string[];
    bcc?: string | string[];
    headers?: Record<string, string>;
    text?: string;
    html?: string;
  }): Promise<unknown>;
};

type EmailEnv = {
  APP_ENV?: string;
  EMAIL?: EmailBinding;
};

export type TransactionalEmail = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

export type TransactionalEmailSendResult =
  | { ok: true; provider: "cloudflare-binding" | "test" | "development" }
  | { ok: false; provider: "cloudflare-binding" | "not-configured"; error: string };

const DEFAULT_FROM = "codex@bumpgrade.com";
const DEFAULT_FROM_NAME = "Bumpgrade Codex";

function getRuntimeEnv(): EmailEnv {
  try {
    const { env } = getCloudflareContext();
    return env as EmailEnv;
  } catch {
    return {};
  }
}

function getAppEnv(env: EmailEnv) {
  return env.APP_ENV ?? process.env.APP_ENV ?? process.env.NODE_ENV ?? "development";
}

function normalizeRecipients(to: string | string[]) {
  return (Array.isArray(to) ? to : [to]).map((recipient) => recipient.trim()).filter(Boolean);
}

function emailErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) return fallback;

  const code = "code" in error && typeof error.code === "string" ? error.code : null;
  return code ? `${code}: ${error.message}` : error.message;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function simpleEmailHtml(title: string, body: string, actionLabel: string, actionUrl: string) {
  const escapedBody = body
    .split("\n")
    .map((line) => escapeHtml(line))
    .join("<br>");

  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111;max-width:620px">',
    `<h1 style="font-size:24px;line-height:1.2;margin:0 0 16px">${escapeHtml(title)}</h1>`,
    `<p style="margin:0 0 18px">${escapedBody}</p>`,
    `<p><a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#174131;color:#fff;text-decoration:none;padding:12px 16px;border-radius:8px;font-weight:700">${escapeHtml(actionLabel)}</a></p>`,
    `<p style="font-size:13px;color:#61665d">If the button does not work, paste this link into your browser:<br>${escapeHtml(actionUrl)}</p>`,
    "</div>",
  ].join("");
}

export async function sendTransactionalEmailWithEnv(
  email: TransactionalEmail,
  env: EmailEnv,
): Promise<TransactionalEmailSendResult> {
  const recipients = normalizeRecipients(email.to);
  const appEnv = getAppEnv(env);

  if (recipients.length === 0) {
    return { ok: false, provider: "not-configured", error: "No email recipient was provided." };
  }

  if (appEnv === "test") {
    console.info("Test email captured.", {
      to: recipients,
      from: DEFAULT_FROM,
      subject: email.subject,
    });
    return { ok: true, provider: "test" };
  }

  if (env.EMAIL) {
    try {
      await env.EMAIL.send({
        from: {
          name: DEFAULT_FROM_NAME,
          email: DEFAULT_FROM,
        },
        to: recipients,
        replyTo: email.replyTo,
        subject: email.subject,
        text: email.text,
        html: email.html,
        headers: email.headers,
      });
      return { ok: true, provider: "cloudflare-binding" };
    } catch (error) {
      return {
        ok: false,
        provider: "cloudflare-binding",
        error: emailErrorMessage(error, "Cloudflare Email binding failed."),
      };
    }
  }

  if (appEnv !== "production") {
    console.info("Email not sent because the Cloudflare Email binding is not configured.", {
      to: recipients,
      subject: email.subject,
    });
    return { ok: true, provider: "development" };
  }

  return {
    ok: false,
    provider: "not-configured",
    error: "Cloudflare Email binding is not configured for this Worker.",
  };
}

export async function sendTransactionalEmail(email: TransactionalEmail) {
  return sendTransactionalEmailWithEnv(email, getRuntimeEnv());
}

export function assertEmailSent(result: TransactionalEmailSendResult) {
  if (!result.ok) {
    throw new Error(result.error);
  }
}
