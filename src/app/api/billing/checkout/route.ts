import { NextRequest, NextResponse } from "next/server";

import {
  createBillingCheckoutSession,
  getBillingRuntime,
  normalizeBillingEmail,
} from "@/lib/billing-signup";
import {
  billingCheckoutRoute,
  isSelfServePricingPlanSlug,
  pricingPlans,
  selfServePricingContract,
  whiteGloveSetupAddon,
  type SelfServePricingPlanSlug,
} from "@/lib/pricing-plans";

type BillingCheckoutPayload = {
  planSlug?: unknown;
  buyerEmail?: unknown;
  whiteGloveSetup?: unknown;
  previewOnly?: unknown;
};

function stringValue(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function booleanValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

async function readPayload(request: NextRequest): Promise<BillingCheckoutPayload> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as BillingCheckoutPayload;
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) return {};

  return {
    planSlug: formData.get("planSlug"),
    buyerEmail: formData.get("buyerEmail"),
    whiteGloveSetup: formData.get("whiteGloveSetup"),
    previewOnly: formData.get("previewOnly"),
  };
}

function wantsJson(request: NextRequest) {
  return (
    (request.headers.get("accept") ?? "").includes("application/json") ||
    (request.headers.get("content-type") ?? "").includes("application/json")
  );
}

function jsonError(status: number, code: string, message: string) {
  return NextResponse.json({ ok: false, code, message }, { status });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: billingCheckoutRoute,
    contract: selfServePricingContract,
    plans: pricingPlans,
    setupAddon: whiteGloveSetupAddon,
    redaction: {
      rawStripeIdsIncluded: false,
    },
  });
}

export async function POST(request: NextRequest) {
  const payload = await readPayload(request);
  const planSlug = stringValue(payload.planSlug);
  const json = wantsJson(request);

  if (!isSelfServePricingPlanSlug(planSlug)) {
    return jsonError(400, "unsupported_plan", "Choose Experiment or Grow to start self-serve checkout.");
  }

  let runtime;
  try {
    runtime = await getBillingRuntime();
  } catch {
    return jsonError(503, "billing_runtime_unavailable", "Billing storage is unavailable in this runtime.");
  }

  let result;
  try {
    result = await createBillingCheckoutSession({
      db: runtime.db,
      env: runtime.env,
      origin: request.nextUrl.origin,
      planSlug: planSlug as SelfServePricingPlanSlug,
      includeSetupAddon: booleanValue(payload.whiteGloveSetup),
      buyerEmail: normalizeBillingEmail(stringValue(payload.buyerEmail)),
      previewOnly: booleanValue(payload.previewOnly),
    });
  } catch (error) {
    return jsonError(
      502,
      "stripe_checkout_unavailable",
      error instanceof Error ? error.message : "Self-serve checkout is unavailable.",
    );
  }

  if (json || result.status === "preview") {
    return NextResponse.json(result);
  }

  return NextResponse.redirect(result.redirectUrl, 303);
}
