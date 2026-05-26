import { NextRequest, NextResponse } from "next/server";

import {
  getImporterBySlug,
  importerDraftPreviewApiRoute,
  importerIssue,
  importerPreflightSignalLabels,
  sourceChecklistPreflightSignals,
  type ImporterPreflightSignal,
  type ImporterPlatform,
} from "@/lib/importers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RequestPayload = {
  get: (key: string) => string;
  getAll: (key: string) => string[];
};

type ImporterPreviewRouteContext = {
  params: Promise<{ slug: string }>;
};

function stringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

async function readPayload(request: NextRequest): Promise<RequestPayload> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    const values = new Map<string, string[]>();

    if (body && typeof body === "object" && !Array.isArray(body)) {
      for (const [key, value] of Object.entries(body)) {
        if (Array.isArray(value)) {
          const stringified = value.map(stringValue).filter(Boolean);
          if (stringified.length) values.set(key, stringified);
          continue;
        }

        const stringified = stringValue(value);
        if (stringified) values.set(key, [stringified]);
      }
    }

    return {
      get: (key) => values.get(key)?.[0] ?? "",
      getAll: (key) => values.get(key) ?? [],
    };
  }

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return {
      get: (key) => {
        const value = formData.get(key);
        return typeof value === "string" ? value : "";
      },
      getAll: (key) => formData.getAll(key).filter((value): value is string => typeof value === "string"),
    };
  }

  return { get: () => "", getAll: () => [] };
}

function normalizeSourceFileNames(payload: RequestPayload) {
  const rawValues = [
    ...payload.getAll("sourceFileNames"),
    ...payload.getAll("sourceFileName"),
    ...payload.getAll("exportFileNames"),
    ...payload.getAll("exportFileName"),
  ];
  const names = rawValues
    .flatMap((value) => value.split(/[\n,]+/))
    .map((value) => value.trim().replace(/\\/g, "/").split("/").filter(Boolean).at(-1) ?? "")
    .map((value) => value.replace(/\s+/g, " ").slice(0, 240))
    .filter(Boolean);

  return Array.from(new Set(names)).slice(0, 20);
}

function hasUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function redaction() {
  return {
    rawExportFilesIncluded: false,
    exportFileNamesEchoed: false,
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
    persistsRecords: false,
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

function signalList(input: {
  sourceUrlProvided: boolean;
  sourceFileNameCount: number;
  pageCopyProvided: boolean;
  followUpNotesProvided: boolean;
  launchGoalProvided: boolean;
  audienceProvided: boolean;
}) {
  const signals: string[] = [];
  if (input.sourceUrlProvided) signals.push("public source URL");
  if (input.sourceFileNameCount > 0) signals.push("export file names");
  if (input.pageCopyProvided) signals.push("pasted page or offer copy");
  if (input.followUpNotesProvided) signals.push("follow-up notes");
  if (input.launchGoalProvided) signals.push("launch goal");
  if (input.audienceProvided) signals.push("audience context");
  return signals;
}

function areaStatus(areaEntities: string[], inputSummary: ReturnType<typeof inputSummaryFromPayload>) {
  const hasAnySignal = Object.entries(inputSummary).some(([key, value]) => key !== "rawSourceEchoed" && Boolean(value));
  if (!hasAnySignal) return "needs_source";
  if (areaEntities.includes("draft_audience_import") || areaEntities.includes("draft_sequence_outline")) {
    return inputSummary.followUpNotesProvided ||
      inputSummary.pageCopyProvided ||
      inputSummary.sourceFileNameCount > 0 ||
      inputSummary.audienceProvided
      ? "ready_to_review"
      : "needs_more_context";
  }
  if (areaEntities.includes("draft_checkout_offer") || areaEntities.includes("draft_product_catalog")) {
    return inputSummary.pageCopyProvided ||
      inputSummary.sourceFileNameCount > 0 ||
      inputSummary.sourceUrlProvided ||
      inputSummary.launchGoalProvided
      ? "ready_to_review"
      : "needs_more_context";
  }
  return inputSummary.sourceUrlProvided || inputSummary.pageCopyProvided || inputSummary.sourceFileNameCount > 0
    ? "ready_to_review"
    : "needs_more_context";
}

function inputSummaryFromPayload(payload: RequestPayload) {
  const sourceFileNames = normalizeSourceFileNames(payload);

  return {
    sourceUrlProvided: hasUrl(payload.get("sourceUrl")),
    sourceFileNameCount: sourceFileNames.length,
    pageCopyProvided: payload.get("pageCopy").trim().length > 0,
    followUpNotesProvided: payload.get("followUpNotes").trim().length > 0,
    launchGoalProvided: payload.get("launchGoal").trim().length > 0,
    audienceProvided: payload.get("audience").trim().length > 0,
    rawSourceEchoed: false,
  };
}

function providedSignalMap(inputSummary: ReturnType<typeof inputSummaryFromPayload>): Record<ImporterPreflightSignal, boolean> {
  return {
    source_url: inputSummary.sourceUrlProvided,
    export_file_name: inputSummary.sourceFileNameCount > 0,
    page_or_offer_copy: inputSummary.pageCopyProvided,
    follow_up_notes: inputSummary.followUpNotesProvided,
    launch_goal: inputSummary.launchGoalProvided,
    audience_context: inputSummary.audienceProvided,
  };
}

function checklistStatus(signals: ImporterPreflightSignal[], providedSignals: Record<ImporterPreflightSignal, boolean>) {
  const matchedSignals = signals.filter((signal) => providedSignals[signal]);
  const anySourceProvided = Object.values(providedSignals).some(Boolean);

  if (matchedSignals.length > 0) return "ready_to_review";
  if (anySourceProvided) return "needs_more_context";
  return "needs_source";
}

function sourceChecklistReview(platform: ImporterPlatform, inputSummary: ReturnType<typeof inputSummaryFromPayload>) {
  const providedSignals = providedSignalMap(inputSummary);

  return platform.sourceChecklist.map((item) => {
    const signals = sourceChecklistPreflightSignals(item);
    const matchedSignals = signals.filter((signal) => providedSignals[signal]);
    const missingSignals = signals.filter((signal) => !providedSignals[signal]);

    return {
      id: item.id,
      label: item.label,
      status: checklistStatus(signals, providedSignals),
      matchedSignals: matchedSignals.map((signal) => importerPreflightSignalLabels[signal]),
      missingSignals: missingSignals.map((signal) => importerPreflightSignalLabels[signal]),
      usesItFor: item.bumpgradeUsesItFor,
      reviewPrompt: item.reviewBeforePrivatePlan,
      rawSourceEchoed: false,
    };
  });
}

function draftStepPreview(platform: ImporterPlatform) {
  return platform.importableAreas.slice(0, 3).map((area) => ({
    id: `${area.id}-review-step`,
    label: `${area.label} review`,
    prepares: [
      area.description,
      ...area.draftEntities.map((entity) => entity.replace(/^draft_/, "").replaceAll("_", " ")),
    ].slice(0, 4),
  }));
}

function reviewMap(platform: ImporterPlatform, payload: RequestPayload) {
  const offerTitle = payload.get("offerTitle").trim().slice(0, 120);
  const inputSummary = inputSummaryFromPayload(payload);
  const signals = signalList(inputSummary);

  return {
    title: offerTitle || `${platform.platformName} import plan`,
    status: signals.length > 0 ? "ready_for_private_plan" : "needs_source_material",
    writesRecords: false,
    paidGoLiveRequired: true,
    inputSummary,
    sourceChecklistReview: sourceChecklistReview(platform, inputSummary),
    detectedAreas: platform.importableAreas.map((area) => ({
      id: area.id,
      label: area.label,
      status: areaStatus(area.draftEntities, inputSummary),
      draftEntities: area.draftEntities,
    })),
    draftStepPreview: draftStepPreview(platform),
    safetyGates: [
      "Review map does not create records.",
      "Private draft creation requires a verified publisher session.",
      "Go-live actions stay off until paid or explicitly approved.",
      "Responses do not echo pasted source material or export file names.",
      "Source-guide readiness uses signal labels only, not raw source values.",
    ],
  };
}

export async function POST(request: NextRequest, { params }: ImporterPreviewRouteContext) {
  const { slug } = await params;
  const route = importerDraftPreviewApiRoute(slug);
  const platform = getImporterBySlug(slug);

  if (!platform) {
    return NextResponse.json(
      {
        ok: false,
        error: "Choose a supported importer path before reviewing the import map.",
        code: "IMPORTER_NOT_FOUND",
        issue: importerIssue,
        route,
        redaction: redaction(),
      },
      { status: 404 },
    );
  }

  const payload = await readPayload(request);

  return NextResponse.json({
    ok: true,
    issue: importerIssue,
    route,
    platform: publicPlatform(platform),
    preview: reviewMap(platform, payload),
    redaction: redaction(),
  });
}
