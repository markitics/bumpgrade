export const TRUSTED_CODEX_SENDER_EMAILS = [
  "m@rkmoriarty.com",
  "mark@awesound.com",
  "markmoriarty@stripe.com",
] as const;

export const UNTRUSTED_CODEX_SENDER_REPLY =
  "Thanks for your input, we've passed it to the Bumpgrade owner. At this time, only verified senders can steer Codex. Contact the owner if you'd like to become a verified sender.";

export type CodexSenderVerificationStatus = "trusted_authenticated" | "trusted_unverified" | "untrusted_sender";

export type CodexSenderAuthenticationEvidence = {
  policy: "allowlisted-and-authenticated";
  fromEmail: string | null;
  fromDomain: string | null;
  allowedSender: boolean;
  dmarcPassAligned: boolean;
  dkimPassAligned: boolean;
  spfPassAligned: boolean;
  authenticationResults: string[];
};

export type CodexSenderTrustEvaluation = {
  trustedSender: boolean;
  status: CodexSenderVerificationStatus;
  evidence: CodexSenderAuthenticationEvidence;
};

const trustedSenderSet = new Set<string>(TRUSTED_CODEX_SENDER_EMAILS);

function normalizeEmail(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

function emailDomain(value: string | null) {
  const atIndex = value?.lastIndexOf("@") ?? -1;
  return atIndex > -1 ? value?.slice(atIndex + 1).toLowerCase() || null : null;
}

function regexEscape(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function headerValues(headers: Headers, name: string) {
  const value = headers.get(name) ?? headers.get(name.toLowerCase());
  return value ? [value] : [];
}

export function isTrustedCodexSenderIdentity(email: string | null | undefined) {
  const normalized = normalizeEmail(email);
  return normalized ? trustedSenderSet.has(normalized) : false;
}

export function codexAuthenticationResults(headers: Headers) {
  return [
    ...headerValues(headers, "authentication-results"),
    ...headerValues(headers, "arc-authentication-results"),
  ].map((value) => value.replace(/\s+/g, " ").trim());
}

export function evaluateCodexSenderTrust(fromEmail: string | null | undefined, headers: Headers): CodexSenderTrustEvaluation {
  const normalizedFromEmail = normalizeEmail(fromEmail);
  const fromDomain = emailDomain(normalizedFromEmail);
  const allowedSender = isTrustedCodexSenderIdentity(normalizedFromEmail);
  const authenticationResults = codexAuthenticationResults(headers);
  const authText = authenticationResults.join("\n").toLowerCase();
  const domainPattern = fromDomain ? regexEscape(fromDomain) : "";
  const emailPattern = normalizedFromEmail ? regexEscape(normalizedFromEmail) : "";

  const dmarcPassAligned =
    Boolean(fromDomain) &&
    /\bdmarc=pass\b/.test(authText) &&
    new RegExp(`\\bheader\\.from=${domainPattern}\\b`).test(authText);
  const dkimPassAligned =
    Boolean(fromDomain) &&
    /\bdkim=pass\b/.test(authText) &&
    new RegExp(`\\b(?:header\\.)?d=${domainPattern}\\b`).test(authText);
  const spfPassAligned =
    Boolean(normalizedFromEmail) &&
    /\bspf=pass\b/.test(authText) &&
    new RegExp(`\\bsmtp\\.mailfrom=${emailPattern}\\b`).test(authText);
  const authenticated = dmarcPassAligned || dkimPassAligned || spfPassAligned;
  const trustedSender = allowedSender && authenticated;

  return {
    trustedSender,
    status: trustedSender ? "trusted_authenticated" : allowedSender ? "trusted_unverified" : "untrusted_sender",
    evidence: {
      policy: "allowlisted-and-authenticated",
      fromEmail: normalizedFromEmail,
      fromDomain,
      allowedSender,
      dmarcPassAligned,
      dkimPassAligned,
      spfPassAligned,
      authenticationResults,
    },
  };
}
