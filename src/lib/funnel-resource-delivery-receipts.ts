import { getCloudflareContext } from "@opennextjs/cloudflare";

export const funnelResourceDeliveryReceiptTable = "funnel_resource_delivery_receipts";
export const funnelResourceDeliveryReceiptStatus = "funnel-resource-delivery-receipt-ready";
export const funnelResourceDeliveryReceiptIssue = 417;

export type FunnelResourceDeliverySource = "public-funnel-resource-delivery" | "owner-agent-funnel-resource-delivery";

export type FunnelResourceDeliveryTokenSourceMetadata = {
  deliverySource: FunnelResourceDeliverySource;
  funnelId: string;
  funnelSlug: string;
  funnelTitle: string;
  funnelRevisionId: string;
  blockId: string;
  blockTitle: string;
  productId: string;
  productTitle: string;
  assetId: string;
  assetTitle: string;
};

type DownloadTokenReceiptRow = {
  id: string;
  checkout_intent_id: string;
  entitlement_id: string;
  product_id: string;
  asset_id: string;
  metadata_json: string | null;
};

type ReceiptSummaryRow = {
  id: string;
  delivery_source: FunnelResourceDeliverySource;
  funnel_id: string;
  funnel_slug: string;
  funnel_title: string;
  funnel_revision_id: string;
  block_id: string;
  block_title: string;
  product_id: string;
  product_title: string;
  asset_id: string;
  asset_title: string;
  receipt_status: string;
  created_at: number | string;
};

type ReceiptCountRow = {
  delivery_source: FunnelResourceDeliverySource;
  count: number;
};

export const funnelResourceDeliveryReceiptCapability = {
  id: "funnel-resource-delivery-receipt-evidence",
  status: funnelResourceDeliveryReceiptStatus,
  issue: funnelResourceDeliveryReceiptIssue,
  table: funnelResourceDeliveryReceiptTable,
  sourceDataRoute: "/funnels/source-data",
  recordsOn: "/api/products/downloads",
  follows: ["public-funnel-resource-delivery-token", "agent-funnel-resource-delivery-token-owner-confirmed"],
  receiptTrigger: "successful private download-token redemption after entitlement and checkout revalidation",
  rawTokensIncluded: false,
  rawCheckoutIntentIdsIncluded: false,
  rawEntitlementIdsIncluded: false,
  buyerDataIncluded: false,
  rawR2KeysIncluded: false,
  signedUrlsIncluded: false,
  arbitraryUploadedAssetDeliveryEnabled: false,
  liveFulfillmentAutomationEnabled: false,
  unauthenticatedAgentWriteCreated: false,
  safeForPublicAgents: [
    "Read aggregate funnel resource-delivery receipt counts after successful download-token redemption.",
    "Inspect safe funnel, block, product, asset, and receipt-source metadata without raw buyer, entitlement, checkout, token, R2, or signed URL data.",
    "Distinguish receipt evidence from live fulfillment automation, signed URL creation, arbitrary uploaded private asset delivery, billing mutation, and unauthenticated public agent writes.",
  ],
  writeBoundary:
    "Issue #417 records redacted funnel resource-delivery receipt evidence when the existing Bumpgrade download route successfully redeems a funnel-scoped private download token. Receipts store safe funnel, block, product, asset, source, and hashed checkout/entitlement references only; they do not expose raw tokens, buyer data, raw checkout or entitlement IDs, R2 keys, signed URLs, arbitrary private assets, provider media, live fulfillment tasks, billing writes, or unauthenticated public agent writes.",
};

export const funnelResourceDeliveryReceiptRedaction = {
  rawTokensIncluded: false,
  rawCheckoutIntentIdsIncluded: false,
  rawEntitlementIdsIncluded: false,
  buyerDataIncluded: false,
  rawR2KeysIncluded: false,
  signedUrlsIncluded: false,
  metadataJsonIncluded: false,
  rawRowsIncluded: false,
} as const;

export function funnelResourceDeliveryTokenMetadata(source: FunnelResourceDeliveryTokenSourceMetadata) {
  return {
    issue: funnelResourceDeliveryReceiptIssue,
    capabilityId: funnelResourceDeliveryReceiptCapability.id,
    rawTokensIncluded: false,
    rawCheckoutIntentIdsIncluded: false,
    rawEntitlementIdsIncluded: false,
    buyerDataIncluded: false,
    rawR2KeysIncluded: false,
    signedUrlsIncluded: false,
    funnelResourceDelivery: source,
  };
}

function metadataSource(metadataJson: string | null): FunnelResourceDeliveryTokenSourceMetadata | null {
  if (!metadataJson) return null;
  try {
    const metadata = JSON.parse(metadataJson) as { funnelResourceDelivery?: Partial<FunnelResourceDeliveryTokenSourceMetadata> };
    const source = metadata.funnelResourceDelivery;
    if (!source) return null;
    if (
      (source.deliverySource !== "public-funnel-resource-delivery" &&
        source.deliverySource !== "owner-agent-funnel-resource-delivery") ||
      !source.funnelId ||
      !source.funnelSlug ||
      !source.funnelRevisionId ||
      !source.blockId ||
      !source.productId ||
      !source.assetId
    ) {
      return null;
    }
    return {
      deliverySource: source.deliverySource,
      funnelId: source.funnelId,
      funnelSlug: source.funnelSlug,
      funnelTitle: source.funnelTitle ?? source.funnelSlug,
      funnelRevisionId: source.funnelRevisionId,
      blockId: source.blockId,
      blockTitle: source.blockTitle ?? source.blockId,
      productId: source.productId,
      productTitle: source.productTitle ?? source.productId,
      assetId: source.assetId,
      assetTitle: source.assetTitle ?? source.assetId,
    };
  } catch {
    return null;
  }
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timestampValue(value: number | string | null | undefined) {
  const seconds = Number(value ?? 0);
  if (!Number.isFinite(seconds) || !seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

export async function recordFunnelResourceDeliveryReceiptFromDownloadToken(db: D1Database, row: DownloadTokenReceiptRow) {
  const source = metadataSource(row.metadata_json);
  if (!source) return { recorded: false as const, receiptId: null };

  const receiptId = `funnel-resource-delivery-receipt-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT OR IGNORE INTO ${funnelResourceDeliveryReceiptTable} (
        id, product_download_token_id, delivery_source, funnel_id, funnel_slug, funnel_title,
        funnel_revision_id, block_id, block_title, product_id, product_title, asset_id, asset_title,
        checkout_intent_sha256, entitlement_sha256, receipt_status, redaction_json, metadata_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'downloaded', ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      receiptId,
      row.id,
      source.deliverySource,
      source.funnelId,
      source.funnelSlug,
      source.funnelTitle,
      source.funnelRevisionId,
      source.blockId,
      source.blockTitle,
      source.productId,
      source.productTitle,
      source.assetId,
      source.assetTitle,
      await sha256(`checkout-intent:${row.checkout_intent_id}`),
      await sha256(`entitlement:${row.entitlement_id}`),
      JSON.stringify(funnelResourceDeliveryReceiptRedaction),
      JSON.stringify({
        issue: funnelResourceDeliveryReceiptIssue,
        capabilityId: funnelResourceDeliveryReceiptCapability.id,
        productDownloadTokenId: row.id,
        rawTokensIncluded: false,
        rawCheckoutIntentIdsIncluded: false,
        rawEntitlementIdsIncluded: false,
        buyerDataIncluded: false,
        rawR2KeysIncluded: false,
        signedUrlsIncluded: false,
      }),
    )
    .run();

  return { recorded: true as const, receiptId };
}

async function getDb() {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) throw new Error("Cloudflare D1 binding DB is not available.");
  return cloudflareEnv.DB;
}

export async function getFunnelResourceDeliveryReceiptSummary() {
  try {
    const db = await getDb();
    const totalRow = await db
      .prepare(`SELECT COUNT(*) AS count FROM ${funnelResourceDeliveryReceiptTable}`)
      .first<{ count: number }>();
    const counts = await db
      .prepare(
        `SELECT delivery_source, COUNT(*) AS count
         FROM ${funnelResourceDeliveryReceiptTable}
         GROUP BY delivery_source
         ORDER BY delivery_source`,
      )
      .all<ReceiptCountRow>();
    const latest = await db
      .prepare(
        `SELECT id, delivery_source, funnel_id, funnel_slug, funnel_title, funnel_revision_id,
                block_id, block_title, product_id, product_title, asset_id, asset_title,
                receipt_status, created_at
         FROM ${funnelResourceDeliveryReceiptTable}
         ORDER BY created_at DESC
         LIMIT 8`,
      )
      .all<ReceiptSummaryRow>();

    return {
      ...funnelResourceDeliveryReceiptCapability,
      count: Number(totalRow?.count ?? 0),
      countsBySource: (counts.results ?? []).map((row) => ({
        deliverySource: row.delivery_source,
        count: Number(row.count ?? 0),
      })),
      latestReceipts: (latest.results ?? []).map((row) => ({
        id: row.id,
        deliverySource: row.delivery_source,
        funnelId: row.funnel_id,
        funnelSlug: row.funnel_slug,
        funnelTitle: row.funnel_title,
        funnelRevisionId: row.funnel_revision_id,
        blockId: row.block_id,
        blockTitle: row.block_title,
        productId: row.product_id,
        productTitle: row.product_title,
        assetId: row.asset_id,
        assetTitle: row.asset_title,
        receiptStatus: row.receipt_status,
        createdAt: timestampValue(row.created_at),
      })),
      loadError: null,
      redaction: funnelResourceDeliveryReceiptRedaction,
    };
  } catch (error) {
    return {
      ...funnelResourceDeliveryReceiptCapability,
      count: 0,
      countsBySource: [],
      latestReceipts: [],
      loadError: error instanceof Error ? error.message : "Funnel resource delivery receipt summary unavailable.",
      redaction: funnelResourceDeliveryReceiptRedaction,
    };
  }
}
