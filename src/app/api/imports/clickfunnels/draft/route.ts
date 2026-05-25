import { NextRequest, NextResponse } from "next/server";

import { createAuth } from "@/lib/auth";
import { createClickFunnelsImportedDraftFunnel } from "@/lib/funnel-drafts";
import {
  clickFunnelsDraftImportApiRoute,
  clickFunnelsDraftImportConfirmationText,
  importerIssue,
} from "@/lib/importers";
import {
  createFreeBuildWorkspace,
  getPublisherTenantD1OrThrow,
  PublisherTenantError,
  publisherFreeBuildParentIssue,
  publisherFreeBuildWorkspaceConfirmationText,
  type PublisherSessionUser,
} from "@/lib/publisher-tenants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RequestPayload = {
  get: (key: string) => string;
};

class ImporterDraftError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ImporterDraftError";
    this.status = status;
    this.code = code;
  }
}

function stringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

async function readPayload(request: NextRequest): Promise<RequestPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    const values = new Map<string, string>();

    if (body && typeof body === "object" && !Array.isArray(body)) {
      for (const [key, value] of Object.entries(body)) {
        const stringified = stringValue(value);
        if (stringified) values.set(key, stringified);
      }
    }

    return { get: (key) => values.get(key) ?? "" };
  }

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return {
      get: (key) => {
        const value = formData.get(key);
        return typeof value === "string" ? value : "";
      },
    };
  }

  return { get: () => "" };
}

function wantsJson(request: NextRequest, payload: RequestPayload) {
  return (
    payload.get("return") === "json" ||
    (request.headers.get("accept") ?? "").includes("application/json") ||
    (request.headers.get("content-type") ?? "").includes("application/json")
  );
}

async function getSessionUser(headers: Headers): Promise<PublisherSessionUser | null> {
  const session = await createAuth().api.getSession({ headers }).catch(() => null);
  const user = session?.user;

  if (!user?.id || !user.email) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified === true,
  };
}

function normalizePublicUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new ImporterDraftError("Enter a full public URL, including https://.", 400, "SOURCE_URL_INVALID");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ImporterDraftError("Use an http or https URL for the source page.", 400, "SOURCE_URL_PROTOCOL");
  }

  parsed.hash = "";
  return parsed.toString().slice(0, 500);
}

function normalizedInput(payload: RequestPayload) {
  const confirmationText = payload.get("confirmationText").trim();
  if (confirmationText !== clickFunnelsDraftImportConfirmationText) {
    throw new ImporterDraftError("Confirm the ClickFunnels private import plan before continuing.", 400, "CONFIRMATION_REQUIRED");
  }

  const idempotencyKey = payload.get("idempotencyKey").trim();
  if (!idempotencyKey) {
    throw new ImporterDraftError("Refresh this page before creating the private import plan.", 400, "IDEMPOTENCY_REQUIRED");
  }

  const offerTitle = payload.get("offerTitle").trim();
  if (offerTitle.length < 3) {
    throw new ImporterDraftError("Name the offer or funnel you want to import.", 400, "OFFER_TITLE_REQUIRED");
  }

  const sourceUrl = normalizePublicUrl(payload.get("sourceUrl"));
  const pageCopy = payload.get("pageCopy").trim();
  const followUpNotes = payload.get("followUpNotes").trim();
  if (!sourceUrl && !pageCopy && !followUpNotes) {
    throw new ImporterDraftError("Add a source URL, pasted copy, or follow-up notes before creating the private import plan.", 400, "SOURCE_MATERIAL_REQUIRED");
  }

  return {
    offerTitle: offerTitle.slice(0, 120),
    audience: payload.get("audience").trim().slice(0, 180),
    launchGoal: payload.get("launchGoal").trim().slice(0, 300),
    sourceUrls: sourceUrl ? [sourceUrl] : [],
    pageCopy: pageCopy.slice(0, 2_000),
    followUpNotes: followUpNotes.slice(0, 1_000),
    idempotencyKey,
  };
}

function publicTenant(tenant: Awaited<ReturnType<typeof createFreeBuildWorkspace>>["tenant"]) {
  return {
    id: tenant.id,
    displayName: tenant.displayName,
    status: tenant.status,
    planStatus: tenant.planStatus,
    defaultSubdomain: tenant.defaultSubdomain,
    primaryHostname: tenant.primaryHostname,
    sourceIssueNumber: tenant.sourceIssueNumber,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  };
}

function publicDraft(draft: Awaited<ReturnType<typeof createClickFunnelsImportedDraftFunnel>>) {
  return {
    id: draft.id,
    slug: draft.slug,
    title: draft.title,
    status: draft.status,
    sourceIssueNumber: draft.sourceIssueNumber,
    parentIssueNumber: draft.parentIssueNumber,
    revisionId: draft.revisionId,
    stepCount: draft.steps.length,
    blockCount: draft.steps.reduce((total, step) => total + step.blocks.length, 0),
    previewRoute: draft.previewRoute,
    sourceDataRoute: draft.sourceDataRoute,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
  };
}

function redaction() {
  return {
    rawExportFilesIncluded: false,
    customerRowsIncluded: false,
    privateEmailsIncluded: false,
    paymentCredentialsIncluded: false,
    sessionCookiesIncluded: false,
    rawPastedMaterialIncludedInResponse: false,
    publicPublishingEnabled: false,
    liveCheckoutEnabled: false,
    subscriberSendsEnabled: false,
    customDomainsEnabled: false,
    fulfillmentEnabled: false,
  };
}

function redirectWithError(request: NextRequest, message: string) {
  const redirect = new URL("/imports/clickfunnels", request.url);
  redirect.searchParams.set("importError", message);
  return NextResponse.redirect(redirect, { status: 303 });
}

export async function POST(request: NextRequest) {
  const payload = await readPayload(request);
  const json = wantsJson(request, payload);
  const user = await getSessionUser(request.headers);

  if (!user) {
    if (json) {
      return NextResponse.json(
        {
          ok: false,
          error: "Publisher session required.",
          code: "PUBLISHER_SESSION_REQUIRED",
          issue: importerIssue,
          route: clickFunnelsDraftImportApiRoute,
          redaction: redaction(),
        },
        { status: 401 },
      );
    }

    const login = new URL("/login", request.url);
    login.searchParams.set("callbackURL", "/imports/clickfunnels");
    return NextResponse.redirect(login, { status: 303 });
  }

  try {
    if (!user.emailVerified) {
      throw new ImporterDraftError("Confirm your email before creating a private import plan.", 403, "EMAIL_UNVERIFIED");
    }

    const input = normalizedInput(payload);
    const db = await getPublisherTenantD1OrThrow();
    const workspace = await createFreeBuildWorkspace(db, user, {
      confirmationText: publisherFreeBuildWorkspaceConfirmationText,
      idempotencyKey: `clickfunnels-import-workspace:${input.idempotencyKey}`,
    });
    const draft = await createClickFunnelsImportedDraftFunnel(db, { userId: user.id, email: user.email }, {
      ...input,
      idempotencyKey: `clickfunnels-import-draft:${input.idempotencyKey}`,
      tenantId: workspace.tenant.id,
    });

    if (json) {
      return NextResponse.json({
        ok: true,
        issue: importerIssue,
        freeBuildParentIssue: publisherFreeBuildParentIssue,
        route: clickFunnelsDraftImportApiRoute,
        idempotent: workspace.idempotent,
        paidGoLiveRequired: true,
        tenant: publicTenant(workspace.tenant),
        draft: publicDraft(draft),
        redaction: redaction(),
      });
    }

    const redirect = new URL("/imports/clickfunnels", request.url);
    redirect.searchParams.set("importDraft", draft.id);
    return NextResponse.redirect(redirect, { status: 303 });
  } catch (error) {
    const status =
      error instanceof ImporterDraftError ? error.status : error instanceof PublisherTenantError ? error.status : 503;
    const code =
      error instanceof ImporterDraftError
        ? error.code
        : error instanceof PublisherTenantError
          ? error.code
          : "CLICKFUNNELS_IMPORT_DRAFT_FAILED";
    const message = error instanceof Error ? error.message : "Unable to create that private import plan.";

    if (json) {
      return NextResponse.json(
        {
          ok: false,
          error: message,
          code,
          issue: importerIssue,
          route: clickFunnelsDraftImportApiRoute,
          redaction: redaction(),
        },
        { status },
      );
    }

    return redirectWithError(request, message);
  }
}
