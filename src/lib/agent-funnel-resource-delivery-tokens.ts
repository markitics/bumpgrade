import type { AdminIdentity } from "@/lib/admin-roles";
import { sha256Hex } from "@/lib/analytics-events";
import {
  createFunnelResourceDeliveryToken,
  funnelResourceDeliveryRedaction,
  type FunnelResourceDeliveryTokenResult,
} from "@/lib/funnel-resource-delivery";
import { getFunnelDraftD1OrThrow, getPublishedD1FunnelBySlug } from "@/lib/funnel-drafts";
import {
  agentFunnelResourceDeliveryTokenApiRoute,
  agentFunnelResourceDeliveryTokenConfirmationText,
  agentFunnelResourceDeliveryTokenIssue,
  agentFunnelResourceDeliveryTokenStatus,
  type FunnelBlock,
  type FunnelRecord,
} from "@/lib/funnels";

export const agentFunnelResourceDeliveryTokenTable = "agent_funnel_resource_delivery_token_requests";

type AgentFunnelResourceDeliveryTokenInput = {
  actor: AdminIdentity;
  funnelSlug?: unknown;
  blockId?: unknown;
  checkoutIntentId?: unknown;
  entitlementId?: unknown;
  expectedFunnelRevisionId?: unknown;
  confirmationText?: unknown;
  idempotencyKey?: unknown;
  auditCorrelationId?: unknown;
};

type AgentFunnelResourceDeliveryTokenAuditRow = {
  id: string;
  owner_scope: string;
  idempotency_key_sha256: string;
  request_signature_sha256: string;
  audit_correlation_id: string;
  funnel_slug: string;
  funnel_revision_id: string;
  block_id: string;
  checkout_intent_id: string;
  entitlement_id: string;
  status: string;
  delivery_token_created: number;
  download_token_expires_at: number | string | null;
  product_id: string | null;
  asset_id: string | null;
  result_status: string | null;
  error_status: string | null;
  error_message: string | null;
  replay_count: number;
  created_at: number | string;
  updated_at: number | string;
};

type AgentFunnelResourceDeliveryTokenRedaction = typeof agentFunnelResourceDeliveryTokenRedaction;

type AgentFunnelResourceDeliveryTokenReplay = {
  ok: true;
  status: typeof agentFunnelResourceDeliveryTokenStatus;
  issue: typeof agentFunnelResourceDeliveryTokenIssue;
  route: typeof agentFunnelResourceDeliveryTokenApiRoute;
  replayed: true;
  token: null;
  downloadUrl: null;
  expiresAt: string | null;
  audit: AgentFunnelResourceDeliveryTokenAuditSummary;
  redaction: AgentFunnelResourceDeliveryTokenRedaction;
};

type AgentFunnelResourceDeliveryTokenCreated = Omit<Extract<FunnelResourceDeliveryTokenResult, { ok: true }>, "issue" | "status" | "redaction"> & {
  issue: typeof agentFunnelResourceDeliveryTokenIssue;
  status: typeof agentFunnelResourceDeliveryTokenStatus;
  route: typeof agentFunnelResourceDeliveryTokenApiRoute;
  replayed: false;
  audit: AgentFunnelResourceDeliveryTokenAuditSummary;
  redaction: AgentFunnelResourceDeliveryTokenRedaction;
};

type AgentFunnelResourceDeliveryTokenFailure = {
  ok: false;
  status:
    | "invalid_request"
    | "not_found"
    | "not_eligible"
    | "stale_funnel_revision"
    | "idempotency_conflict"
    | "unavailable";
  issue: typeof agentFunnelResourceDeliveryTokenIssue;
  route: typeof agentFunnelResourceDeliveryTokenApiRoute;
  message: string;
  redaction: AgentFunnelResourceDeliveryTokenRedaction;
};

type AgentFunnelResourceDeliveryTokenAuditSummary = {
  id: string;
  auditCorrelationId: string;
  replayCount: number;
  deliveryTokenCreated: boolean;
  idempotencyKeyIncluded: false;
  rawTokenStored: false;
  rawRowsIncluded: false;
};

export type AgentFunnelResourceDeliveryTokenResult =
  | AgentFunnelResourceDeliveryTokenCreated
  | AgentFunnelResourceDeliveryTokenReplay
  | AgentFunnelResourceDeliveryTokenFailure;

export const agentFunnelResourceDeliveryTokenRedaction = {
  ...funnelResourceDeliveryRedaction,
  ownerEmailIncluded: false,
  ownerUserIdIncluded: false,
  actorEmailHashIncluded: false,
  privateSessionIncluded: false,
  idempotencyKeyIncluded: false,
  requestSignatureIncluded: false,
  rawRowsIncluded: false,
  rawTokenStored: false,
  rawTokenAvailableOnReplay: false,
  billingMutationCreated: false,
  publicRouteMutationCreated: false,
  publicAgentWriteCreated: false,
  unauthenticatedAgentWriteCreated: false,
} as const;

function stringValue(value: unknown, maxLength = 220) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function deliveryError(
  status: AgentFunnelResourceDeliveryTokenFailure["status"],
  message: string,
): AgentFunnelResourceDeliveryTokenFailure {
  return {
    ok: false,
    status,
    issue: agentFunnelResourceDeliveryTokenIssue,
    route: agentFunnelResourceDeliveryTokenApiRoute,
    message,
    redaction: agentFunnelResourceDeliveryTokenRedaction,
  };
}

function actorEmail(actor: AdminIdentity) {
  return (actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase();
}

async function ownerScope(actor: AdminIdentity) {
  if (actor.userId) return `user:${actor.userId}`;
  return `email-sha256:${await sha256Hex(actorEmail(actor))}`;
}

function blockForFunnel(funnel: FunnelRecord, blockId: string): FunnelBlock | null {
  for (const step of funnel.steps) {
    const block = step.blocks.find((candidate) => candidate.id === blockId);
    if (block) return block;
  }
  return null;
}

function timestampValue(value: number | string | null | undefined) {
  const seconds = Number(value ?? 0);
  if (!Number.isFinite(seconds) || !seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function auditSummary(row: Pick<AgentFunnelResourceDeliveryTokenAuditRow, "id" | "audit_correlation_id" | "replay_count" | "delivery_token_created">): AgentFunnelResourceDeliveryTokenAuditSummary {
  return {
    id: row.id,
    auditCorrelationId: row.audit_correlation_id,
    replayCount: Number(row.replay_count ?? 0),
    deliveryTokenCreated: Number(row.delivery_token_created ?? 0) === 1,
    idempotencyKeyIncluded: false,
    rawTokenStored: false,
    rawRowsIncluded: false,
  };
}

function requestSignature(input: {
  ownerScopeValue: string;
  funnelSlug: string;
  blockId: string;
  checkoutIntentId: string;
  entitlementId: string;
  expectedFunnelRevisionId: string;
  auditCorrelationId: string;
}) {
  return JSON.stringify({
    ownerScope: input.ownerScopeValue,
    funnelSlug: input.funnelSlug,
    blockId: input.blockId,
    checkoutIntentId: input.checkoutIntentId,
    entitlementId: input.entitlementId,
    expectedFunnelRevisionId: input.expectedFunnelRevisionId,
    auditCorrelationId: input.auditCorrelationId,
  });
}

async function findExistingAudit(db: D1Database, ownerScopeValue: string, idempotencyKeySha256: string) {
  return db
    .prepare(
      `SELECT * FROM ${agentFunnelResourceDeliveryTokenTable}
       WHERE owner_scope = ? AND idempotency_key_sha256 = ?`,
    )
    .bind(ownerScopeValue, idempotencyKeySha256)
    .first<AgentFunnelResourceDeliveryTokenAuditRow>();
}

async function replayExistingAudit(db: D1Database, row: AgentFunnelResourceDeliveryTokenAuditRow) {
  const nextReplayCount = Number(row.replay_count ?? 0) + 1;
  await db
    .prepare(
      `UPDATE ${agentFunnelResourceDeliveryTokenTable}
       SET replay_count = ?, updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(nextReplayCount, row.id)
    .run();

  return {
    ...row,
    replay_count: nextReplayCount,
  };
}

export async function createAgentFunnelResourceDeliveryToken(
  input: AgentFunnelResourceDeliveryTokenInput,
): Promise<AgentFunnelResourceDeliveryTokenResult> {
  const funnelSlug = stringValue(input.funnelSlug);
  const blockId = stringValue(input.blockId);
  const checkoutIntentId = stringValue(input.checkoutIntentId);
  const entitlementId = stringValue(input.entitlementId);
  const expectedFunnelRevisionId = stringValue(input.expectedFunnelRevisionId, 260);
  const idempotencyKey = stringValue(input.idempotencyKey, 260);
  const auditCorrelationId = stringValue(input.auditCorrelationId, 260);

  if (!funnelSlug || !blockId || !checkoutIntentId || !entitlementId || !expectedFunnelRevisionId) {
    return deliveryError(
      "invalid_request",
      "funnelSlug, blockId, checkoutIntentId, entitlementId, and expectedFunnelRevisionId are required.",
    );
  }
  if (!idempotencyKey || !auditCorrelationId) {
    return deliveryError("invalid_request", "idempotencyKey and auditCorrelationId are required.");
  }
  if (input.confirmationText !== agentFunnelResourceDeliveryTokenConfirmationText) {
    return deliveryError("invalid_request", "Exact agent funnel resource delivery confirmation text is required.");
  }

  let db: D1Database;
  try {
    db = await getFunnelDraftD1OrThrow();
  } catch {
    return deliveryError("unavailable", "Agent funnel resource delivery token audit storage is unavailable.");
  }
  const ownerScopeValue = await ownerScope(input.actor);
  const ownerEmailHash = await sha256Hex(actorEmail(input.actor));
  const idempotencyKeySha256 = await sha256Hex(`${agentFunnelResourceDeliveryTokenApiRoute}:${ownerScopeValue}:${idempotencyKey}`);
  const confirmationTextSha256 = await sha256Hex(agentFunnelResourceDeliveryTokenConfirmationText);
  const requestSignatureSha256 = await sha256Hex(
    requestSignature({
      ownerScopeValue,
      funnelSlug,
      blockId,
      checkoutIntentId,
      entitlementId,
      expectedFunnelRevisionId,
      auditCorrelationId,
    }),
  );

  const existing = await findExistingAudit(db, ownerScopeValue, idempotencyKeySha256);
  if (existing) {
    if (existing.request_signature_sha256 !== requestSignatureSha256) {
      return deliveryError("idempotency_conflict", "This idempotency key was already used with different request data.");
    }
    if (existing.status === "creating") {
      return deliveryError("idempotency_conflict", "This idempotency key is already creating a delivery token.");
    }
    const replayed = await replayExistingAudit(db, existing);
    if (replayed.status === "failed") {
      const replayedStatus = stringValue(replayed.error_status, 80) as AgentFunnelResourceDeliveryTokenFailure["status"];
      return deliveryError(replayedStatus || "unavailable", replayed.error_message ?? "The original delivery-token request failed.");
    }
    return {
      ok: true,
      status: agentFunnelResourceDeliveryTokenStatus,
      issue: agentFunnelResourceDeliveryTokenIssue,
      route: agentFunnelResourceDeliveryTokenApiRoute,
      replayed: true,
      token: null,
      downloadUrl: null,
      expiresAt: timestampValue(replayed.download_token_expires_at),
      audit: auditSummary(replayed),
      redaction: agentFunnelResourceDeliveryTokenRedaction,
    };
  }

  const funnel = await getPublishedD1FunnelBySlug(funnelSlug);
  if (!funnel) {
    return deliveryError("not_found", "No published funnel was found for that slug.");
  }
  if (funnel.revisionId !== expectedFunnelRevisionId) {
    return deliveryError("stale_funnel_revision", "Published funnel revision changed. Refresh before creating a delivery token.");
  }

  const block = blockForFunnel(funnel, blockId);
  if (!block?.resourceDeliveryLink) {
    return deliveryError("not_found", "No resource delivery block was found for that published funnel.");
  }

  const auditId = `agent-funnel-resource-token-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO ${agentFunnelResourceDeliveryTokenTable} (
        id, owner_scope, actor_user_id, actor_email_hash, idempotency_key_sha256,
        request_signature_sha256, audit_correlation_id, funnel_slug, funnel_revision_id,
        block_id, checkout_intent_id, entitlement_id, status, confirmation_text_sha256,
        product_id, asset_id, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'creating', ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      auditId,
      ownerScopeValue,
      input.actor.userId,
      ownerEmailHash,
      idempotencyKeySha256,
      requestSignatureSha256,
      auditCorrelationId,
      funnelSlug,
      expectedFunnelRevisionId,
      blockId,
      checkoutIntentId,
      entitlementId,
      confirmationTextSha256,
      block.resourceDeliveryLink.productId,
      block.resourceDeliveryLink.assetId,
      JSON.stringify({
        issue: agentFunnelResourceDeliveryTokenIssue,
        capabilityId: "agent-funnel-resource-delivery-token-owner-confirmed",
        route: agentFunnelResourceDeliveryTokenApiRoute,
        rawTokenStored: false,
        rawTokenAvailableOnReplay: false,
        publicRouteMutationCreated: false,
        unauthenticatedAgentWriteCreated: false,
      }),
    )
    .run();

  const tokenResult = await createFunnelResourceDeliveryToken({
    funnelSlug,
    blockId,
    checkoutIntentId,
    entitlementId,
    deliverySource: "owner-agent-funnel-resource-delivery",
  });

  if (!tokenResult.ok) {
    await db
      .prepare(
        `UPDATE ${agentFunnelResourceDeliveryTokenTable}
         SET status = 'failed', result_status = ?, error_status = ?, error_message = ?, updated_at = unixepoch()
         WHERE id = ?`,
      )
      .bind(tokenResult.status, tokenResult.status, tokenResult.message, auditId)
      .run();

    return {
      ...deliveryError(tokenResult.status, tokenResult.message),
      status: tokenResult.status,
    };
  }

  const expiresAtSeconds = Math.floor(new Date(tokenResult.expiresAt).getTime() / 1000);
  const createdRow = {
    id: auditId,
    audit_correlation_id: auditCorrelationId,
    replay_count: 0,
    delivery_token_created: 1,
  };

  await db
    .prepare(
      `UPDATE ${agentFunnelResourceDeliveryTokenTable}
       SET status = 'created',
           delivery_token_created = 1,
           download_token_expires_at = ?,
           product_id = ?,
           asset_id = ?,
           result_status = ?,
           updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(expiresAtSeconds, tokenResult.block.productId, tokenResult.block.assetId, tokenResult.status, auditId)
    .run();

  return {
    ...tokenResult,
    issue: agentFunnelResourceDeliveryTokenIssue,
    status: agentFunnelResourceDeliveryTokenStatus,
    route: agentFunnelResourceDeliveryTokenApiRoute,
    replayed: false,
    audit: auditSummary(createdRow),
    redaction: agentFunnelResourceDeliveryTokenRedaction,
  };
}
