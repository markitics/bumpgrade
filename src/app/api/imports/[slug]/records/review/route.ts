import { NextRequest, NextResponse } from "next/server";

import { createAuth } from "@/lib/auth";
import {
  reviewCompetitorImportPrivateRecord,
  updateCompetitorImportPrivateRecordExtractedField,
  type CompetitorImportPrivateRecord,
  type CompetitorImportPrivateRecordExtractedField,
  type CompetitorImportPrivateRecordReviewDecision,
  type DraftFunnelRecord,
} from "@/lib/funnel-drafts";
import {
  getImporterBySlug,
  importerIssue,
  importerPrivateRecordExtractedFieldEditConfirmationText,
  importerPrivateRecordReviewActionApiRoute,
  importerPrivateRecordReviewConfirmationText,
  importerPrivateRecordReviewRoute,
  type ImporterPlatform,
} from "@/lib/importers";
import { getPublisherTenantD1OrThrow, type PublisherSessionUser } from "@/lib/publisher-tenants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RequestPayload = {
  get: (key: string) => string;
};

type ImporterRecordReviewRouteContext = {
  params: Promise<{ slug: string }>;
};

class ImporterRecordReviewError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "ImporterRecordReviewError";
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

function reviewDecision(value: string): Exclude<CompetitorImportPrivateRecordReviewDecision, "pending_review"> | null {
  if (value === "ready" || value === "needs_cleanup") return value;
  return null;
}

function normalizedSharedInput(payload: RequestPayload) {
  const draftId = payload.get("draftId").trim();
  if (!draftId) {
    throw new ImporterRecordReviewError("Choose the private import plan before reviewing a record.", 400, "DRAFT_ID_REQUIRED");
  }

  const recordId = payload.get("recordId").trim();
  if (!recordId) {
    throw new ImporterRecordReviewError("Choose the private import record to review.", 400, "RECORD_ID_REQUIRED");
  }

  const idempotencyKey = payload.get("idempotencyKey").trim();
  if (!idempotencyKey) {
    throw new ImporterRecordReviewError("Refresh this page before reviewing the private import record.", 400, "IDEMPOTENCY_REQUIRED");
  }

  return {
    draftId,
    recordId,
    idempotencyKey,
  };
}

function normalizedReviewInput(payload: RequestPayload, platform: ImporterPlatform) {
  const shared = normalizedSharedInput(payload);
  const decision = reviewDecision(payload.get("decision").trim());
  if (!decision) {
    throw new ImporterRecordReviewError("Choose ready or needs cleanup for this private import record.", 400, "DECISION_REQUIRED");
  }

  const confirmationText = payload.get("confirmationText").trim();
  if (confirmationText !== importerPrivateRecordReviewConfirmationText(platform.platformName, decision)) {
    throw new ImporterRecordReviewError(
      `Confirm the ${platform.platformName} private import record review before continuing.`,
      400,
      "CONFIRMATION_REQUIRED",
    );
  }

  return {
    ...shared,
    decision,
    confirmationText,
  };
}

function extractedFieldStatus(value: string): CompetitorImportPrivateRecordExtractedField["status"] | null {
  if (value === "ready_for_review" || value === "needs_context") return value;
  return null;
}

function normalizedFieldEditInput(payload: RequestPayload, platform: ImporterPlatform) {
  const shared = normalizedSharedInput(payload);
  const fieldId = payload.get("fieldId").trim();
  if (!fieldId) {
    throw new ImporterRecordReviewError("Choose the prepared field to edit.", 400, "FIELD_ID_REQUIRED");
  }

  const label = payload.get("fieldLabel").trim();
  if (!label) {
    throw new ImporterRecordReviewError("Name the Bumpgrade field before saving.", 400, "FIELD_LABEL_REQUIRED");
  }

  const status = extractedFieldStatus(payload.get("fieldStatus").trim());
  if (!status) {
    throw new ImporterRecordReviewError("Choose whether this prepared field is ready or needs context.", 400, "FIELD_STATUS_REQUIRED");
  }

  const reviewPrompt = payload.get("fieldReviewPrompt").trim();
  if (!reviewPrompt) {
    throw new ImporterRecordReviewError("Add a review prompt before saving this field.", 400, "FIELD_PROMPT_REQUIRED");
  }

  const confirmationText = payload.get("confirmationText").trim();
  if (confirmationText !== importerPrivateRecordExtractedFieldEditConfirmationText(platform.platformName)) {
    throw new ImporterRecordReviewError(
      `Confirm the ${platform.platformName} private import field edit before continuing.`,
      400,
      "CONFIRMATION_REQUIRED",
    );
  }

  return {
    ...shared,
    fieldId,
    label,
    status,
    reviewPrompt,
    confirmationText,
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

function publicRecord(record: CompetitorImportPrivateRecord) {
  return {
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
    extractedFields: record.extractedFields,
    reviewDecision: record.reviewDecision,
    reviewDecisionAt: record.reviewDecisionAt,
    reviewDecisionSource: record.reviewDecisionSource,
    reviewAudit: record.reviewAudit,
    goLiveEffects: record.goLiveEffects,
    redaction: record.redaction,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function redaction() {
  return {
    rawExportFilesIncluded: false,
    rawFileNamesEchoed: false,
    rawRowsEchoed: false,
    rawTextEchoed: false,
    rawSourceEchoed: false,
    customerRowsIncluded: false,
    privateEmailsIncluded: false,
    paymentCredentialsIncluded: false,
    sessionCookiesIncluded: false,
    confirmationTextStored: false,
    idempotencyKeysIncluded: false,
    actorEmailIncluded: false,
    publicPublishingEnabled: false,
    liveCheckoutEnabled: false,
    subscriberSendsEnabled: false,
    customDomainsEnabled: false,
    fulfillmentEnabled: false,
  };
}

function redirectWithError(request: NextRequest, platform: ImporterPlatform | null, draftId: string, message: string) {
  const redirect = new URL(
    platform ? importerPrivateRecordReviewRoute(platform.slug, draftId || undefined) : "/imports",
    request.url,
  );
  redirect.searchParams.set("recordReviewError", message);
  return NextResponse.redirect(redirect, { status: 303 });
}

export async function POST(request: NextRequest, { params }: ImporterRecordReviewRouteContext) {
  const payload = await readPayload(request);
  const json = wantsJson(request, payload);
  const { slug } = await params;
  const platform = getImporterBySlug(slug);
  const route = importerPrivateRecordReviewActionApiRoute(slug);

  if (!platform) {
    const message = "Choose a supported importer path before reviewing a private import record.";
    if (json) {
      return NextResponse.json({ ok: false, error: message, code: "IMPORTER_NOT_FOUND", issue: importerIssue, route, redaction: redaction() }, { status: 404 });
    }

    return redirectWithError(request, null, "", message);
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
    login.searchParams.set("callbackURL", importerPrivateRecordReviewRoute(platform.slug, payload.get("draftId").trim() || undefined));
    return NextResponse.redirect(login, { status: 303 });
  }

  try {
    if (!user.emailVerified) {
      throw new ImporterRecordReviewError("Confirm your email before reviewing private importer records.", 403, "EMAIL_UNVERIFIED");
    }

    const db = await getPublisherTenantD1OrThrow();
    const action = payload.get("action").trim() || "review_private_import_record";

    if (action === "edit_extracted_field") {
      const input = normalizedFieldEditInput(payload, platform);
      const result = await updateCompetitorImportPrivateRecordExtractedField(db, { userId: user.id, email: user.email }, {
        importerSlug: platform.slug,
        platformName: platform.platformName,
        draftId: input.draftId,
        recordId: input.recordId,
        fieldId: input.fieldId,
        label: input.label,
        status: input.status,
        reviewPrompt: input.reviewPrompt,
        idempotencyKey: `competitor-import-extracted-field-edit:${platform.slug}:${user.id}:${input.idempotencyKey}`,
      });

      if (json) {
        return NextResponse.json({
          ok: true,
          issue: importerIssue,
          route,
          platform: publicPlatform(platform),
          draft: publicDraft(result.draft),
          record: publicRecord(result.record),
          field: result.field,
          previousField: result.previousField,
          idempotent: result.idempotent,
          action: "edit_private_import_record_field",
          goLiveEffects: result.goLiveEffects,
          redaction: {
            ...result.redaction,
            ...redaction(),
          },
        });
      }

      const redirect = new URL(importerPrivateRecordReviewRoute(platform.slug, result.draft.id), request.url);
      redirect.searchParams.set("recordReview", "field_saved");
      redirect.searchParams.set("recordId", result.record.id);
      redirect.searchParams.set("fieldId", result.field.id);
      return NextResponse.redirect(redirect, { status: 303 });
    }

    if (action !== "review_private_import_record") {
      throw new ImporterRecordReviewError("Choose a supported private import record action.", 400, "ACTION_REQUIRED");
    }

    const input = normalizedReviewInput(payload, platform);
    const result = await reviewCompetitorImportPrivateRecord(db, { userId: user.id, email: user.email }, {
      importerSlug: platform.slug,
      platformName: platform.platformName,
      draftId: input.draftId,
      recordId: input.recordId,
      decision: input.decision,
      idempotencyKey: `competitor-import-record-review:${platform.slug}:${user.id}:${input.idempotencyKey}`,
    });

    if (json) {
      return NextResponse.json({
        ok: true,
        issue: importerIssue,
        route,
        platform: publicPlatform(platform),
        draft: publicDraft(result.draft),
        record: publicRecord(result.record),
        previousDecision: result.previousDecision,
        idempotent: result.idempotent,
        action: "review_private_import_record",
        goLiveEffects: result.goLiveEffects,
        redaction: {
          ...result.redaction,
          ...redaction(),
        },
      });
    }

    const redirect = new URL(importerPrivateRecordReviewRoute(platform.slug, result.draft.id), request.url);
    redirect.searchParams.set("recordReview", result.record.reviewDecision);
    redirect.searchParams.set("recordId", result.record.id);
    return NextResponse.redirect(redirect, { status: 303 });
  } catch (error) {
    const status = error instanceof ImporterRecordReviewError ? error.status : 400;
    const code = error instanceof ImporterRecordReviewError ? error.code : "IMPORT_RECORD_REVIEW_FAILED";
    const message = error instanceof Error ? error.message : "Unable to review that private import record.";

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

    return redirectWithError(request, platform, payload.get("draftId").trim(), message);
  }
}
