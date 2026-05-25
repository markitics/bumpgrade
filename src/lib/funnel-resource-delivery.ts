import { getPublishedD1FunnelBySlug } from "@/lib/funnel-drafts";
import { type FunnelBlock, type FunnelRecord, publicFunnelResourceDeliveryTokenCapability } from "@/lib/funnels";
import { createProductDownloadToken, type ProductDownloadRedaction } from "@/lib/product-download-tokens";

export const funnelResourceDeliveryIssue = 417;
export const funnelResourceDeliveryStatus = publicFunnelResourceDeliveryTokenCapability.status;
export const funnelResourceDeliveryApiRoute = publicFunnelResourceDeliveryTokenCapability.apiRoute;

type FunnelResourceDeliveryInput = {
  funnelSlug?: unknown;
  blockId?: unknown;
  checkoutIntentId?: unknown;
  entitlementId?: unknown;
};

type FunnelResourceDeliveryRedaction = ProductDownloadRedaction & {
  rawFunnelRowsIncluded: false;
  rawEntitlementRowsIncluded: false;
  checkoutIntentPrivateDataIncluded: false;
};

export type FunnelResourceDeliveryTokenResult =
  | {
      ok: true;
      status: typeof funnelResourceDeliveryStatus;
      issue: typeof funnelResourceDeliveryIssue;
      token: string;
      downloadUrl: string;
      expiresAt: string;
      funnel: {
        id: string;
        slug: string;
        title: string;
      };
      block: {
        id: string;
        title: string;
        productId: string;
        productTitle: string;
        assetId: string;
        assetTitle: string;
      };
      redaction: FunnelResourceDeliveryRedaction;
    }
  | {
      ok: false;
      status: "invalid_request" | "not_found" | "not_eligible" | "unavailable";
      issue: typeof funnelResourceDeliveryIssue;
      message: string;
      redaction: FunnelResourceDeliveryRedaction;
    };

export const funnelResourceDeliveryRedaction: FunnelResourceDeliveryRedaction = {
  buyerEmailIncluded: false,
  buyerEmailHashIncluded: false,
  rawStripeIdsIncluded: false,
  rawR2KeysIncluded: false,
  signedUrlsIncluded: false,
  metadataJsonIncluded: false,
  rawFunnelRowsIncluded: false,
  rawEntitlementRowsIncluded: false,
  checkoutIntentPrivateDataIncluded: false,
};

function stringValue(value: unknown, maxLength = 180) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function resourceBlockForFunnel(funnel: FunnelRecord, blockId: string) {
  for (const step of funnel.steps) {
    const block = step.blocks.find((candidate) => candidate.id === blockId);
    if (block) return block;
  }
  return null;
}

function deliveryError(
  status: Extract<FunnelResourceDeliveryTokenResult, { ok: false }>["status"],
  message: string,
): FunnelResourceDeliveryTokenResult {
  return {
    ok: false,
    status,
    issue: funnelResourceDeliveryIssue,
    message,
    redaction: funnelResourceDeliveryRedaction,
  };
}

function publicBlock(block: FunnelBlock) {
  const link = block.resourceDeliveryLink;
  if (!link) return null;
  return {
    id: block.id,
    title: block.title,
    productId: link.productId,
    productTitle: link.productTitle,
    assetId: link.assetId,
    assetTitle: link.assetTitle,
  };
}

export async function createFunnelResourceDeliveryToken(
  input: FunnelResourceDeliveryInput,
): Promise<FunnelResourceDeliveryTokenResult> {
  const funnelSlug = stringValue(input.funnelSlug);
  const blockId = stringValue(input.blockId);
  const checkoutIntentId = stringValue(input.checkoutIntentId, 220);
  const entitlementId = stringValue(input.entitlementId, 220);

  if (!funnelSlug || !blockId || !checkoutIntentId || !entitlementId) {
    return deliveryError("invalid_request", "funnelSlug, blockId, checkoutIntentId, and entitlementId are required.");
  }

  let funnel: FunnelRecord | null = null;
  try {
    funnel = await getPublishedD1FunnelBySlug(funnelSlug);
  } catch {
    return deliveryError("unavailable", "Published funnel delivery is temporarily unavailable.");
  }
  if (!funnel) {
    return deliveryError("not_found", "No published funnel was found for that slug.");
  }

  const block = resourceBlockForFunnel(funnel, blockId);
  if (!block?.resourceDeliveryLink) {
    return deliveryError("not_found", "No resource delivery block was found for that published funnel.");
  }
  if (block.resourceDeliveryLink.assetKind !== "file") {
    return deliveryError("not_eligible", "This funnel resource block does not point to a private file asset.");
  }

  const tokenResult = await createProductDownloadToken({
    checkoutIntentId,
    entitlementId,
    productId: block.resourceDeliveryLink.productId,
    assetId: block.resourceDeliveryLink.assetId,
  });

  if (!tokenResult.ok) {
    return deliveryError(tokenResult.status, tokenResult.message);
  }

  const publicBlockData = publicBlock(block);
  if (!publicBlockData) {
    return deliveryError("not_found", "No public resource delivery block data was available.");
  }

  return {
    ok: true,
    status: funnelResourceDeliveryStatus,
    issue: funnelResourceDeliveryIssue,
    token: tokenResult.token,
    downloadUrl: tokenResult.downloadUrl,
    expiresAt: tokenResult.expiresAt,
    funnel: {
      id: funnel.id,
      slug: funnel.slug,
      title: funnel.title,
    },
    block: publicBlockData,
    redaction: funnelResourceDeliveryRedaction,
  };
}
