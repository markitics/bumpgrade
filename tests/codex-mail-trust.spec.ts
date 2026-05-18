import { expect, test } from "@playwright/test";

import {
  evaluateCodexSenderTrust,
  TRUSTED_CODEX_SENDER_EMAILS,
  UNTRUSTED_CODEX_SENDER_REPLY,
} from "../src/lib/codex-mail-trust";

test.describe("Codex inbound mail trust policy", () => {
  test("uses exactly Mark's three trusted sender identities", () => {
    expect(TRUSTED_CODEX_SENDER_EMAILS).toEqual([
      "m@rkmoriarty.com",
      "mark@awesound.com",
      "markmoriarty@stripe.com",
    ]);
  });

  test("trusts an allowlisted sender only when DMARC aligns", () => {
    const headers = new Headers({
      "authentication-results":
        "mx.cloudflare.net; dmarc=pass header.from=awesound.com; dkim=pass header.d=awesound.com; spf=pass smtp.mailfrom=mark@awesound.com",
    });

    const evaluation = evaluateCodexSenderTrust("mark@awesound.com", headers);

    expect(evaluation.trustedSender).toBe(true);
    expect(evaluation.status).toBe("trusted_authenticated");
    expect(evaluation.evidence.dmarcPassAligned).toBe(true);
  });

  test("holds an allowlisted sender when authentication does not align", () => {
    const headers = new Headers({
      "authentication-results":
        "mx.cloudflare.net; dmarc=none header.from=rkmoriarty.com; spf=pass smtp.mailfrom=markeffect@gmail.com; arc=pass",
    });

    const evaluation = evaluateCodexSenderTrust("m@rkmoriarty.com", headers);

    expect(evaluation.trustedSender).toBe(false);
    expect(evaluation.status).toBe("trusted_unverified");
    expect(evaluation.evidence.allowedSender).toBe(true);
    expect(evaluation.evidence.spfPassAligned).toBe(false);
  });

  test("rejects removed or unlisted sender identities even with authentication", () => {
    const headers = new Headers({
      "authentication-results": "mx.cloudflare.net; dmarc=pass header.from=gmail.com; spf=pass smtp.mailfrom=markeffect@gmail.com",
    });

    const evaluation = evaluateCodexSenderTrust("markeffect@gmail.com", headers);

    expect(evaluation.trustedSender).toBe(false);
    expect(evaluation.status).toBe("untrusted_sender");
    expect(evaluation.evidence.allowedSender).toBe(false);
  });

  test("keeps the untrusted sender acknowledgement safe and non-executing", () => {
    expect(UNTRUSTED_CODEX_SENDER_REPLY).toBe(
      "Thanks for your input, we've passed it on to Mark. At this time, only verified senders can steer Codex. Contact Mark if you'd like to become a verified senders.",
    );
  });
});
