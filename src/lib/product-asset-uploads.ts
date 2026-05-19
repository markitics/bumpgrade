import { getCloudflareContext } from "@opennextjs/cloudflare";

import type { AdminIdentity } from "@/lib/admin-roles";
import { productAccessCatalog, productAccessCatalogs } from "@/lib/product-access";
import { productAssetBucketBinding } from "@/lib/product-download-tokens";

export const productAssetUploadIntentIssue = 151;
export const productAssetUploadIntentStatus = "owner-private-asset-upload-intents-ready";
export const productAssetUploadIntentApiRoute = "/api/admin/products/assets";
export const productAssetUploadConfirmationText = "Create private product asset upload intent";
export const productAssetUploadMaxBytes = 64 * 1024;

type ProductAssetUploadRuntime = {
  db: D1Database;
  productAssets: R2Bucket;
};

type ProductAssetUploadRow = {
  id: string;
  product_id: string;
  asset_id: string;
  file_name: string;
  content_type: string;
  byte_count: number | string;
  body_sha256: string;
  status: string;
  created_at: number | string;
  updated_at: number | string;
};

type ProductAssetUploadAggregateRow = {
  total_uploads: number | string | null;
  stored_private_uploads: number | string | null;
  latest_created_at: number | string | null;
};

type ProductAssetUploadRedaction = {
  rawR2KeysIncluded: false;
  signedUrlsIncluded: false;
  rawUploadBodyIncluded: false;
  privateMetadataIncluded: false;
  rawOwnerEmailIncluded: false;
  buyerDataIncluded: false;
};

export type ProductAssetUploadRecord = {
  uploadId: string;
  productId: string;
  assetId: string;
  fileName: string;
  contentType: string;
  byteCount: number;
  bodySha256: string;
  status: string;
  duplicate: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  storedPrivate: true;
  redaction: ProductAssetUploadRedaction;
};

export type ProductAssetUploadInput = {
  productId: string | null | undefined;
  assetId: string | null | undefined;
  fileName: string | null | undefined;
  contentType: string | null | undefined;
  bodyText?: string | null;
  bodyBase64?: string | null;
  confirmationText: string | null | undefined;
  idempotencyKey: string | null | undefined;
  expectedCatalogRevisionId: string | null | undefined;
  actor: AdminIdentity;
};

export type ProductAssetUploadResult =
  | {
      ok: true;
      status: typeof productAssetUploadIntentStatus | "owner-private-asset-upload-intent-replayed";
      issue: typeof productAssetUploadIntentIssue;
      duplicate: boolean;
      upload: ProductAssetUploadRecord;
    }
  | {
      ok: false;
      status:
        | "invalid_request"
        | "confirmation_required"
        | "stale_catalog_revision"
        | "unsupported_asset"
        | "idempotency_conflict"
        | "unavailable";
      issue: typeof productAssetUploadIntentIssue;
      message: string;
      redaction: ProductAssetUploadRedaction;
    };

export const productAssetUploadRedaction: ProductAssetUploadRedaction = {
  rawR2KeysIncluded: false,
  signedUrlsIncluded: false,
  rawUploadBodyIncluded: false,
  privateMetadataIncluded: false,
  rawOwnerEmailIncluded: false,
  buyerDataIncluded: false,
};

export const productAssetUploadIntentSummary = {
  id: "owner-private-product-asset-upload-intents",
  status: productAssetUploadIntentStatus,
  issue: productAssetUploadIntentIssue,
  parentIssue: 16,
  apiRoute: productAssetUploadIntentApiRoute,
  sourceDataRoute: "/products/source-data",
  ownerAuthBoundary: "Better Auth owner session",
  confirmation: {
    required: true,
    text: productAssetUploadConfirmationText,
  },
  idempotencyRequired: true,
  staleStateCheck: {
    required: true,
    field: "expectedCatalogRevisionId",
    currentRevisionId: productAccessCatalog.revisionId,
  },
  maxPayloadBytes: productAssetUploadMaxBytes,
  tables: ["product_asset_uploads"],
  privateAssetBucketBinding: productAssetBucketBinding,
  redaction: productAssetUploadRedaction,
  writeBoundary:
    "Verified owners can create small private product asset upload records after exact confirmation, idempotency, and product-catalog revision checks. The API stores the body in PRODUCT_ASSETS under a server-only object key and returns only public-safe metadata. It does not expose R2 object keys, signed URLs, upload bodies, private owner metadata, buyer data, customer delivery, protected content, revocation, or direct unauthenticated agent writes.",
};

function normalizeRequired(value: string | null | undefined, maxLength: number) {
  const trimmed = value?.trim() ?? "";
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function isoFromSeconds(value: number | string | null | undefined) {
  const seconds = Number(value ?? 0);
  if (!Number.isFinite(seconds) || !seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function runtimeId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function safeFileName(value: string) {
  const cleaned = value
    .trim()
    .replace(/[/\\]/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return cleaned || "private-product-asset.txt";
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function normalizeBody(input: { bodyText?: string | null; bodyBase64?: string | null }) {
  if (typeof input.bodyText === "string") {
    return new TextEncoder().encode(input.bodyText);
  }

  if (typeof input.bodyBase64 === "string" && input.bodyBase64.trim()) {
    try {
      return base64ToBytes(input.bodyBase64.trim());
    } catch {
      return null;
    }
  }

  return null;
}

async function sha256(bytes: Uint8Array | string) {
  const data = typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes;
  const digestInput = new Uint8Array(data.byteLength);
  digestInput.set(data);
  const digest = await crypto.subtle.digest("SHA-256", digestInput.buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getRuntime(): Promise<ProductAssetUploadRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  if (!cloudflareEnv.PRODUCT_ASSETS) {
    throw new Error("Cloudflare R2 binding PRODUCT_ASSETS is not available.");
  }
  return { db: cloudflareEnv.DB, productAssets: cloudflareEnv.PRODUCT_ASSETS };
}

function findUploadAsset(productId: string, assetId: string) {
  for (const catalog of productAccessCatalogs) {
    const product = catalog.products.find((item) => item.id === productId);
    if (!product || !product.assetIds.includes(assetId)) continue;
    const asset = catalog.assets.find((item) => item.id === assetId);
    if (!asset || asset.kind !== "file") return null;
    return { catalog, product, asset };
  }
  return null;
}

function rowToUpload(row: ProductAssetUploadRow, duplicate: boolean): ProductAssetUploadRecord {
  return {
    uploadId: row.id,
    productId: row.product_id,
    assetId: row.asset_id,
    fileName: row.file_name,
    contentType: row.content_type,
    byteCount: Number(row.byte_count),
    bodySha256: row.body_sha256,
    status: row.status,
    duplicate,
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
    storedPrivate: true,
    redaction: productAssetUploadRedaction,
  };
}

function resultError(
  status: Extract<ProductAssetUploadResult, { ok: false }>["status"],
  message: string,
): ProductAssetUploadResult {
  return {
    ok: false,
    status,
    issue: productAssetUploadIntentIssue,
    message,
    redaction: productAssetUploadRedaction,
  };
}

async function actorEmailHash(actor: AdminIdentity) {
  return sha256((actor.email ?? "unknown-owner@bumpgrade.local").trim().toLowerCase());
}

export async function createProductAssetUploadIntent(input: ProductAssetUploadInput): Promise<ProductAssetUploadResult> {
  if (input.confirmationText !== productAssetUploadConfirmationText) {
    return resultError("confirmation_required", "Exact product asset upload confirmation text is required.");
  }

  const productId = normalizeRequired(input.productId, 120);
  const assetId = normalizeRequired(input.assetId, 120);
  const fileName = normalizeRequired(input.fileName, 160);
  const contentType = normalizeRequired(input.contentType, 120);
  const idempotencyKey = normalizeRequired(input.idempotencyKey, 180);
  const expectedCatalogRevisionId = normalizeRequired(input.expectedCatalogRevisionId, 180);
  const bodyBytes = normalizeBody(input);

  if (!productId || !assetId || !fileName || !contentType || !idempotencyKey || !bodyBytes) {
    return resultError("invalid_request", "productId, assetId, fileName, contentType, idempotencyKey, and upload body are required.");
  }

  if (bodyBytes.byteLength === 0 || bodyBytes.byteLength > productAssetUploadMaxBytes) {
    return resultError("invalid_request", `Upload body must be between 1 and ${productAssetUploadMaxBytes} bytes.`);
  }

  const uploadTarget = findUploadAsset(productId, assetId);
  if (!uploadTarget) {
    return resultError("unsupported_asset", "The product and asset must reference a configured file asset.");
  }

  if (expectedCatalogRevisionId !== uploadTarget.catalog.revisionId) {
    return resultError("stale_catalog_revision", "Product catalog revision changed. Refresh before creating a private asset upload.");
  }

  try {
    const { db, productAssets } = await getRuntime();
    const bodySha256 = await sha256(bodyBytes);
    const existing = await db
      .prepare("SELECT * FROM product_asset_uploads WHERE idempotency_key = ?")
      .bind(idempotencyKey)
      .first<ProductAssetUploadRow>();

    if (existing) {
      const sameRequest =
        existing.product_id === productId &&
        existing.asset_id === assetId &&
        existing.file_name === safeFileName(fileName) &&
        existing.content_type === contentType &&
        existing.body_sha256 === bodySha256 &&
        Number(existing.byte_count) === bodyBytes.byteLength;

      if (!sameRequest) {
        return resultError("idempotency_conflict", "That idempotency key already belongs to a different product asset upload.");
      }

      return {
        ok: true,
        status: "owner-private-asset-upload-intent-replayed",
        issue: productAssetUploadIntentIssue,
        duplicate: true,
        upload: rowToUpload(existing, true),
      };
    }

    const uploadId = runtimeId("product-asset-upload");
    const storedFileName = safeFileName(fileName);
    const objectKey = `products/uploads/${productId}/${assetId}/${uploadId}/${storedFileName}`;
    const confirmationTextSha256 = await sha256(productAssetUploadConfirmationText);
    const actorHash = await actorEmailHash(input.actor);

    await productAssets.put(objectKey, bodyBytes, {
      httpMetadata: {
        contentType,
      },
      customMetadata: {
        uploadId,
        productId,
        assetId,
        issue: String(productAssetUploadIntentIssue),
        rawR2KeysIncluded: "false",
        signedUrlsIncluded: "false",
        uploadBodyReturned: "false",
      },
    });

    await db
      .prepare(
        `INSERT INTO product_asset_uploads (
          id, idempotency_key, actor_user_id, actor_email_hash, actor_role, product_id, asset_id,
          file_name, content_type, byte_count, body_sha256, r2_object_key, status,
          confirmation_text_sha256, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'stored_private', ?, ?, unixepoch(), unixepoch())`,
      )
      .bind(
        uploadId,
        idempotencyKey,
        input.actor.userId,
        actorHash,
        input.actor.role,
        productId,
        assetId,
        storedFileName,
        contentType,
        bodyBytes.byteLength,
        bodySha256,
        objectKey,
        confirmationTextSha256,
        JSON.stringify({
          issue: productAssetUploadIntentIssue,
          parentIssue: 16,
          expectedCatalogRevisionId,
          productCatalogId: uploadTarget.catalog.id,
          assetKind: uploadTarget.asset.kind,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          rawUploadBodyIncluded: false,
          rawOwnerEmailIncluded: false,
          buyerDataIncluded: false,
        }),
      )
      .run();

    const inserted = await db.prepare("SELECT * FROM product_asset_uploads WHERE id = ?").bind(uploadId).first<ProductAssetUploadRow>();
    if (!inserted) {
      throw new Error("Private product asset upload record could not be read after insert.");
    }

    return {
      ok: true,
      status: productAssetUploadIntentStatus,
      issue: productAssetUploadIntentIssue,
      duplicate: false,
      upload: rowToUpload(inserted, false),
    };
  } catch (error) {
    return resultError("unavailable", error instanceof Error ? error.message : "Unable to create private product asset upload.");
  }
}

export async function getProductAssetUploadIntentSummary() {
  try {
    const { db } = await getRuntime();
    const row = await db
      .prepare(
        `SELECT
          COUNT(*) AS total_uploads,
          SUM(CASE WHEN status = 'stored_private' THEN 1 ELSE 0 END) AS stored_private_uploads,
          MAX(created_at) AS latest_created_at
        FROM product_asset_uploads`,
      )
      .first<ProductAssetUploadAggregateRow>();

    return {
      ...productAssetUploadIntentSummary,
      source: "d1" as const,
      loadError: null,
      counts: {
        uploadRecords: Number(row?.total_uploads ?? 0),
        storedPrivateUploads: Number(row?.stored_private_uploads ?? 0),
      },
      latestCreatedAt: isoFromSeconds(row?.latest_created_at),
      rawRowsIncluded: false,
    };
  } catch (error) {
    return {
      ...productAssetUploadIntentSummary,
      source: "unavailable" as const,
      loadError: error instanceof Error ? error.message : "Unable to load product asset upload intent summary.",
      counts: {
        uploadRecords: 0,
        storedPrivateUploads: 0,
      },
      latestCreatedAt: null,
      rawRowsIncluded: false,
    };
  }
}
