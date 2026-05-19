import { sha256Hex } from "@/lib/analytics-events";

export const referralClickCaptureUpdatedAt = "2026-05-19";

export const referralClickCaptureApiRoute = "/api/affiliates/clicks";

export const referralClickCaptureWriteContract = {
  id: "affiliate-referral-click-capture-contract",
  status: "click-capture-ready",
  issue: 109,
  parentIssue: 19,
  apiRoute: referralClickCaptureApiRoute,
  tables: ["affiliate_referral_clicks"],
  publicSafeFields: [
    "referralClickId",
    "referralLinkId",
    "referralCode",
    "partnerId",
    "destinationRoute",
    "duplicate",
    "status",
  ],
  serverPrivateFields: [
    "visitor_key_hash",
    "ip_hash",
    "user_agent_hash",
    "referrer_hash",
    "request_hash",
    "metadata_json",
    "raw cookies",
    "raw contact identifiers",
    "raw buyer identifiers",
    "raw Stripe identifiers",
    "payout or tax data",
  ],
  writeBoundary:
    "Issue #109 can capture seeded referral clicks with idempotency, destination-route validation, hashed request evidence, and public-safe responses. Cookie assignment, buyer attribution, purchase-to-commission matching, fraud enforcement, payout mutation, tax handling, and direct agent affiliate writes require future confirmed-write APIs.",
};

export type ReferralClickLinkDefinition = {
  id: string;
  code: string;
  partnerId: string;
  destinationRoute: string;
  utmSource: string;
};

export type ReferralClickRecordInput = {
  referralLinkId?: string;
  code?: string;
  destinationRoute: string;
  idempotencyKey: string;
  anonymousVisitorKey?: string | null;
  referrer?: string | null;
  requestIp?: string | null;
  userAgent?: string | null;
};

type ReferralClickRow = {
  id: string;
  referral_link_id: string;
  referral_code: string;
  partner_id: string;
  destination_route: string;
};

type ReferralClickResult =
  | {
      ok: true;
      duplicate: boolean;
      status: "recorded";
      referralClickId: string;
      referralLinkId: string;
      referralCode: string;
      partnerId: string;
      destinationRoute: string;
      privateDataIncluded: false;
      rawRequestDataIncluded: false;
    }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
    };

function normalizeIdempotencyKey(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, 180);
}

function normalizeCode(value: string | undefined) {
  const normalized = value?.trim().toUpperCase();
  return normalized || null;
}

async function optionalHash(value: string | null | undefined) {
  if (!value) return null;
  return sha256Hex(value);
}

function publicResult(row: ReferralClickRow, duplicate: boolean): ReferralClickResult {
  return {
    ok: true,
    duplicate,
    status: "recorded",
    referralClickId: row.id,
    referralLinkId: row.referral_link_id,
    referralCode: row.referral_code,
    partnerId: row.partner_id,
    destinationRoute: row.destination_route,
    privateDataIncluded: false,
    rawRequestDataIncluded: false,
  };
}

async function findReferralClickByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT id, referral_link_id, referral_code, partner_id, destination_route
       FROM affiliate_referral_clicks
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<ReferralClickRow>();
}

function findReferralLink(
  links: ReferralClickLinkDefinition[],
  input: Pick<ReferralClickRecordInput, "referralLinkId" | "code">,
) {
  const code = normalizeCode(input.code);
  return links.find((link) => link.id === input.referralLinkId || link.code === code) ?? null;
}

export async function recordReferralClick(
  db: D1Database,
  links: ReferralClickLinkDefinition[],
  input: ReferralClickRecordInput,
): Promise<ReferralClickResult> {
  const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);
  if (!idempotencyKey) {
    return {
      ok: false,
      status: 400,
      code: "idempotency_required",
      message: "An idempotency key is required for referral click capture.",
    };
  }

  const existing = await findReferralClickByIdempotency(db, idempotencyKey);
  if (existing) {
    return publicResult(existing, true);
  }

  const referralLink = findReferralLink(links, input);
  if (!referralLink) {
    return {
      ok: false,
      status: 400,
      code: "unsupported_referral_link",
      message: "Only seeded referral links can be captured.",
    };
  }

  if (referralLink.destinationRoute !== input.destinationRoute) {
    return {
      ok: false,
      status: 400,
      code: "unsupported_destination_route",
      message: "The referral click destination route does not match the seeded referral link.",
    };
  }

  const referralClickId = `referral-click-${crypto.randomUUID()}`;
  const visitorKeyHash = await optionalHash(input.anonymousVisitorKey ? `${referralLink.id}:${input.anonymousVisitorKey}` : null);
  const ipHash = await optionalHash(input.requestIp);
  const userAgentHash = await optionalHash(input.userAgent);
  const referrerHash = await optionalHash(input.referrer);
  const requestHash = await sha256Hex(
    JSON.stringify({
      referralLinkId: referralLink.id,
      referralCode: referralLink.code,
      destinationRoute: referralLink.destinationRoute,
      idempotencyKey,
    }),
  );

  await db
    .prepare(
      `INSERT INTO affiliate_referral_clicks (
        id, referral_link_id, referral_code, partner_id, destination_route, idempotency_key,
        utm_source, visitor_key_hash, ip_hash, user_agent_hash, referrer_hash,
        request_hash, metadata_json, clicked_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      referralClickId,
      referralLink.id,
      referralLink.code,
      referralLink.partnerId,
      referralLink.destinationRoute,
      idempotencyKey,
      referralLink.utmSource,
      visitorKeyHash,
      ipHash,
      userAgentHash,
      referrerHash,
      requestHash,
      JSON.stringify({ issue: 109, privateDataIncluded: false, rawRequestDataIncluded: false }),
    )
    .run();

  const row = await findReferralClickByIdempotency(db, idempotencyKey);
  if (!row) {
    return {
      ok: false,
      status: 500,
      code: "click_not_recorded",
      message: "The referral click could not be recorded.",
    };
  }

  return publicResult(row, false);
}
