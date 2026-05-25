import { getCloudflareContext } from "@opennextjs/cloudflare";

import { productAccessCatalogs } from "@/lib/product-access";

export const productDownloadTokenIssue = 143;
export const productDownloadAssetDeliveryIssue = 146;
export const productDownloadRedemptionRevalidationIssue = 147;
export const productDownloadTokenStatus = "private-r2-download-delivery-ready";
export const productDownloadTokenApiRoute = "/api/products/download-tokens";
export const productDownloadRoutePrefix = "/api/products/downloads";
export const productDownloadTokenTtlSeconds = 15 * 60;
export const productAssetBucketBinding = "PRODUCT_ASSETS";

type DownloadTokenRuntime = {
  db: D1Database;
  productAssets: R2Bucket;
};

type EntitlementForDownloadRow = {
  id: string;
  checkout_intent_id: string;
  product_id: string;
  entitlement_template_id: string;
  access_rule_id: string;
  status: string;
  checkout_status: string | null;
};

type DownloadTokenRow = {
  id: string;
  token_hash: string;
  checkout_intent_id: string;
  entitlement_id: string;
  product_id: string;
  asset_id: string;
  status: string;
  expires_at: number | string;
  created_at: number | string;
  used_at: number | string | null;
};

type DownloadTokenRedemptionRow = DownloadTokenRow & {
  current_entitlement_id: string | null;
  entitlement_checkout_intent_id: string | null;
  entitlement_product_id: string | null;
  entitlement_status: string | null;
  checkout_row_id: string | null;
  checkout_status: string | null;
};

export type ProductDownloadAsset = {
  assetId: string;
  assetTitle: string;
  productId: string;
  productTitle: string;
  fileName: string;
  contentType: string;
  deliveryMode: "private-r2-fixture";
  r2Backed: true;
};

export type ProductDownloadTokenResult =
  | {
      ok: true;
      status: typeof productDownloadTokenStatus;
      issue: typeof productDownloadAssetDeliveryIssue;
      token: string;
      downloadUrl: string;
      expiresAt: string;
      asset: ProductDownloadAsset;
      redaction: ProductDownloadRedaction;
    }
  | {
      ok: false;
      status: "invalid_request" | "not_found" | "not_eligible" | "unavailable";
      issue: typeof productDownloadAssetDeliveryIssue;
      message: string;
      redaction: ProductDownloadRedaction;
    };

export type ProductDownloadRedaction = {
  buyerEmailIncluded: false;
  buyerEmailHashIncluded: false;
  rawStripeIdsIncluded: false;
  rawR2KeysIncluded: false;
  signedUrlsIncluded: false;
  metadataJsonIncluded: false;
};

export const productDownloadTokenSummary = {
  id: "sandbox-product-download-token-contract",
  status: productDownloadTokenStatus,
  issue: productDownloadAssetDeliveryIssue,
  followsIssue: productDownloadTokenIssue,
  redemptionRevalidationIssue: productDownloadRedemptionRevalidationIssue,
  parentIssue: 16,
  apiRoute: productDownloadTokenApiRoute,
  downloadRoutePrefix: productDownloadRoutePrefix,
  sourceDataRoute: "/products/source-data",
  ttlSeconds: productDownloadTokenTtlSeconds,
  tables: ["product_download_tokens"],
  privateAssetBucketBinding: productAssetBucketBinding,
  authBoundary: "checkout-intent-and-entitlement-bearer-reference",
  eligibleAssetKind: "file",
  deliveryMode: "private-r2-fixture",
  privateAssetDelivery: {
    r2Backed: true,
    seededAssetId: "asset-launch-checklist-pdf",
    rawR2KeysIncluded: false,
    signedUrlsIncluded: false,
  },
  redemptionRevalidation: {
    entitlementStatus: "active",
    trustedCheckoutStatuses: ["paid", "completed"],
    checkoutIntentLinkRequired: true,
    assetScopeCheckedBeforeRead: true,
    tokenConsumedAfterPrivateAssetRead: true,
  },
  redaction: {
    buyerEmailIncluded: false,
    buyerEmailHashIncluded: false,
    rawStripeIdsIncluded: false,
    rawR2KeysIncluded: false,
    signedUrlsIncluded: false,
    metadataJsonIncluded: false,
  } satisfies ProductDownloadRedaction,
  writeBoundary:
    "Issue #146 can create short-lived download tokens for active checkout-linked file entitlements and stream a seeded private R2-backed fixture through Bumpgrade. Issue #147 revalidates current entitlement status, checkout intent linkage, trusted checkout state, and asset scope before private R2 reads or token consumption. It does not expose private R2 keys, signed object URLs, protected lessons, buyer identity, revocation, subscription access, arbitrary uploads, or live fulfillment automation.",
};

type PrivateProductAssetFixture = {
  assetId: string;
  objectKey: string;
  fileName: string;
  contentType: string;
  body: string;
};

const privateProductAssetFixtures = new Map<string, PrivateProductAssetFixture>([
  [
    "asset-launch-checklist-pdf",
    {
      assetId: "asset-launch-checklist-pdf",
      objectKey: "products/fixtures/asset-launch-checklist-pdf.txt",
      fileName: "asset-launch-checklist-pdf.txt",
      contentType: "text/plain; charset=utf-8",
      body: [
        "Bumpgrade Launch Checklist",
        "",
        "This private fixture proves entitlement-scoped R2 delivery through Bumpgrade.",
        "It is safe sample content and contains no buyer identity, Stripe identifiers, R2 object keys, signed URLs, or private metadata.",
        "",
        "- Confirm the offer and checkout route.",
        "- Confirm the access rule and entitlement template.",
        "- Confirm replay attempts are rejected after the first download.",
      ].join("\n"),
    },
  ],
]);

async function getRuntime(): Promise<DownloadTokenRuntime> {
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

function timestampValue(value: number | string | null | undefined) {
  const seconds = Number(value ?? 0);
  if (!Number.isFinite(seconds) || !seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomToken() {
  return `download-token-${crypto.randomUUID()}`;
}

export function normalizeDownloadToken(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!/^download-token-[0-9a-fA-F-]{36}$/.test(trimmed)) return null;
  return trimmed;
}

export function downloadableAssetForProduct(productId: string): ProductDownloadAsset | null {
  for (const catalog of productAccessCatalogs) {
    const product = catalog.products.find((item) => item.id === productId);
    if (!product) continue;
    const asset = product.assetIds
      .map((assetId) => catalog.assets.find((item) => item.id === assetId) ?? null)
      .find((item) => item?.kind === "file");
    if (!asset) return null;
    const fixture = privateProductAssetFixtures.get(asset.id);
    if (!fixture) return null;
    return {
      assetId: asset.id,
      assetTitle: asset.title,
      productId: product.id,
      productTitle: product.title,
      fileName: fixture.fileName,
      contentType: fixture.contentType,
      deliveryMode: "private-r2-fixture",
      r2Backed: true,
    };
  }
  return null;
}

async function readPrivateProductAsset(bucket: R2Bucket, asset: ProductDownloadAsset) {
  const fixture = privateProductAssetFixtures.get(asset.assetId);
  if (!fixture) {
    throw new Error("No private fixture is configured for this asset.");
  }

  let object = await bucket.get(fixture.objectKey);
  if (!object) {
    await bucket.put(fixture.objectKey, fixture.body, {
      httpMetadata: {
        contentType: fixture.contentType,
      },
      customMetadata: {
        assetId: fixture.assetId,
        issue: String(productDownloadAssetDeliveryIssue),
        seededFixture: "true",
        rawR2KeysIncluded: "false",
        signedUrlsIncluded: "false",
      },
    });
    object = await bucket.get(fixture.objectKey);
  }

  if (!object) {
    throw new Error("Private product asset could not be read from R2.");
  }

  const body = await object.arrayBuffer();
  return {
    body,
    byteLength: body.byteLength,
    fileName: fixture.fileName,
    contentType: object.httpMetadata?.contentType ?? fixture.contentType,
    r2Backed: true as const,
    privateR2KeysIncluded: false as const,
    signedUrlsIncluded: false as const,
  };
}

function resultError(
  status: Extract<ProductDownloadTokenResult, { ok: false }>["status"],
  message: string,
): ProductDownloadTokenResult {
  return {
    ok: false,
    status,
    issue: productDownloadAssetDeliveryIssue,
    message,
    redaction: productDownloadTokenSummary.redaction,
  };
}

function isTrustedCheckoutStatus(status: string | null) {
  return status === "paid" || status === "completed";
}

export async function createProductDownloadToken(input: {
  checkoutIntentId: string | null | undefined;
  entitlementId: string | null | undefined;
  productId?: string | null | undefined;
  assetId?: string | null | undefined;
}): Promise<ProductDownloadTokenResult> {
  const checkoutIntentId = input.checkoutIntentId?.trim();
  const entitlementId = input.entitlementId?.trim();
  const productId = input.productId?.trim();
  const assetId = input.assetId?.trim();
  if (!checkoutIntentId || !entitlementId) {
    return resultError("invalid_request", "checkoutIntentId and entitlementId are required.");
  }

  try {
    const { db } = await getRuntime();
    const entitlement = await db
      .prepare(
        `SELECT
          e.id,
          e.checkout_intent_id,
          e.product_id,
          e.entitlement_template_id,
          e.access_rule_id,
          e.status,
          ci.status AS checkout_status
        FROM product_entitlements e
        LEFT JOIN checkout_intents ci ON ci.id = e.checkout_intent_id
        WHERE e.id = ? AND e.checkout_intent_id = ?`,
      )
      .bind(entitlementId, checkoutIntentId)
      .first<EntitlementForDownloadRow>();

    if (!entitlement) {
      return resultError("not_found", "No active entitlement was found for that checkout intent.");
    }
    if (entitlement.status !== "active" || !isTrustedCheckoutStatus(entitlement.checkout_status)) {
      return resultError("not_eligible", "This entitlement is not eligible for download delivery yet.");
    }
    if (productId && entitlement.product_id !== productId) {
      return resultError("not_eligible", "This entitlement does not match the requested product.");
    }

    const asset = downloadableAssetForProduct(entitlement.product_id);
    if (!asset) {
      return resultError("not_eligible", "This entitlement does not include a private file asset.");
    }
    if (assetId && asset.assetId !== assetId) {
      return resultError("not_eligible", "This entitlement does not match the requested asset.");
    }

    const token = randomToken();
    const tokenHash = await sha256(token);
    const tokenId = `product-download-token-${crypto.randomUUID()}`;
    const expiresAtSeconds = Math.floor(Date.now() / 1000) + productDownloadTokenTtlSeconds;

    await db
      .prepare(
        `INSERT INTO product_download_tokens (
          id, token_hash, checkout_intent_id, entitlement_id, product_id, asset_id,
          status, expires_at, metadata_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, unixepoch(), unixepoch())`,
      )
      .bind(
        tokenId,
        tokenHash,
        checkoutIntentId,
        entitlementId,
        entitlement.product_id,
        asset.assetId,
        expiresAtSeconds,
        JSON.stringify({
          issue: productDownloadAssetDeliveryIssue,
          followsIssue: productDownloadTokenIssue,
          rawR2KeysIncluded: false,
          signedUrlsIncluded: false,
          buyerDataIncluded: false,
        }),
      )
      .run();

    const downloadUrl = `${productDownloadRoutePrefix}?${new URLSearchParams({ token }).toString()}`;

    return {
      ok: true,
      status: productDownloadTokenStatus,
      issue: productDownloadAssetDeliveryIssue,
      token,
      downloadUrl,
      expiresAt: timestampValue(expiresAtSeconds) ?? new Date(expiresAtSeconds * 1000).toISOString(),
      asset,
      redaction: productDownloadTokenSummary.redaction,
    };
  } catch (error) {
    return resultError(
      "unavailable",
      error instanceof Error ? error.message : "Unable to create sandbox download token.",
    );
  }
}

export async function consumeProductDownloadToken(tokenInput: string | null | undefined) {
  const token = normalizeDownloadToken(tokenInput);
  if (!token) {
    return { ok: false as const, status: 400, message: "Invalid download token." };
  }

  const tokenHash = await sha256(token);
  const { db, productAssets } = await getRuntime();
  const row = await db
    .prepare(
      `SELECT
        t.*,
        e.id AS current_entitlement_id,
        e.checkout_intent_id AS entitlement_checkout_intent_id,
        e.product_id AS entitlement_product_id,
        e.status AS entitlement_status,
        ci.id AS checkout_row_id,
        ci.status AS checkout_status
      FROM product_download_tokens t
      LEFT JOIN product_entitlements e ON e.id = t.entitlement_id
      LEFT JOIN checkout_intents ci ON ci.id = t.checkout_intent_id
      WHERE t.token_hash = ?`,
    )
    .bind(tokenHash)
    .first<DownloadTokenRedemptionRow>();

  if (!row) {
    return { ok: false as const, status: 404, message: "Download token was not found." };
  }
  if (row.status !== "active" || row.used_at) {
    return { ok: false as const, status: 410, message: "Download token has already been used." };
  }
  if (Number(row.expires_at) < Math.floor(Date.now() / 1000)) {
    await db
      .prepare("UPDATE product_download_tokens SET status = 'expired', updated_at = unixepoch() WHERE id = ?")
      .bind(row.id)
      .run();
    return { ok: false as const, status: 410, message: "Download token has expired." };
  }
  if (
    !row.current_entitlement_id ||
    row.entitlement_checkout_intent_id !== row.checkout_intent_id ||
    row.entitlement_product_id !== row.product_id ||
    row.entitlement_status !== productDownloadTokenSummary.redemptionRevalidation.entitlementStatus
  ) {
    return { ok: false as const, status: 409, message: "Download token entitlement state is no longer eligible." };
  }
  if (!row.checkout_row_id || !isTrustedCheckoutStatus(row.checkout_status)) {
    return { ok: false as const, status: 409, message: "Download token checkout state is no longer eligible." };
  }

  const asset = downloadableAssetForProduct(row.product_id);
  if (!asset || asset.assetId !== row.asset_id) {
    return { ok: false as const, status: 409, message: "Download token asset scope is no longer valid." };
  }

  let privateAsset;
  try {
    privateAsset = await readPrivateProductAsset(productAssets, asset);
  } catch (error) {
    return {
      ok: false as const,
      status: 503,
      message: error instanceof Error ? error.message : "Private product asset is unavailable.",
    };
  }

  const update = await db
    .prepare(
      "UPDATE product_download_tokens SET status = 'downloaded', used_at = unixepoch(), updated_at = unixepoch() WHERE id = ? AND status = 'active' AND used_at IS NULL",
    )
    .bind(row.id)
    .run();
  if (Number(update.meta.changes ?? 0) !== 1) {
    return { ok: false as const, status: 410, message: "Download token has already been used." };
  }

  return {
    ok: true as const,
    tokenId: row.id,
    checkoutIntentId: row.checkout_intent_id,
    entitlementId: row.entitlement_id,
    asset,
    file: privateAsset,
    expiresAt: timestampValue(row.expires_at),
  };
}
