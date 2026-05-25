import { NextRequest, NextResponse } from "next/server";

import { createAuth } from "@/lib/auth";
import {
  rollbackCompetitorImportedDraftFunnel,
  type CompetitorImportedDraftRollbackResult,
  type DraftFunnelRecord,
} from "@/lib/funnel-drafts";
import {
  getImporterBySlug,
  importerDraftRollbackApiRoute,
  importerDraftRollbackConfirmationText,
  importerIssue,
  type ImporterPlatform,
} from "@/lib/importers";
import { getPublisherTenantD1OrThrow, type PublisherSessionUser } from "@/lib/publisher-tenants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RequestPayload = {
  get: (key: string) => string;
};

type ImporterRollbackRouteContext = {
  params: Promise<{ slug: string }>;
};

class ImporterRollbackError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ImporterRollbackError";
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

function normalizedInput(payload: RequestPayload, platform: ImporterPlatform) {
  const draftId = payload.get("draftId").trim();
  if (!draftId) {
    throw new ImporterRollbackError("Choose the private import plan to archive.", 400, "DRAFT_ID_REQUIRED");
  }

  const expectedRevisionId = payload.get("expectedRevisionId").trim();
  if (!expectedRevisionId) {
    throw new ImporterRollbackError("Refresh this import plan before archiving it.", 400, "REVISION_REQUIRED");
  }

  const confirmationText = payload.get("confirmationText").trim();
  if (confirmationText !== importerDraftRollbackConfirmationText(platform.platformName)) {
    throw new ImporterRollbackError(
      `Confirm the ${platform.platformName} private import archive before continuing.`,
      400,
      "CONFIRMATION_REQUIRED",
    );
  }

  const idempotencyKey = payload.get("idempotencyKey").trim();
  if (!idempotencyKey) {
    throw new ImporterRollbackError("Refresh this page before archiving the private import plan.", 400, "IDEMPOTENCY_REQUIRED");
  }

  return {
    draftId,
    expectedRevisionId,
    confirmationText,
    idempotencyKey,
  };
}

function publicPlatform(platform: ImporterPlatform) {
  return {
    id: platform.id,
    slug: platform.slug,
    platformName: platform.platformName,
    route: platform.route,
  };
}

function publicDraft(draft: DraftFunnelRecord) {
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

function publicRollback(result: CompetitorImportedDraftRollbackResult) {
  return {
    action: "archive_private_import_plan",
    previousStatus: result.previousStatus,
    previousRevisionId: result.previousRevisionId,
    previousPreviewRoute: result.previousPreviewRoute,
    idempotent: result.idempotent,
    restartsAvailable: result.restartsAvailable,
    deletedDraftRows: result.deletedDraftRows,
    deletedStepRows: result.deletedStepRows,
    deletedAuditRows: result.deletedAuditRows,
    publicPublishingEnabled: result.publicPublishingEnabled,
    liveCheckoutEnabled: result.liveCheckoutEnabled,
    subscriberSendsEnabled: result.subscriberSendsEnabled,
    customDomainsEnabled: result.customDomainsEnabled,
    fulfillmentEnabled: result.fulfillmentEnabled,
    rawSourceEchoed: result.rawSourceEchoed,
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
    deletedDraftRows: false,
    deletedStepRows: false,
    deletedAuditRows: false,
  };
}

function redirectWithError(request: NextRequest, platform: ImporterPlatform | null, message: string) {
  const redirect = new URL(platform?.route ?? "/imports", request.url);
  redirect.searchParams.set("importError", message);
  return NextResponse.redirect(redirect, { status: 303 });
}

export async function POST(request: NextRequest, { params }: ImporterRollbackRouteContext) {
  const payload = await readPayload(request);
  const json = wantsJson(request, payload);
  const { slug } = await params;
  const platform = getImporterBySlug(slug);
  const route = importerDraftRollbackApiRoute(slug);

  if (!platform) {
    const message = "Choose a supported importer path before archiving a private import plan.";
    if (json) {
      return NextResponse.json(
        {
          ok: false,
          error: message,
          code: "IMPORTER_NOT_FOUND",
          issue: importerIssue,
          route,
          redaction: redaction(),
        },
        { status: 404 },
      );
    }

    return redirectWithError(request, null, message);
  }

  const user = await getSessionUser(request.headers);

  if (!user) {
    if (json) {
      return NextResponse.json(
        {
          ok: false,
          error: "Publisher session required.",
          code: "PUBLISHER_SESSION_REQUIRED",
          issue: importerIssue,
          route,
          platform: publicPlatform(platform),
          redaction: redaction(),
        },
        { status: 401 },
      );
    }

    const login = new URL("/login", request.url);
    login.searchParams.set("callbackURL", platform.route);
    return NextResponse.redirect(login, { status: 303 });
  }

  try {
    if (!user.emailVerified) {
      throw new ImporterRollbackError("Confirm your email before archiving a private import plan.", 403, "EMAIL_UNVERIFIED");
    }

    const input = normalizedInput(payload, platform);
    const db = await getPublisherTenantD1OrThrow();
    const rollback = await rollbackCompetitorImportedDraftFunnel(db, { userId: user.id, email: user.email }, {
      ...input,
      importerSlug: platform.slug,
      platformName: platform.platformName,
      idempotencyKey: `competitor-import-rollback:${platform.slug}:${user.id}:${input.idempotencyKey}`,
    });

    if (json) {
      return NextResponse.json({
        ok: true,
        issue: importerIssue,
        route,
        platform: publicPlatform(platform),
        draft: publicDraft(rollback.draft),
        rollback: publicRollback(rollback),
        redaction: redaction(),
      });
    }

    const redirect = new URL(platform.route, request.url);
    redirect.searchParams.set("importRollback", "archived");
    redirect.searchParams.set("importDraft", rollback.draft.id);
    return NextResponse.redirect(redirect, { status: 303 });
  } catch (error) {
    const status = error instanceof ImporterRollbackError ? error.status : 400;
    const code = error instanceof ImporterRollbackError ? error.code : "COMPETITOR_IMPORT_ROLLBACK_FAILED";
    const message = error instanceof Error ? error.message : "Unable to archive that private import plan.";

    if (json) {
      return NextResponse.json(
        {
          ok: false,
          error: message,
          code,
          issue: importerIssue,
          route,
          platform: publicPlatform(platform),
          redaction: redaction(),
        },
        { status },
      );
    }

    return redirectWithError(request, platform, message);
  }
}
