import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";

export const productCreationIssue = 403;
export const productCreationParentIssue = 16;
export const productCreationStatus = "owner-product-creation-ready";
export const productCreationApiRoute = "/api/admin/products/catalog";
export const productCreationConfirmationText = "Create draft product";

export const productCreationKinds = [
  "digital_download",
  "course",
  "membership",
  "coaching_service",
  "event_webinar",
  "bundle",
] as const;

export type ProductCreationKind = (typeof productCreationKinds)[number];

type ProductCreationRuntime = {
  db: D1Database;
};

type ProductCreationIntentRow = {
  id: string;
  idempotency_key: string;
  product_id: string;
  actor_user_id: string | null;
  actor_email_hash: string | null;
  actor_role: string | null;
  requested_slug: string;
  product_kind: string;
  status: string;
  created_at: number | string;
  updated_at: number | string;
};

type CreatedProductRow = {
  id: string;
  slug: string;
  name: string;
  kind: string;
  status: string;
  description: string | null;
  fulfillment_kind: string;
  created_at: number | string;
  updated_at: number | string;
};

type ProductCreationAggregateRow = {
  total_intents: number | string | null;
  draft_products: number | string | null;
  latest_created_at: number | string | null;
};

type ProductCreationKindCountRow = {
  kind: string | null;
  total: number | string | null;
};

type ProductCreationRedaction = {
  actorEmailIncluded: false;
  actorUserIdIncluded: false;
  idempotencyKeysIncluded: false;
  rawRowsIncluded: false;
  rawStripeIdsIncluded: false;
  billingMutationEnabled: false;
  fulfillmentMutationEnabled: false;
};

export type ProductCreationRecord = {
  productId: string;
  slug: string;
  name: string;
  kind: ProductCreationKind;
  status: string;
  description: string | null;
  fulfillmentKind: string;
  duplicate: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  billingMutationEnabled: false;
  fulfillmentMutationEnabled: false;
  redaction: ProductCreationRedaction;
};

export type ProductCreationInput = {
  name: string | null | undefined;
  slug?: string | null;
  kind: string | null | undefined;
  description?: string | null;
  confirmationText: string | null | undefined;
  idempotencyKey: string | null | undefined;
  actor: AdminIdentity;
};

export type ProductCreationResult =
  | {
      ok: true;
      status: typeof productCreationStatus | "owner-product-creation-replayed";
      issue: typeof productCreationIssue;
      duplicate: boolean;
      product: ProductCreationRecord;
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "unsupported_product_kind"
        | "duplicate_slug"
        | "idempotency_conflict"
        | "unavailable";
      issue: typeof productCreationIssue;
      message: string;
      redaction: ProductCreationRedaction;
    };

export const productCreationRedaction: ProductCreationRedaction = {
  actorEmailIncluded: false,
  actorUserIdIncluded: false,
  idempotencyKeysIncluded: false,
  rawRowsIncluded: false,
  rawStripeIdsIncluded: false,
  billingMutationEnabled: false,
  fulfillmentMutationEnabled: false,
};

export const productCreationSummaryContract = {
  id: "owner-product-creation",
  status: productCreationStatus,
  issue: productCreationIssue,
  parentIssue: productCreationParentIssue,
  apiRoute: productCreationApiRoute,
  sourceDataRoute: "/products/source-data",
  ownerRoute: "/admin/products",
  ownerAuthBoundary: "Better Auth owner session",
  confirmation: {
    required: true,
    text: productCreationConfirmationText,
  },
  idempotencyRequired: true,
  supportedKinds: productCreationKinds,
  writeBoundary:
    "Owners can create draft Bumpgrade product records after exact confirmation and idempotency. This does not create Stripe products or prices, publish offer copy, grant fulfillment, create customer access, expose private owner identity, or enable direct unauthenticated agent writes.",
  redaction: productCreationRedaction,
};

export type ProductCreationSummary = typeof productCreationSummaryContract & {
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    creationIntents: number;
    draftProducts: number;
  };
  kindCounts: Array<{ kind: string; total: number }>;
  latestCreatedAt: string | null;
  recordsIncluded: false;
};

export type AdminProductCreationState = ProductCreationSummary & {
  records: ProductCreationRecord[];
};

function normalizeRequired(value: string | null | undefined, maxLength: number) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.slice(0, maxLength) : null;
}

function normalizeOptional(value: string | null | undefined, maxLength: number) {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized.slice(0, maxLength) : null;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function runtimeId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function isoFromSeconds(value: number | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data.buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function actorEmailHash(actor: AdminIdentity) {
  return sha256((actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
}

async function getRuntime(): Promise<ProductCreationRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function isProductCreationKind(value: string | null): value is ProductCreationKind {
  return productCreationKinds.includes(value as ProductCreationKind);
}

function defaultFulfillmentKind(kind: ProductCreationKind) {
  if (kind === "digital_download") return "download";
  if (kind === "course") return "protected_content";
  if (kind === "membership") return "membership";
  if (kind === "coaching_service") return "manual_service";
  if (kind === "event_webinar") return "event_access";
  return "bundle";
}

function resultError(status: Extract<ProductCreationResult, { ok: false }>["status"], message: string): ProductCreationResult {
  return {
    ok: false,
    status,
    issue: productCreationIssue,
    message,
    redaction: productCreationRedaction,
  };
}

function publicProduct(row: CreatedProductRow, duplicate: boolean): ProductCreationRecord {
  return {
    productId: row.id,
    slug: row.slug,
    name: row.name,
    kind: row.kind as ProductCreationKind,
    status: row.status,
    description: row.description,
    fulfillmentKind: row.fulfillment_kind,
    duplicate,
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
    billingMutationEnabled: false,
    fulfillmentMutationEnabled: false,
    redaction: productCreationRedaction,
  };
}

async function intentWithProduct(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT
        intent.id,
        intent.idempotency_key,
        intent.product_id,
        intent.actor_user_id,
        intent.actor_email_hash,
        intent.actor_role,
        intent.requested_slug,
        intent.product_kind,
        intent.status,
        intent.created_at,
        intent.updated_at,
        product.id AS product_id,
        product.slug,
        product.name,
        product.kind,
        product.status AS product_status,
        product.description,
        product.fulfillment_kind,
        product.created_at AS product_created_at,
        product.updated_at AS product_updated_at
      FROM product_creation_intents intent
      JOIN commerce_products product ON product.id = intent.product_id
      WHERE intent.idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<
      ProductCreationIntentRow & {
        slug: string;
        name: string;
        kind: string;
        product_status: string;
        description: string | null;
        fulfillment_kind: string;
        product_created_at: number | string;
        product_updated_at: number | string;
      }
    >();
}

export async function createDraftProduct(input: ProductCreationInput): Promise<ProductCreationResult> {
  if (input.confirmationText !== productCreationConfirmationText) {
    return resultError("confirmation_required", "Exact product creation confirmation text is required.");
  }

  const name = normalizeRequired(input.name, 120);
  const description = normalizeOptional(input.description, 700);
  const kindInput = normalizeRequired(input.kind, 80);
  const idempotencyKey = normalizeRequired(input.idempotencyKey, 180);
  const slug = slugify(input.slug ?? name ?? "");

  if (!name || !slug || !kindInput || !idempotencyKey) {
    return resultError("invalid_request", "name, kind, confirmationText, and idempotencyKey are required.");
  }

  if (!isProductCreationKind(kindInput)) {
    return resultError("unsupported_product_kind", "The requested product kind is not supported yet.");
  }

  const fulfillmentKind = defaultFulfillmentKind(kindInput);
  const productId = `product-owner-${slug}`;

  try {
    const { db } = await getRuntime();
    const existingIntent = await intentWithProduct(db, idempotencyKey);

    if (existingIntent) {
      const sameRequest =
        existingIntent.name === name &&
        existingIntent.slug === slug &&
        existingIntent.kind === kindInput &&
        (existingIntent.description ?? null) === description &&
        existingIntent.fulfillment_kind === fulfillmentKind;

      if (!sameRequest) {
        return resultError("idempotency_conflict", "That idempotency key already belongs to a different product creation request.");
      }

      return {
        ok: true,
        status: "owner-product-creation-replayed",
        issue: productCreationIssue,
        duplicate: true,
        product: publicProduct(
          {
            id: existingIntent.product_id,
            slug: existingIntent.slug,
            name: existingIntent.name,
            kind: existingIntent.kind,
            status: existingIntent.product_status,
            description: existingIntent.description,
            fulfillment_kind: existingIntent.fulfillment_kind,
            created_at: existingIntent.product_created_at,
            updated_at: existingIntent.product_updated_at,
          },
          true,
        ),
      };
    }

    const existingSlug = await db
      .prepare("SELECT id FROM commerce_products WHERE slug = ? LIMIT 1")
      .bind(slug)
      .first<{ id: string }>();
    if (existingSlug) {
      return resultError("duplicate_slug", "A product with that slug already exists.");
    }

    const actorHash = await actorEmailHash(input.actor);
    const intentId = runtimeId("product-creation-intent");
    const confirmationTextSha256 = await sha256(productCreationConfirmationText);
    const metadataJson = JSON.stringify({
      issue: productCreationIssue,
      parentIssue: productCreationParentIssue,
      billingMutationEnabled: false,
      fulfillmentMutationEnabled: false,
      rawOwnerEmailIncluded: false,
      rawStripeIdsIncluded: false,
      directAgentWriteEnabled: false,
    });

    await db.batch([
      db
        .prepare(
          `INSERT INTO commerce_products (
            id, owner_user_id, slug, name, kind, status, description, fulfillment_kind,
            metadata_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, unixepoch(), unixepoch())`,
        )
        .bind(productId, input.actor.userId, slug, name, kindInput, description, fulfillmentKind, metadataJson),
      db
        .prepare(
          `INSERT INTO product_creation_intents (
            id, idempotency_key, product_id, actor_user_id, actor_email_hash, actor_role,
            requested_slug, product_kind, status, confirmation_text_sha256, metadata_json,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft_product_created', ?, ?, unixepoch(), unixepoch())`,
        )
        .bind(
          intentId,
          idempotencyKey,
          productId,
          input.actor.userId,
          actorHash,
          input.actor.role,
          slug,
          kindInput,
          confirmationTextSha256,
          metadataJson,
        ),
    ]);

    const inserted = await db
      .prepare(
        `SELECT id, slug, name, kind, status, description, fulfillment_kind, created_at, updated_at
        FROM commerce_products WHERE id = ?`,
      )
      .bind(productId)
      .first<CreatedProductRow>();

    if (!inserted) {
      throw new Error("Draft product could not be read after insert.");
    }

    return {
      ok: true,
      status: productCreationStatus,
      issue: productCreationIssue,
      duplicate: false,
      product: publicProduct(inserted, false),
    };
  } catch (error) {
    return resultError("unavailable", error instanceof Error ? error.message : "Unable to create draft product.");
  }
}

export async function getProductCreationSummary(): Promise<ProductCreationSummary> {
  try {
    const { db } = await getRuntime();
    const [aggregate, kindCounts] = await Promise.all([
      db
        .prepare(
          `SELECT
            COUNT(*) AS total_intents,
            SUM(CASE WHEN product.status = 'draft' THEN 1 ELSE 0 END) AS draft_products,
            MAX(intent.created_at) AS latest_created_at
          FROM product_creation_intents intent
          JOIN commerce_products product ON product.id = intent.product_id`,
        )
        .first<ProductCreationAggregateRow>(),
      db
        .prepare(
          `SELECT product.kind AS kind, COUNT(*) AS total
          FROM product_creation_intents intent
          JOIN commerce_products product ON product.id = intent.product_id
          GROUP BY product.kind
          ORDER BY total DESC, product.kind ASC`,
        )
        .all<ProductCreationKindCountRow>(),
    ]);

    return {
      ...productCreationSummaryContract,
      source: "d1",
      loadError: null,
      counts: {
        creationIntents: Number(aggregate?.total_intents ?? 0),
        draftProducts: Number(aggregate?.draft_products ?? 0),
      },
      kindCounts: (kindCounts.results ?? []).map((row) => ({
        kind: row.kind ?? "unknown",
        total: Number(row.total ?? 0),
      })),
      latestCreatedAt: isoFromSeconds(aggregate?.latest_created_at),
      recordsIncluded: false,
    };
  } catch (error) {
    return {
      ...productCreationSummaryContract,
      source: "unavailable",
      loadError: error instanceof Error ? error.message : "Unable to load product creation summary.",
      counts: {
        creationIntents: 0,
        draftProducts: 0,
      },
      kindCounts: [],
      latestCreatedAt: null,
      recordsIncluded: false,
    };
  }
}

export async function getAdminProductCreationState(): Promise<AdminProductCreationState> {
  const summary = await getProductCreationSummary();
  if (summary.source !== "d1") return { ...summary, records: [] };

  try {
    const { db } = await getRuntime();
    const records = await db
      .prepare(
        `SELECT
          product.id,
          product.slug,
          product.name,
          product.kind,
          product.status,
          product.description,
          product.fulfillment_kind,
          product.created_at,
          product.updated_at
        FROM product_creation_intents intent
        JOIN commerce_products product ON product.id = intent.product_id
        ORDER BY intent.created_at DESC
        LIMIT 8`,
      )
      .all<CreatedProductRow>();

    return {
      ...summary,
      records: (records.results ?? []).map((row) => publicProduct(row, false)),
    };
  } catch {
    return { ...summary, records: [] };
  }
}
