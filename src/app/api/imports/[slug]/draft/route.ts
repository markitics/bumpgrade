import { NextRequest, NextResponse } from "next/server";

import { createAuth } from "@/lib/auth";
import {
  createCompetitorImportedDraftFunnel,
  type CompetitorImportReviewMetadata,
  type CompetitorImportPrivateRecord,
  type DraftFunnelRecord,
  type ImporterDuplicateReview,
} from "@/lib/funnel-drafts";
import {
  exportFileAnalysisFromPayload,
  normalizeImporterSourceFileNames,
  platformExportMatches,
  readImporterPreflightPayload,
  type ExportFileAnalysis,
  type ImporterPlatformExportMatch,
  type ImporterPreflightPayload,
} from "@/lib/importer-preflight";
import {
  getImporterBySlug,
  importerDraftImportApiRoute,
  importerDraftImportConfirmationText,
  importerIssue,
  type ImporterPlatform,
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

type ImporterDraftRouteContext = {
  params: Promise<{ slug: string }>;
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

function wantsJson(request: NextRequest, payload: ImporterPreflightPayload) {
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

function normalizedInput(payload: ImporterPreflightPayload, platform: ImporterPlatform) {
  const confirmationText = payload.get("confirmationText").trim();
  if (confirmationText !== importerDraftImportConfirmationText(platform.platformName)) {
    throw new ImporterDraftError(
      `Confirm the ${platform.platformName} private import plan before continuing.`,
      400,
      "CONFIRMATION_REQUIRED",
    );
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
  const sourceFileNames = normalizeImporterSourceFileNames(payload);
  const pageCopy = payload.get("pageCopy").trim();
  const followUpNotes = payload.get("followUpNotes").trim();
  if (!sourceUrl && sourceFileNames.length === 0 && !pageCopy && !followUpNotes) {
    throw new ImporterDraftError(
      "Add a source URL, export file name, pasted copy, or follow-up notes before creating the private import plan.",
      400,
      "SOURCE_MATERIAL_REQUIRED",
    );
  }

  return {
    offerTitle: offerTitle.slice(0, 120),
    audience: payload.get("audience").trim().slice(0, 180),
    launchGoal: payload.get("launchGoal").trim().slice(0, 300),
    sourceUrls: sourceUrl ? [sourceUrl] : [],
    sourceFileNames,
    pageCopy: pageCopy.slice(0, 2_000),
    followUpNotes: followUpNotes.slice(0, 1_000),
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

function publicDuplicateReview(review: ImporterDuplicateReview) {
  return {
    status: review.status,
    checkedFields: review.checkedFields,
    matchedFields: review.matchedFields,
    createsNewDraft: review.createsNewDraft,
    reusesExistingDraft: review.reusesExistingDraft,
    sourceUrlCompared: review.sourceUrlCompared,
    sourceFileNameCompared: review.sourceFileNameCompared,
    rawSourceEchoed: review.rawSourceEchoed,
  };
}

function publicImportRecords(records: CompetitorImportPrivateRecord[]) {
  return records.map((record) => ({
    id: record.id,
    responseField: record.responseField,
    privateRecordType: record.privateRecordType,
    kind: record.kind,
    status: record.status,
    title: record.title,
    summary: record.summary,
    importerPlatformId: record.importerPlatformId,
    importerSlug: record.importerSlug,
    platformName: record.platformName,
    draftFunnelId: record.draftFunnelId,
    tenantId: record.tenantId,
    draftEntities: record.draftEntities,
    sourceChecklistItemIds: record.sourceChecklistItemIds,
    recognizedPlatformExportMatchIds: record.recognizedPlatformExportMatchIds,
    matchedHeaderLabels: record.matchedHeaderLabels,
    matchedSignalLabels: record.matchedSignalLabels,
    sourceUrlCount: record.sourceUrlCount,
    sourceFileNameCount: record.sourceFileNameCount,
    exportFileCount: record.exportFileCount,
    parsedExportFileCount: record.parsedExportFileCount,
    recordConfidence: record.recordConfidence,
    goLiveEffects: record.goLiveEffects,
    redaction: record.redaction,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }));
}

function publicImportReview(exportFileAnalysis: ExportFileAnalysis, exportMatches: ImporterPlatformExportMatch[]): CompetitorImportReviewMetadata {
  return {
    responseField: "importReview",
    privateDraftMetadataStored: false,
    privateDraftMetadataReason: "pending_private_draft_create",
    exportFileAnalysis,
    platformExportMatches: exportMatches,
    recognizedPlatformExportMatchIds: exportMatches.filter((match) => match.status === "recognized").map((match) => match.id),
    goLiveEffects: {
      publicPublishingEnabled: false,
      liveCheckoutEnabled: false,
      subscriberSendsEnabled: false,
      customDomainsEnabled: false,
      fulfillmentEnabled: false,
    },
    redaction: {
      rawExportFilesIncluded: false,
      rawFileNamesEchoed: false,
      rawRowsEchoed: false,
      rawTextEchoed: false,
      rawSourceEchoed: false,
      rawPastedMaterialIncludedInResponse: false,
      customerRowsIncluded: false,
      privateEmailsIncluded: false,
      paymentCredentialsIncluded: false,
      sessionCookiesIncluded: false,
    },
  };
}

function redaction() {
  return {
    rawExportFilesIncluded: false,
    rawFileNamesEchoed: false,
    rawRowsEchoed: false,
    rawTextEchoed: false,
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

function redirectWithError(request: NextRequest, platform: ImporterPlatform | null, message: string) {
  const redirect = new URL(platform?.route ?? "/imports", request.url);
  redirect.searchParams.set("importError", message);
  return NextResponse.redirect(redirect, { status: 303 });
}

export async function POST(request: NextRequest, { params }: ImporterDraftRouteContext) {
  const payload = await readImporterPreflightPayload(request);
  const json = wantsJson(request, payload);
  const { slug } = await params;
  const platform = getImporterBySlug(slug);
  const route = importerDraftImportApiRoute(slug);

  if (!platform) {
    const message = "Choose a supported importer path before creating a private import plan.";
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
      throw new ImporterDraftError("Confirm your email before creating a private import plan.", 403, "EMAIL_UNVERIFIED");
    }

    const input = normalizedInput(payload, platform);
    const exportFileAnalysis = await exportFileAnalysisFromPayload(payload);
    const exportMatches = platformExportMatches(platform, exportFileAnalysis);
    const importReview = publicImportReview(exportFileAnalysis, exportMatches);
    const db = await getPublisherTenantD1OrThrow();
    const workspace = await createFreeBuildWorkspace(db, user, {
      confirmationText: publisherFreeBuildWorkspaceConfirmationText,
      idempotencyKey: `competitor-import-workspace:${platform.slug}:${input.idempotencyKey}`,
    });
    const draftResult = await createCompetitorImportedDraftFunnel(db, { userId: user.id, email: user.email }, {
      ...input,
      importerSlug: platform.slug,
      platformName: platform.platformName,
      importReview,
      idempotencyKey: `competitor-import-draft:${platform.slug}:${input.idempotencyKey}`,
      tenantId: workspace.tenant.id,
    });

    if (json) {
      return NextResponse.json({
        ok: true,
        issue: importerIssue,
        freeBuildParentIssue: publisherFreeBuildParentIssue,
        route,
        platform: publicPlatform(platform),
        idempotent: workspace.idempotent || draftResult.duplicateReview.status === "idempotent_replay",
        paidGoLiveRequired: true,
        tenant: publicTenant(workspace.tenant),
        draft: publicDraft(draftResult.draft),
        duplicateReview: publicDuplicateReview(draftResult.duplicateReview),
        importReview: draftResult.importReview,
        importRecords: publicImportRecords(draftResult.importRecords),
        redaction: redaction(),
      });
    }

    const redirect = new URL(platform.route, request.url);
    redirect.searchParams.set("importDraft", draftResult.draft.id);
    redirect.searchParams.set("importRevision", draftResult.draft.revisionId);
    redirect.searchParams.set("duplicateReview", draftResult.duplicateReview.status);
    if (draftResult.importReview?.privateDraftMetadataStored) {
      redirect.searchParams.set("importReview", "saved");
    }
    if (draftResult.importRecords.length > 0) {
      redirect.searchParams.set("importRecords", "saved");
    }
    return NextResponse.redirect(redirect, { status: 303 });
  } catch (error) {
    const status =
      error instanceof ImporterDraftError ? error.status : error instanceof PublisherTenantError ? error.status : 503;
    const code =
      error instanceof ImporterDraftError
        ? error.code
        : error instanceof PublisherTenantError
          ? error.code
          : "COMPETITOR_IMPORT_DRAFT_FAILED";
    const message = error instanceof Error ? error.message : "Unable to create that private import plan.";

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
