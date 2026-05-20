import { getCloudflareContext } from "@opennextjs/cloudflare";

import { normalizeCustomerCheckoutIntentId } from "@/lib/customer-product-entitlements";
import { productAccessCatalogs } from "@/lib/product-access";

export const productProtectedContentIssue = 181;
export const productProtectedContentStatus = "protected-product-content-readiness-ready";
export const productProtectedContentDeliveryIssue = 185;
export const productProtectedContentDeliveryStatus = "protected-product-content-delivery-ready";
export const productProtectedContentOwnerRoute = "/admin/products";
export const productProtectedContentDeliveryApiRoute = "/api/products/protected-content";

type ProductRuntime = {
  db: D1Database;
};

type ProtectedContentRow = {
  id: string;
  product_id: string;
  asset_id: string;
  entitlement_template_id: string;
  status: string;
  content_kind: string;
  title: string;
  public_summary: string;
  access_policy: string;
  private_content_boundary: string;
  delivery_enabled: number | string;
  protected_body_included: number | string;
  updated_at: number | string;
};

type ProtectedContentDeliveryRow = ProtectedContentRow & {
  entitlement_id: string | null;
  entitlement_checkout_intent_id: string | null;
  entitlement_product_id: string | null;
  entitlement_row_template_id: string | null;
  entitlement_status: string | null;
  checkout_row_id: string | null;
  checkout_status: string | null;
  checkout_updated_at: number | string | null;
};

export type ProductProtectedContentRecord = {
  id: string;
  productId: string;
  productTitle: string;
  assetId: string;
  assetTitle: string;
  entitlementTemplateId: string;
  entitlementTemplateTitle: string;
  status: string;
  contentKind: string;
  title: string;
  publicSummary: string;
  accessPolicy: string;
  privateContentBoundary: string;
  deliveryEnabled: boolean;
  protectedBodyIncluded: boolean;
  updatedAt: string | null;
};

export type ProductProtectedContentSummary = {
  id: string;
  status: typeof productProtectedContentStatus;
  issue: typeof productProtectedContentIssue;
  parentIssue: 16;
  ownerRoute: typeof productProtectedContentOwnerRoute;
  publicSourceDataRoute: "/products/source-data";
  source: "d1" | "unavailable";
  loadError: string | null;
  counts: {
    protectedContentItems: number;
    courseItems: number;
    membershipItems: number;
    deliveryEnabled: number;
    protectedBodiesIncluded: number;
  };
  records: ProductProtectedContentRecord[];
  redaction: {
    privateContentBodiesIncluded: false;
    rawR2KeysIncluded: false;
    signedUrlsIncluded: false;
    buyerDataIncluded: false;
    progressDataIncluded: false;
    deliveryEnabled: false;
  };
  delivery: ProductProtectedContentDeliverySummary;
  privateFieldsExcluded: string[];
  writeBoundary: string;
};

export type ProductProtectedContentDeliverySummary = {
  id: "product-protected-content-delivery-contract";
  status: typeof productProtectedContentDeliveryStatus;
  issue: typeof productProtectedContentDeliveryIssue;
  followsIssue: typeof productProtectedContentIssue;
  parentIssue: 16;
  apiRoute: typeof productProtectedContentDeliveryApiRoute;
  sourceDataRoute: "/products/source-data";
  authBoundary: "checkout-intent-and-entitlement-bearer-reference";
  lookupInputs: ["checkoutIntentId", "entitlementId", "protectedContentId"];
  eligibleContentKinds: ["course_module", "member_area"];
  deliveryMode: "seeded-protected-fixture";
  trustedCheckoutStatuses: ["paid", "completed"];
  redaction: ProductProtectedContentDeliveryRedaction;
  writeBoundary: string;
};

export type ProductProtectedContentDeliveryRedaction = {
  buyerEmailIncluded: false;
  buyerEmailHashIncluded: false;
  rawStripeIdsIncluded: false;
  sourceStripeEventIdsIncluded: false;
  rawR2KeysIncluded: false;
  signedUrlsIncluded: false;
  metadataJsonIncluded: false;
  protectedBodyIncludedInSourceData: false;
  progressDataIncluded: false;
};

export type ProductProtectedContentDeliveryResult =
  | {
      ok: true;
      status: typeof productProtectedContentDeliveryStatus;
      issue: typeof productProtectedContentDeliveryIssue;
      followsIssue: typeof productProtectedContentIssue;
      checkoutIntentId: string;
      entitlementId: string;
      protectedContent: {
        id: string;
        productId: string;
        productTitle: string;
        entitlementTemplateId: string;
        title: string;
        publicSummary: string;
        contentKind: string;
        deliveryMode: "seeded-protected-fixture";
        bodyFormat: "markdown";
        body: string;
        protectedBodyIncluded: true;
      };
      access: {
        entitlementStatus: "active";
        checkoutStatus: "paid" | "completed";
        entitlementScopeMatched: true;
        staleStateChecked: true;
        privateProgressWritten: false;
      };
      redaction: ProductProtectedContentDeliveryRedaction;
    }
  | {
      ok: false;
      status: "invalid_request" | "not_found" | "not_eligible" | "unavailable";
      issue: typeof productProtectedContentDeliveryIssue;
      message: string;
      redaction: ProductProtectedContentDeliveryRedaction;
    };

type ProtectedContentFixture = {
  protectedContentId: string;
  body: string;
};

async function getRuntime(): Promise<ProductRuntime> {
  const { env } = await getCloudflareContext({ async: true });
  const cloudflareEnv = env as Cloudflare.Env;
  if (!cloudflareEnv.DB) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }
  return { db: cloudflareEnv.DB };
}

function numberValue(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function booleanValue(value: number | string | null | undefined) {
  return numberValue(value) > 0;
}

function timestampValue(value: number | string | null | undefined) {
  const seconds = numberValue(value);
  if (!seconds) return null;
  return new Date(seconds * 1000).toISOString();
}

function productById() {
  return new Map(productAccessCatalogs.flatMap((catalog) => catalog.products.map((product) => [product.id, product] as const)));
}

function assetById() {
  return new Map(productAccessCatalogs.flatMap((catalog) => catalog.assets.map((asset) => [asset.id, asset] as const)));
}

function templateById() {
  return new Map(
    productAccessCatalogs.flatMap((catalog) =>
      catalog.entitlementTemplates.map((template) => [template.id, template] as const),
    ),
  );
}

const protectedContentDeliveryRedaction = {
  buyerEmailIncluded: false,
  buyerEmailHashIncluded: false,
  rawStripeIdsIncluded: false,
  sourceStripeEventIdsIncluded: false,
  rawR2KeysIncluded: false,
  signedUrlsIncluded: false,
  metadataJsonIncluded: false,
  protectedBodyIncludedInSourceData: false,
  progressDataIncluded: false,
} satisfies ProductProtectedContentDeliveryRedaction;

export const productProtectedContentDeliverySummary: ProductProtectedContentDeliverySummary = {
  id: "product-protected-content-delivery-contract",
  status: productProtectedContentDeliveryStatus,
  issue: productProtectedContentDeliveryIssue,
  followsIssue: productProtectedContentIssue,
  parentIssue: 16,
  apiRoute: productProtectedContentDeliveryApiRoute,
  sourceDataRoute: "/products/source-data",
  authBoundary: "checkout-intent-and-entitlement-bearer-reference",
  lookupInputs: ["checkoutIntentId", "entitlementId", "protectedContentId"],
  eligibleContentKinds: ["course_module", "member_area"],
  deliveryMode: "seeded-protected-fixture",
  trustedCheckoutStatuses: ["paid", "completed"],
  redaction: protectedContentDeliveryRedaction,
  writeBoundary:
    "Issue #185 can return seeded protected course/member fixture bodies only for an active checkout-linked entitlement whose product/template scope matches the protected content section and whose checkout state is currently paid or completed. It does not expose buyer identity, raw Stripe IDs, webhook IDs, private R2 keys, signed URLs, metadata JSON, progress rows, arbitrary uploaded content, live fulfillment automation, or direct unauthenticated agent writes.",
};

const protectedContentFixtures = new Map<string, ProtectedContentFixture>([
  [
    "protected-content-launch-course-module-1",
    {
      protectedContentId: "protected-content-launch-course-module-1",
      body: [
        "# Launch course module fixture",
        "",
        "This protected lesson fixture proves checkout-intent-scoped course access through Bumpgrade.",
        "It is safe sample content and contains no buyer identity, Stripe identifiers, R2 object keys, signed URLs, webhook ids, private metadata, or progress state.",
        "",
        "## Lesson path",
        "",
        "- Confirm the offer promise and the product entitlement.",
        "- Check that the current checkout state is still trusted before rendering the lesson.",
        "- Keep lesson progress and private media delivery as future authenticated APIs.",
      ].join("\n"),
    },
  ],
  [
    "protected-content-launch-member-area",
    {
      protectedContentId: "protected-content-launch-member-area",
      body: [
        "# Launch member area fixture",
        "",
        "This protected member-area fixture proves entitlement-gated member content without exposing subscription identifiers or private files.",
        "It is safe sample content and contains no buyer identity, Stripe identifiers, R2 object keys, signed URLs, webhook ids, private metadata, or member progress.",
        "",
        "## Member path",
        "",
        "- Confirm active access before showing member-only posts.",
        "- Keep subscription transitions and private community data out of public source-data.",
        "- Require future subscription-state checks before real recurring member access ships.",
      ].join("\n"),
    },
  ],
]);

function emptyProtectedContentSummary(
  source: ProductProtectedContentSummary["source"],
  loadError: string | null,
): ProductProtectedContentSummary {
  return {
    id: "product-protected-content-readiness-contract",
    status: productProtectedContentStatus,
    issue: productProtectedContentIssue,
    parentIssue: 16,
    ownerRoute: productProtectedContentOwnerRoute,
    publicSourceDataRoute: "/products/source-data",
    source,
    loadError,
    counts: {
      protectedContentItems: 0,
      courseItems: 0,
      membershipItems: 0,
      deliveryEnabled: 0,
      protectedBodiesIncluded: 0,
    },
    records: [],
    redaction: {
      privateContentBodiesIncluded: false,
      rawR2KeysIncluded: false,
      signedUrlsIncluded: false,
      buyerDataIncluded: false,
      progressDataIncluded: false,
      deliveryEnabled: false,
    },
    delivery: productProtectedContentDeliverySummary,
    privateFieldsExcluded: [
      "lessonBody",
      "videoUrl",
      "transcriptBody",
      "memberPostBody",
      "progressState",
      "privateR2ObjectKeys",
      "signedUrls",
      "buyerEmail",
      "buyerEmailHash",
    ],
    writeBoundary:
      "Issue #181 exposes protected product content readiness metadata only. Issue #185 can return seeded protected fixture bodies only through checkout-intent and entitlement-scoped delivery checks. It does not deliver videos, transcripts, real member posts, progress records, signed URLs, private R2 objects, arbitrary uploaded content, or live fulfillment automation to customers or agents.",
  };
}

function publicProtectedContentRecord(row: ProtectedContentRow): ProductProtectedContentRecord {
  const products = productById();
  const assets = assetById();
  const templates = templateById();
  const product = products.get(row.product_id);
  const asset = assets.get(row.asset_id);
  const template = templates.get(row.entitlement_template_id);

  return {
    id: row.id,
    productId: row.product_id,
    productTitle: product?.title ?? row.product_id,
    assetId: row.asset_id,
    assetTitle: asset?.title ?? row.asset_id,
    entitlementTemplateId: row.entitlement_template_id,
    entitlementTemplateTitle: template?.title ?? row.entitlement_template_id,
    status: row.status,
    contentKind: row.content_kind,
    title: row.title,
    publicSummary: row.public_summary,
    accessPolicy: row.access_policy,
    privateContentBoundary: row.private_content_boundary,
    deliveryEnabled: booleanValue(row.delivery_enabled),
    protectedBodyIncluded: booleanValue(row.protected_body_included),
    updatedAt: timestampValue(row.updated_at),
  };
}

export async function getProductProtectedContentSummary(): Promise<ProductProtectedContentSummary> {
  try {
    const { db } = await getRuntime();
    const rows = await db
      .prepare(
        `SELECT
          id, product_id, asset_id, entitlement_template_id, status, content_kind, title,
          public_summary, access_policy, private_content_boundary, delivery_enabled,
          protected_body_included, updated_at
        FROM product_protected_content_sections
        ORDER BY updated_at DESC, id ASC`,
      )
      .all<ProtectedContentRow>();
    const rawRows = rows.results ?? [];
    const records = rawRows.map(publicProtectedContentRecord);

    return {
      ...emptyProtectedContentSummary("d1", null),
      counts: {
        protectedContentItems: records.length,
        courseItems: records.filter((record) => record.contentKind === "course_module").length,
        membershipItems: records.filter((record) => record.contentKind === "member_area").length,
        deliveryEnabled: rawRows.filter((row) => booleanValue(row.delivery_enabled)).length,
        protectedBodiesIncluded: rawRows.filter((row) => booleanValue(row.protected_body_included)).length,
      },
      records,
    };
  } catch (error) {
    return emptyProtectedContentSummary(
      "unavailable",
      error instanceof Error ? error.message : "Unable to load product protected content readiness.",
    );
  }
}

function deliveryError(
  status: Extract<ProductProtectedContentDeliveryResult, { ok: false }>["status"],
  message: string,
): ProductProtectedContentDeliveryResult {
  return {
    ok: false,
    status,
    issue: productProtectedContentDeliveryIssue,
    message,
    redaction: protectedContentDeliveryRedaction,
  };
}

function isTrustedCheckoutStatus(status: string | null | undefined): status is "paid" | "completed" {
  return status === "paid" || status === "completed";
}

function normalizeProtectedContentId(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!/^protected-content-[a-z0-9-]+$/.test(trimmed)) return null;
  return trimmed;
}

function normalizeEntitlementId(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!/^entitlement-[a-zA-Z0-9-]+$/.test(trimmed)) return null;
  return trimmed;
}

function entitlementCoversProtectedContent(row: ProtectedContentDeliveryRow) {
  if (!row.entitlement_product_id || !row.entitlement_row_template_id) return false;
  if (row.entitlement_product_id === row.product_id && row.entitlement_row_template_id === row.entitlement_template_id) {
    return true;
  }

  const entitlementProduct = productById().get(row.entitlement_product_id);
  return Boolean(
    entitlementProduct?.assetIds.includes(row.asset_id) &&
      entitlementProduct.entitlementTemplateId === row.entitlement_row_template_id,
  );
}

export async function deliverProductProtectedContent(input: {
  checkoutIntentId: string | null | undefined;
  entitlementId: string | null | undefined;
  protectedContentId: string | null | undefined;
}): Promise<ProductProtectedContentDeliveryResult> {
  const checkoutIntentId = normalizeCustomerCheckoutIntentId(input.checkoutIntentId);
  const entitlementId = normalizeEntitlementId(input.entitlementId);
  const protectedContentId = normalizeProtectedContentId(input.protectedContentId);

  if (!checkoutIntentId || !entitlementId || !protectedContentId) {
    return deliveryError("invalid_request", "checkoutIntentId, entitlementId, and protectedContentId are required.");
  }

  try {
    const { db } = await getRuntime();
    const row = await db
      .prepare(
        `SELECT
          pc.id,
          pc.product_id,
          pc.asset_id,
          pc.entitlement_template_id,
          pc.status,
          pc.content_kind,
          pc.title,
          pc.public_summary,
          pc.access_policy,
          pc.private_content_boundary,
          pc.delivery_enabled,
          pc.protected_body_included,
          pc.updated_at,
          e.id AS entitlement_id,
          e.checkout_intent_id AS entitlement_checkout_intent_id,
          e.product_id AS entitlement_product_id,
          e.entitlement_template_id AS entitlement_row_template_id,
          e.status AS entitlement_status,
          ci.id AS checkout_row_id,
          ci.status AS checkout_status,
          ci.updated_at AS checkout_updated_at
        FROM product_protected_content_sections pc
        LEFT JOIN product_entitlements e
          ON e.id = ?
          AND e.checkout_intent_id = ?
        LEFT JOIN checkout_intents ci ON ci.id = e.checkout_intent_id
        WHERE pc.id = ?`,
      )
      .bind(entitlementId, checkoutIntentId, protectedContentId)
      .first<ProtectedContentDeliveryRow>();

    if (!row) {
      return deliveryError("not_found", "Protected content section was not found.");
    }
    if (!booleanValue(row.delivery_enabled)) {
      return deliveryError("not_eligible", "Protected content delivery is not enabled for this section.");
    }
    if (!row.entitlement_id) {
      return deliveryError("not_found", "No matching entitlement was found for that checkout intent.");
    }
    if (
      row.entitlement_status !== "active" ||
      !entitlementCoversProtectedContent(row) ||
      !isTrustedCheckoutStatus(row.checkout_status)
    ) {
      return deliveryError("not_eligible", "This entitlement is not eligible for protected content delivery yet.");
    }

    const fixture = protectedContentFixtures.get(row.id);
    if (!fixture) {
      return deliveryError("not_eligible", "No protected fixture is configured for this section.");
    }

    const record = publicProtectedContentRecord(row);

    return {
      ok: true,
      status: productProtectedContentDeliveryStatus,
      issue: productProtectedContentDeliveryIssue,
      followsIssue: productProtectedContentIssue,
      checkoutIntentId,
      entitlementId,
      protectedContent: {
        id: row.id,
        productId: row.product_id,
        productTitle: record.productTitle,
        entitlementTemplateId: row.entitlement_template_id,
        title: row.title,
        publicSummary: row.public_summary,
        contentKind: row.content_kind,
        deliveryMode: "seeded-protected-fixture",
        bodyFormat: "markdown",
        body: fixture.body,
        protectedBodyIncluded: true,
      },
      access: {
        entitlementStatus: "active",
        checkoutStatus: row.checkout_status,
        entitlementScopeMatched: true,
        staleStateChecked: true,
        privateProgressWritten: false,
      },
      redaction: protectedContentDeliveryRedaction,
    };
  } catch (error) {
    return deliveryError(
      "unavailable",
      error instanceof Error ? error.message : "Unable to deliver protected content.",
    );
  }
}
