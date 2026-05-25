import { NextRequest, NextResponse } from "next/server";

import {
  getImporterBySlug,
  importerDraftPreviewApiRoute,
  importerIssue,
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
}) {
  const signals: string[] = [];
  if (input.sourceUrlProvided) signals.push("public source URL");
  if (input.sourceFileNameCount > 0) signals.push("export file names");
  if (input.pageCopyProvided) signals.push("pasted page or offer copy");
  if (input.followUpNotesProvided) signals.push("follow-up notes");
  return signals;
}

function areaStatus(areaEntities: string[], signals: string[]) {
  if (signals.length === 0) return "needs_source";
  if (areaEntities.includes("draft_audience_import") || areaEntities.includes("draft_sequence_outline")) {
    return signals.includes("follow-up notes") || signals.includes("pasted page or offer copy") ? "ready_to_review" : "needs_more_context";
  }
  if (areaEntities.includes("draft_checkout_offer") || areaEntities.includes("draft_product_catalog")) {
    return signals.includes("pasted page or offer copy") || signals.includes("export file names") ? "ready_to_review" : "needs_more_context";
  }
  return "ready_to_review";
}

function reviewMap(platform: ImporterPlatform, payload: RequestPayload) {
  const offerTitle = payload.get("offerTitle").trim().slice(0, 120);
  const sourceFileNames = normalizeSourceFileNames(payload);
  const inputSummary = {
    sourceUrlProvided: hasUrl(payload.get("sourceUrl")),
    sourceFileNameCount: sourceFileNames.length,
    pageCopyProvided: payload.get("pageCopy").trim().length > 0,
    followUpNotesProvided: payload.get("followUpNotes").trim().length > 0,
    rawSourceEchoed: false,
  };
  const signals = signalList(inputSummary);

  return {
    title: offerTitle || `${platform.platformName} import plan`,
    status: signals.length > 0 ? "ready_for_private_plan" : "needs_source_material",
    writesRecords: false,
    paidGoLiveRequired: true,
    inputSummary,
    detectedAreas: platform.importableAreas.map((area) => ({
      id: area.id,
      label: area.label,
      status: areaStatus(area.draftEntities, signals),
      draftEntities: area.draftEntities,
    })),
    draftStepPreview: [
      {
        id: "imported-opt-in",
        label: "Imported opt-in step",
        prepares: ["opening promise", "audience reason to continue", "private opt-in next step"],
      },
      {
        id: "imported-sales-page",
        label: "Imported sales or offer step",
        prepares: ["sales promise", "source material to verify", "checkout handoff notes"],
      },
      {
        id: "imported-follow-up",
        label: "Imported follow-up step",
        prepares: ["post-action confirmation", "delivery expectation", "follow-up plan"],
      },
    ],
    safetyGates: [
      "Review map does not create records.",
      "Private draft creation requires a verified publisher session.",
      "Go-live actions stay off until paid or explicitly approved.",
      "Responses do not echo pasted source material or export file names.",
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
