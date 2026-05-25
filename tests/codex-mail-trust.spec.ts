import { expect, test } from "@playwright/test";

import {
  CODEX_TRUSTED_SENDER_EMAILS_ENV,
  configuredCodexTrustedSenderEmails,
  evaluateCodexSenderTrust,
  parseCodexTrustedSenderEmails,
  UNTRUSTED_CODEX_SENDER_REPLY,
} from "../src/lib/codex-mail-trust";

test.describe("Codex inbound mail trust policy", () => {
  const trustedSenderEmails = ["owner@example.test", "agent-operator@example.test"];

  test("loads trusted sender identities from private runtime configuration", () => {
    expect(parseCodexTrustedSenderEmails(" Owner@Example.test,agent-operator@example.test ; ")).toEqual(
      trustedSenderEmails,
    );

    const previous = process.env[CODEX_TRUSTED_SENDER_EMAILS_ENV];
    delete process.env[CODEX_TRUSTED_SENDER_EMAILS_ENV];
    expect(configuredCodexTrustedSenderEmails()).toEqual([]);
    process.env[CODEX_TRUSTED_SENDER_EMAILS_ENV] = "owner@example.test, agent-operator@example.test";
    expect(configuredCodexTrustedSenderEmails()).toEqual(trustedSenderEmails);
    if (previous === undefined) delete process.env[CODEX_TRUSTED_SENDER_EMAILS_ENV];
    else process.env[CODEX_TRUSTED_SENDER_EMAILS_ENV] = previous;
  });

  test("trusts an allowlisted sender only when DMARC aligns", () => {
    const headers = new Headers({
      "authentication-results":
        "mx.cloudflare.net; dmarc=pass header.from=example.test; dkim=pass header.d=example.test; spf=pass smtp.mailfrom=owner@example.test",
    });

    const evaluation = evaluateCodexSenderTrust("owner@example.test", headers, { trustedSenderEmails });

    expect(evaluation.trustedSender).toBe(true);
    expect(evaluation.status).toBe("trusted_authenticated");
    expect(evaluation.evidence.dmarcPassAligned).toBe(true);
  });

  test("holds an allowlisted sender when authentication does not align", () => {
    const headers = new Headers({
      "authentication-results":
        "mx.cloudflare.net; dmarc=none header.from=example.test; spf=pass smtp.mailfrom=other@example.test; arc=pass",
    });

    const evaluation = evaluateCodexSenderTrust("owner@example.test", headers, { trustedSenderEmails });

    expect(evaluation.trustedSender).toBe(false);
    expect(evaluation.status).toBe("trusted_unverified");
    expect(evaluation.evidence.allowedSender).toBe(true);
    expect(evaluation.evidence.spfPassAligned).toBe(false);
  });

  test("rejects removed or unlisted sender identities even with authentication", () => {
    const headers = new Headers({
      "authentication-results": "mx.cloudflare.net; dmarc=pass header.from=example.test; spf=pass smtp.mailfrom=other@example.test",
    });

    const evaluation = evaluateCodexSenderTrust("other@example.test", headers, { trustedSenderEmails });

    expect(evaluation.trustedSender).toBe(false);
    expect(evaluation.status).toBe("untrusted_sender");
    expect(evaluation.evidence.allowedSender).toBe(false);
  });

  test("keeps the untrusted sender acknowledgement safe and non-executing", () => {
    expect(UNTRUSTED_CODEX_SENDER_REPLY).toBe(
      "Thanks for your input, we've passed it to the Bumpgrade owner. At this time, only verified senders can steer Codex. Contact the owner if you'd like to become a verified sender.",
    );
  });
});
