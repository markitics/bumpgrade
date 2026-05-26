import { NextRequest, NextResponse } from "next/server";

import { createAuth } from "@/lib/auth";
import { normalizeOptionalName, normalizeOptInEmail } from "@/lib/audience-opt-in";
import {
  createCompetitorImportPrivateRecordSubscribers,
  prepareCompetitorImportPrivateRecordSubscriberExport,
  promoteCompetitorImportPrivateRecordSubscribersToAudience,
  recordCompetitorImportPrivateRecordSubscriberPreflight,
  reviewCompetitorImportPrivateRecord,
  updateCompetitorImportPrivateRecordExtractedField,
  type CompetitorImportPrivateRecord,
  type CompetitorImportPrivateRecordExtractedField,
  type CompetitorImportPrivateRecordReviewDecision,
  type CompetitorImportSubscriberCandidate,
  type CompetitorImportPrivateRecordSubscriberPreflightStatus,
  type DraftFunnelRecord,
} from "@/lib/funnel-drafts";
import { readImporterPreflightPayload } from "@/lib/importer-preflight";
import {
  getImporterBySlug,
  importerIssue,
  importerPrivateRecordExtractedFieldEditConfirmationText,
  importerPrivateRecordReviewActionApiRoute,
  importerPrivateRecordReviewConfirmationText,
  importerPrivateRecordReviewRoute,
  importerPrivateRecordSubscriberAudiencePromotionConfirmationText,
  importerPrivateRecordSubscriberPrivateExportConfirmationText,
  importerPrivateRecordSubscriberImportConfirmationText,
  importerPrivateRecordSubscriberPreflightConfirmationText,
  type ImporterPlatform,
} from "@/lib/importers";
import { getPublisherTenantD1OrThrow, type PublisherSessionUser } from "@/lib/publisher-tenants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RequestPayload = {
  get: (key: string) => string;
  getAll: (key: string) => string[];
  files: File[];
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

async function readPayload(request: NextRequest): Promise<RequestPayload> {
  return readImporterPreflightPayload(request);
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

function subscriberPreflightDecision(
  value: string,
): Exclude<CompetitorImportPrivateRecordSubscriberPreflightStatus, "not_recorded"> | null {
  if (value === "ready_for_import_planning" || value === "needs_cleanup") return value;
  return null;
}

function normalizedSubscriberPreflightInput(payload: RequestPayload, platform: ImporterPlatform) {
  const shared = normalizedSharedInput(payload);
  const decision = subscriberPreflightDecision(payload.get("decision").trim());
  if (!decision) {
    throw new ImporterRecordReviewError(
      "Choose ready for import planning or needs cleanup for this subscriber preflight.",
      400,
      "SUBSCRIBER_PREFLIGHT_DECISION_REQUIRED",
    );
  }

  const confirmationText = payload.get("confirmationText").trim();
  if (confirmationText !== importerPrivateRecordSubscriberPreflightConfirmationText(platform.platformName, decision)) {
    throw new ImporterRecordReviewError(
      `Confirm the ${platform.platformName} subscriber import preflight before continuing.`,
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

function splitDelimitedLine(line: string) {
  const delimiters = [",", "\t", ";"];
  const delimiter =
    delimiters
      .map((candidate) => ({ candidate, count: line.split(candidate).length }))
      .sort((left, right) => right.count - left.count)[0]?.candidate ?? ",";

  return line.split(delimiter).map((value) => value.trim().replace(/^"|"$/g, "").replace(/\s+/g, " "));
}

function firstMatchingValue(record: Record<string, string>, patterns: RegExp[]) {
  for (const [key, value] of Object.entries(record)) {
    if (patterns.some((pattern) => pattern.test(key))) return value;
  }

  return "";
}

function compactTagLabels(value: string) {
  return value
    .split(/[|,;]+/)
    .map((item) => item.trim().replace(/\s+/g, " ").slice(0, 80))
    .filter(Boolean)
    .slice(0, 20);
}

function candidateFromRecord(record: Record<string, string>) {
  const email = normalizeOptInEmail(
    firstMatchingValue(record, [/email/i, /subscriber/i, /contact/i, /customer/i]),
  );
  if (!email) return null;

  const firstName =
    normalizeOptionalName(firstMatchingValue(record, [/first.?name/i, /^name$/i, /full.?name/i])) ??
    normalizeOptionalName(firstMatchingValue(record, [/customer.?name/i, /subscriber.?name/i]));
  const sourceStatus = firstMatchingValue(record, [/status/i, /consent/i, /subscribed/i, /suppression/i]).slice(0, 80) || null;
  const tagValue = firstMatchingValue(record, [/tag/i, /segment/i, /list/i, /group/i]);

  return {
    email,
    firstName,
    sourceStatus,
    tagLabels: compactTagLabels(tagValue),
  } satisfies CompetitorImportSubscriberCandidate;
}

function candidatesFromDelimitedText(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return { contacts: [] as CompetitorImportSubscriberCandidate[], malformedContactCount: 0 };

  const headers = splitDelimitedLine(lines[0] ?? "").map((header) => header.toLowerCase());
  const hasHeader = headers.some((header) => /email|subscriber|contact|customer/.test(header));
  const contacts: CompetitorImportSubscriberCandidate[] = [];
  let malformedContactCount = 0;

  if (hasHeader) {
    for (const line of lines.slice(1)) {
      const values = splitDelimitedLine(line);
      const record = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
      const candidate = candidateFromRecord(record);
      if (candidate) contacts.push(candidate);
      else malformedContactCount += 1;
    }
  } else {
    const emailMatches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
    contacts.push(
      ...emailMatches
        .map((email) => normalizeOptInEmail(email))
        .filter((email): email is string => Boolean(email))
        .map((email) => ({ email, firstName: null, sourceStatus: null, tagLabels: [] })),
    );
    malformedContactCount += emailMatches.length ? 0 : lines.length;
  }

  return { contacts, malformedContactCount };
}

function candidatesFromJsonText(text: string) {
  const parsed = JSON.parse(text) as unknown;
  const rows = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object" ? [parsed] : [];
  const contacts: CompetitorImportSubscriberCandidate[] = [];
  let malformedContactCount = 0;

  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      malformedContactCount += 1;
      continue;
    }

    const record = Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, typeof value === "string" ? value : value == null ? "" : String(value)]),
    );
    const candidate = candidateFromRecord(record);
    if (candidate) contacts.push(candidate);
    else malformedContactCount += 1;
  }

  return { contacts, malformedContactCount };
}

async function subscriberImportCandidatesFromPayload(payload: RequestPayload) {
  const contacts: CompetitorImportSubscriberCandidate[] = [];
  let malformedContactCount = 0;
  const textInputs = [
    ...payload.getAll("subscriberImportRows"),
    ...payload.getAll("subscriberRows"),
    ...payload.getAll("exportManifest"),
    ...payload.getAll("exportFileContent"),
    ...payload.getAll("exportFileContents"),
  ].filter((value) => value.trim());

  for (const file of payload.files.slice(0, 5)) {
    const bytes = Math.min(file.size, 64_000);
    textInputs.push(await file.slice(0, bytes).text());
  }

  for (const text of textInputs) {
    const trimmed = text.trim();
    if (!trimmed) continue;

    try {
      const parsed = trimmed.startsWith("{") || trimmed.startsWith("[") ? candidatesFromJsonText(trimmed) : candidatesFromDelimitedText(trimmed);
      contacts.push(...parsed.contacts);
      malformedContactCount += parsed.malformedContactCount;
    } catch {
      const parsed = candidatesFromDelimitedText(trimmed);
      contacts.push(...parsed.contacts);
      malformedContactCount += parsed.malformedContactCount;
    }
  }

  const unique = new Map<string, CompetitorImportSubscriberCandidate>();
  for (const contact of contacts) {
    if (!unique.has(contact.email)) unique.set(contact.email, contact);
  }

  return {
    contacts: Array.from(unique.values()).slice(0, 100),
    malformedContactCount,
  };
}

async function normalizedSubscriberImportCreationInput(payload: RequestPayload, platform: ImporterPlatform) {
  const shared = normalizedSharedInput(payload);
  const confirmationText = payload.get("confirmationText").trim();
  if (confirmationText !== importerPrivateRecordSubscriberImportConfirmationText(platform.platformName)) {
    throw new ImporterRecordReviewError(
      `Confirm the ${platform.platformName} private subscriber import before continuing.`,
      400,
      "CONFIRMATION_REQUIRED",
    );
  }

  const parsed = await subscriberImportCandidatesFromPayload(payload);
  if (!parsed.contacts.length) {
    throw new ImporterRecordReviewError(
      "Upload or paste a subscriber export with at least one valid email address.",
      400,
      "SUBSCRIBER_IMPORT_ROWS_REQUIRED",
    );
  }

  return {
    ...shared,
    confirmationText,
    contacts: parsed.contacts,
    malformedContactCount: parsed.malformedContactCount,
  };
}

function normalizedSubscriberAudiencePromotionInput(payload: RequestPayload, platform: ImporterPlatform) {
  const shared = normalizedSharedInput(payload);
  const confirmationText = payload.get("confirmationText").trim();
  if (confirmationText !== importerPrivateRecordSubscriberAudiencePromotionConfirmationText(platform.platformName)) {
    throw new ImporterRecordReviewError(
      `Confirm the ${platform.platformName} audience list promotion before continuing.`,
      400,
      "CONFIRMATION_REQUIRED",
    );
  }

  return {
    ...shared,
    confirmationText,
  };
}

function normalizedSubscriberPrivateExportInput(payload: RequestPayload, platform: ImporterPlatform) {
  const shared = normalizedSharedInput(payload);
  const confirmationText = payload.get("confirmationText").trim();
  if (confirmationText !== importerPrivateRecordSubscriberPrivateExportConfirmationText(platform.platformName)) {
    throw new ImporterRecordReviewError(
      `Confirm the ${platform.platformName} private subscriber export before continuing.`,
      400,
      "CONFIRMATION_REQUIRED",
    );
  }

  return {
    ...shared,
    confirmationText,
  };
}

function csvCell(value: string | null | undefined) {
  const raw = value ?? "";
  const text = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${text.replaceAll("\"", "\"\"")}"`;
}

function subscriberExportCsv(records: Awaited<ReturnType<typeof prepareCompetitorImportPrivateRecordSubscriberExport>>["privateSubscriberRecords"]) {
  const rows = records.map((record) => [
    record.email,
    record.firstName,
    record.sourceStatus,
    record.sourceTagLabels.join("; "),
    record.status,
  ]);

  return [
    ["email", "first_name", "source_status", "source_tags", "status"],
    ...rows,
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
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
    subscriberImportDepth: record.subscriberImportDepth,
    subscriberImportPreflight: record.subscriberImportPreflight,
    subscriberImportCreation: record.subscriberImportCreation,
    subscriberAudiencePromotion: record.subscriberAudiencePromotion,
    subscriberPrivateExport: record.subscriberPrivateExport,
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
    privateSubscriberEmailsIncludedInResponse: false,
    privateSubscriberEmailsIncludedInJsonResponse: false,
    subscriberIdsIncludedInResponse: false,
    paymentCredentialsIncluded: false,
    sessionCookiesIncluded: false,
    confirmationTextStored: false,
    idempotencyKeysIncluded: false,
    actorEmailIncluded: false,
    consentEventsCreated: false,
    sequenceEnrollmentsCreated: false,
    publicPublishingEnabled: false,
    liveCheckoutEnabled: false,
    subscriberSendsEnabled: false,
    customDomainsEnabled: false,
    fulfillmentEnabled: false,
    publicExportEnabled: false,
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

    if (action === "record_subscriber_import_preflight") {
      const input = normalizedSubscriberPreflightInput(payload, platform);
      const result = await recordCompetitorImportPrivateRecordSubscriberPreflight(db, { userId: user.id, email: user.email }, {
        importerSlug: platform.slug,
        platformName: platform.platformName,
        draftId: input.draftId,
        recordId: input.recordId,
        decision: input.decision,
        idempotencyKey: `competitor-import-subscriber-preflight:${platform.slug}:${user.id}:${input.idempotencyKey}`,
      });

      if (json) {
        return NextResponse.json({
          ok: true,
          issue: importerIssue,
          route,
          platform: publicPlatform(platform),
          draft: publicDraft(result.draft),
          record: publicRecord(result.record),
          preflight: result.preflight,
          previousPreflight: result.previousPreflight,
          idempotent: result.idempotent,
          action: "record_subscriber_import_preflight",
          goLiveEffects: result.goLiveEffects,
          redaction: {
            ...result.redaction,
            ...result.preflight.redaction,
            ...redaction(),
          },
        });
      }

      const redirect = new URL(importerPrivateRecordReviewRoute(platform.slug, result.draft.id), request.url);
      redirect.searchParams.set("subscriberPreflight", result.preflight.status);
      redirect.searchParams.set("recordId", result.record.id);
      return NextResponse.redirect(redirect, { status: 303 });
    }

    if (action === "create_subscriber_import_records") {
      const input = await normalizedSubscriberImportCreationInput(payload, platform);
      const result = await createCompetitorImportPrivateRecordSubscribers(db, { userId: user.id, email: user.email }, {
        importerSlug: platform.slug,
        platformName: platform.platformName,
        draftId: input.draftId,
        recordId: input.recordId,
        contacts: input.contacts,
        malformedContactCount: input.malformedContactCount,
        idempotencyKey: `competitor-import-subscriber-records:${platform.slug}:${user.id}:${input.idempotencyKey}`,
      });

      if (json) {
        return NextResponse.json({
          ok: true,
          issue: importerIssue,
          route,
          platform: publicPlatform(platform),
          draft: publicDraft(result.draft),
          record: publicRecord(result.record),
          creation: result.creation,
          previousCreation: result.previousCreation,
          idempotent: result.idempotent,
          action: "create_subscriber_import_records",
          goLiveEffects: result.goLiveEffects,
          redaction: {
            ...result.redaction,
            ...result.creation.redaction,
            ...redaction(),
          },
        });
      }

      const redirect = new URL(importerPrivateRecordReviewRoute(platform.slug, result.draft.id), request.url);
      redirect.searchParams.set("subscriberImport", result.creation.status);
      redirect.searchParams.set("recordId", result.record.id);
      return NextResponse.redirect(redirect, { status: 303 });
    }

    if (action === "promote_subscriber_import_records_to_audience") {
      const input = normalizedSubscriberAudiencePromotionInput(payload, platform);
      const result = await promoteCompetitorImportPrivateRecordSubscribersToAudience(db, { userId: user.id, email: user.email }, {
        importerSlug: platform.slug,
        platformName: platform.platformName,
        draftId: input.draftId,
        recordId: input.recordId,
        idempotencyKey: `competitor-import-subscriber-audience-promotion:${platform.slug}:${user.id}:${input.idempotencyKey}`,
      });

      if (json) {
        return NextResponse.json({
          ok: true,
          issue: importerIssue,
          route,
          platform: publicPlatform(platform),
          draft: publicDraft(result.draft),
          record: publicRecord(result.record),
          promotion: result.promotion,
          previousPromotion: result.previousPromotion,
          idempotent: result.idempotent,
          action: "promote_subscriber_import_records_to_audience",
          goLiveEffects: result.goLiveEffects,
          redaction: {
            ...result.redaction,
            ...result.promotion.redaction,
            ...redaction(),
          },
        });
      }

      const redirect = new URL(importerPrivateRecordReviewRoute(platform.slug, result.draft.id), request.url);
      redirect.searchParams.set("subscriberAudiencePromotion", result.promotion.status);
      redirect.searchParams.set("recordId", result.record.id);
      return NextResponse.redirect(redirect, { status: 303 });
    }

    if (action === "export_private_subscriber_records") {
      const input = normalizedSubscriberPrivateExportInput(payload, platform);
      const result = await prepareCompetitorImportPrivateRecordSubscriberExport(db, { userId: user.id, email: user.email }, {
        importerSlug: platform.slug,
        platformName: platform.platformName,
        draftId: input.draftId,
        recordId: input.recordId,
        idempotencyKey: `competitor-import-private-subscriber-export:${platform.slug}:${user.id}:${input.idempotencyKey}`,
      });

      if (json) {
        return NextResponse.json({
          ok: true,
          issue: importerIssue,
          route,
          platform: publicPlatform(platform),
          draft: publicDraft(result.draft),
          record: publicRecord(result.record),
          subscriberExport: result.subscriberExport,
          previousSubscriberExport: result.previousSubscriberExport,
          idempotent: result.idempotent,
          action: "export_private_subscriber_records",
          goLiveEffects: result.goLiveEffects,
          redaction: {
            ...result.redaction,
            ...result.subscriberExport.redaction,
            ...redaction(),
          },
        });
      }

      const csv = subscriberExportCsv(result.privateSubscriberRecords);
      return new NextResponse(`${csv}\n`, {
        status: 200,
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${result.subscriberExport.exportFileName ?? "private-subscriber-export.csv"}"`,
          "cache-control": "private, no-store",
        },
      });
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
