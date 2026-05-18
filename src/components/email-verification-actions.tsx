"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, RefreshCw } from "lucide-react";

import {
  ACCOUNT_VERIFICATION_COOLDOWN_SECONDS,
  ACCOUNT_VERIFICATION_EMAIL_SUBJECT,
} from "@/lib/account-verification-copy";

type VerificationStatus = {
  ok: boolean;
  email?: string;
  emailVerified?: boolean;
  cooldownSeconds?: number;
  lastSent?: {
    subject: string;
    status: string;
    provider: string;
    source: string;
    sentAt: string | null;
  } | null;
  error?: string;
};

type EmailVerificationActionsProps = {
  email: string;
  callbackPath: string;
};

function formatSentAt(value: string | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function gmailSearchUrl(subject: string) {
  const query = encodeURIComponent(`from:codex@bumpgrade.com subject:"${subject}"`);
  return `https://mail.google.com/mail/u/0/#search/${query}`;
}

export function EmailVerificationActions({ email, callbackPath }: EmailVerificationActionsProps) {
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const subject = status?.lastSent?.subject ?? ACCOUNT_VERIFICATION_EMAIL_SUBJECT;
  const sentAt = formatSentAt(status?.lastSent?.sentAt);
  const gmailUrl = useMemo(() => gmailSearchUrl(subject), [subject]);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      const response = await fetch("/api/account/email-verification/status", {
        headers: { accept: "application/json" },
      }).catch(() => undefined);
      const payload = (await response?.json().catch(() => undefined)) as VerificationStatus | undefined;

      if (cancelled || !payload) return;

      setStatus(payload);
      setCooldownSeconds(payload.cooldownSeconds ?? 0);
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined;

    const timer = window.setInterval(() => {
      setCooldownSeconds((value) => Math.max(0, value - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);

  async function resendVerificationEmail() {
    if (cooldownSeconds > 0 || isSending) return;

    setIsSending(true);
    setMessage("");

    const callbackURL = new URL(callbackPath, window.location.origin).toString();
    const response = await fetch("/api/auth/send-verification-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, callbackURL }),
    }).catch(() => undefined);
    const payload = (await response?.json().catch(() => undefined)) as { error?: string; message?: string } | undefined;

    if (!response?.ok) {
      setMessage(payload?.message ?? payload?.error ?? "Confirmation email could not be sent right now.");
      setIsSending(false);
      return;
    }

    const now = new Date().toISOString();
    setStatus({
      ok: true,
      email,
      emailVerified: false,
      cooldownSeconds: ACCOUNT_VERIFICATION_COOLDOWN_SECONDS,
      lastSent: {
        subject: ACCOUNT_VERIFICATION_EMAIL_SUBJECT,
        status: "sent",
        provider: "cloudflare-binding",
        source: "signed-in-resend",
        sentAt: now,
      },
    });
    setCooldownSeconds(ACCOUNT_VERIFICATION_COOLDOWN_SECONDS);
    setMessage("We sent a fresh confirmation link.");
    setIsSending(false);
  }

  return (
    <div className="verification-card">
      <div>
        <p className="verification-card-label">Email not yet verified</p>
        <p className="verification-card-copy">
          Check Gmail for the confirmation link, then refresh this admin page after the email is verified.
        </p>
      </div>
      <dl className="verification-meta">
        <div>
          <dt>Subject</dt>
          <dd>{subject}</dd>
        </div>
        <div>
          <dt>Last sent</dt>
          <dd>{sentAt ?? "No Bumpgrade confirmation email is recorded yet."}</dd>
        </div>
      </dl>
      <div className="verification-actions">
        <a className="secondary-action" href={gmailUrl} target="_blank" rel="noreferrer">
          Open Gmail
          <Mail aria-hidden="true" />
        </a>
        <button
          type="button"
          className="primary-action"
          onClick={resendVerificationEmail}
          disabled={isSending || cooldownSeconds > 0}
        >
          {isSending
            ? "Sending..."
            : cooldownSeconds > 0
              ? `Resend available in ${formatCountdown(cooldownSeconds)}`
              : "Resend confirmation email"}
          <RefreshCw aria-hidden="true" />
        </button>
      </div>
      {message ? <p className="verification-message">{message}</p> : null}
    </div>
  );
}
