import { getCloudflareContext } from "@opennextjs/cloudflare";

import { productAccessCatalogs } from "@/lib/product-access";

export const productProtectedContentIssue = 181;
export const productProtectedContentStatus = "protected-product-content-readiness-ready";
export const productProtectedContentOwnerRoute = "/admin/products";

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
  privateFieldsExcluded: string[];
  writeBoundary: string;
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
      "Issue #181 exposes protected product content readiness metadata only. It does not deliver lessons, videos, transcripts, member posts, progress records, signed URLs, private R2 objects, or protected bodies to customers or agents.",
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
