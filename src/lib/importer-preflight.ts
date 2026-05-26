import {
  importerExportMatchTemplates,
  importerExportPreflightParser,
  importerPreflightSignalLabels,
  type ImportDraftEntity,
  type ImporterPreflightSignal,
  type ImporterPlatform,
} from "@/lib/importers";

export type ImporterPreflightPayload = {
  get: (key: string) => string;
  getAll: (key: string) => string[];
  files: File[];
};

export type ExportFileKind = "CSV" | "JSON" | "HTML" | "plain text" | "archive" | "spreadsheet" | "unknown";

export type ParsedExportFile = {
  id: string;
  label: string;
  kind: ExportFileKind;
  parseStatus: "parsed" | "parsed_truncated" | "name_only" | "empty" | "unreadable";
  sizeBucket: string;
  rowCount: number | null;
  objectCount: number | null;
  detectedHeaderLabels: string[];
  detectedSignalLabels: string[];
  rawFileNameEchoed: false;
  rawRowsEchoed: false;
  rawTextEchoed: false;
};

export type ExportFileAnalysis = {
  fileCount: number;
  uploadedFileCount: number;
  pastedManifestCount: number;
  parsedFileCount: number;
  skippedFileCount: number;
  maxFilesPerReview: number;
  maxParsedBytesPerFile: number;
  detectedSignalLabels: string[];
  detectedHeaderLabels: string[];
  files: ParsedExportFile[];
  rawExportFilesIncluded: false;
  rawFileNamesEchoed: false;
  rawRowsEchoed: false;
  rawTextEchoed: false;
};

export type ImporterPlatformExportMatch = {
  id: string;
  label: string;
  status: "recognized" | "needs_more_context" | "not_detected";
  matchedFileKinds: Array<"CSV" | "JSON" | "HTML" | "plain text">;
  matchedRequiredHeaders: string[];
  missingRequiredHeaders: string[];
  matchedHelpfulHeaders: string[];
  matchedSignalLabels: string[];
  sourceChecklistItemIds: string[];
  draftEntities: ImportDraftEntity[];
  usesItFor: string;
  reviewPrompt: string;
  rawSourceEchoed: false;
};

const exportManifestFields = ["exportManifest", "exportFileContent", "exportFileContents"];

function stringValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

export async function readImporterPreflightPayload(
  request: Pick<Request, "headers" | "json" | "formData">,
): Promise<ImporterPreflightPayload> {
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
      files: [],
    };
  }

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    const files = ["exportFiles", "exportFile", "sourceFiles", "sourceFile"]
      .flatMap((key) => formData.getAll(key))
      .filter((value): value is File => typeof File !== "undefined" && value instanceof File && value.size > 0)
      .slice(0, importerExportPreflightParser.maxFilesPerReview);

    return {
      get: (key) => {
        const value = formData.get(key);
        return typeof value === "string" ? value : "";
      },
      getAll: (key) => formData.getAll(key).filter((value): value is string => typeof value === "string"),
      files,
    };
  }

  return { get: () => "", getAll: () => [], files: [] };
}

export function normalizeImporterSourceFileNames(payload: ImporterPreflightPayload) {
  const rawValues = [
    ...payload.getAll("sourceFileNames"),
    ...payload.getAll("sourceFileName"),
    ...payload.getAll("exportFileNames"),
    ...payload.getAll("exportFileName"),
    ...payload.files.map((file) => file.name),
  ];
  const names = rawValues
    .flatMap((value) => value.split(/[\n,]+/))
    .map((value) => value.trim().replace(/\\/g, "/").split("/").filter(Boolean).at(-1) ?? "")
    .map((value) => value.replace(/\s+/g, " ").slice(0, 240))
    .filter(Boolean);

  return Array.from(new Set(names)).slice(0, 20);
}

export function hasImporterSourceUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function sizeBucket(size: number) {
  if (size <= 0) return "empty";
  if (size < 10_000) return "under 10 KB";
  if (size < 100_000) return "10-100 KB";
  return "over 100 KB";
}

function fileKind(name: string, mimeType: string): ExportFileKind {
  const lowerName = name.toLowerCase();
  const lowerType = mimeType.toLowerCase();

  if (lowerName.endsWith(".csv") || lowerType.includes("csv")) return "CSV";
  if (lowerName.endsWith(".json") || lowerType.includes("json")) return "JSON";
  if (lowerName.endsWith(".html") || lowerName.endsWith(".htm") || lowerType.includes("html")) return "HTML";
  if (lowerName.endsWith(".txt") || lowerName.endsWith(".xml") || lowerType.startsWith("text/")) return "plain text";
  if (lowerName.endsWith(".zip")) return "archive";
  if (lowerName.endsWith(".xls") || lowerName.endsWith(".xlsx")) return "spreadsheet";
  return "unknown";
}

function splitDelimitedLine(line: string) {
  const delimiters = [",", "\t", ";"];
  const delimiter =
    delimiters.map((candidate) => ({ candidate, count: line.split(candidate).length })).sort((left, right) => right.count - left.count)[0]
      ?.candidate ?? ",";

  return line
    .split(delimiter)
    .map((value) => value.trim().replace(/^"|"$/g, "").replace(/\s+/g, " "))
    .filter(Boolean)
    .slice(0, 30);
}

function headerLabelsAndSignals(headers: string[]) {
  const labels = new Set<string>();
  const signals = new Set<ImporterPreflightSignal>();

  for (const header of headers) {
    const normalized = header.toLowerCase();

    if (/email|subscriber|customer|contact/.test(normalized)) {
      labels.add("Subscriber or customer column");
      signals.add("audience_context");
    }

    if (/first.?name|last.?name|full.?name|name/.test(normalized)) {
      labels.add("Name column");
      signals.add("audience_context");
    }

    if (/tag|segment|list|group|consent|suppression/.test(normalized)) {
      labels.add("Tag or segment column");
      signals.add("audience_context");
      signals.add("follow_up_notes");
    }

    if (/product|offer|plan|item|sku|title|membership|course/.test(normalized)) {
      labels.add("Product or offer column");
      signals.add("page_or_offer_copy");
    }

    if (/price|amount|total|order|checkout|coupon|discount|payment/.test(normalized)) {
      labels.add("Checkout or order column");
      signals.add("page_or_offer_copy");
    }

    if (/url|page|path|slug|link|domain/.test(normalized)) {
      labels.add("Page or URL column");
      signals.add("source_url");
    }

    if (/status|created|updated|date|purchased|subscribed|sent|opened/.test(normalized)) {
      labels.add("Status or date column");
      signals.add("follow_up_notes");
    }
  }

  return {
    labels: Array.from(labels).slice(0, 8),
    signals: Array.from(signals),
  };
}

function contentSignals(text: string) {
  const signals = new Set<ImporterPreflightSignal>();
  const normalized = text.toLowerCase();

  if (/https?:\/\/|href=|url|checkout|landing|page|funnel/.test(normalized)) signals.add("source_url");
  if (/email|subscriber|customer|tag|segment|audience|contact/.test(normalized)) signals.add("audience_context");
  if (/sequence|automation|follow.?up|message|send|broadcast|campaign/.test(normalized)) signals.add("follow_up_notes");
  if (/product|offer|price|coupon|order|checkout|upsell|bump|membership|course/.test(normalized)) {
    signals.add("page_or_offer_copy");
  }
  if (/launch|goal|preorder|bundle|cohort|campaign/.test(normalized)) signals.add("launch_goal");

  return Array.from(signals);
}

function parsedExportFile(
  index: number,
  label: string,
  kind: ExportFileKind,
  size: number,
  text: string,
  truncated: boolean,
): ParsedExportFile {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      id: `export-file-${index}`,
      label,
      kind,
      parseStatus: "empty",
      sizeBucket: sizeBucket(size),
      rowCount: null,
      objectCount: null,
      detectedHeaderLabels: [],
      detectedSignalLabels: [],
      rawFileNameEchoed: false,
      rawRowsEchoed: false,
      rawTextEchoed: false,
    };
  }

  let rowCount: number | null = null;
  let objectCount: number | null = null;
  let headers: string[] = [];

  if (kind === "JSON") {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) {
      objectCount = parsed.length;
      const firstObject = parsed.find((item) => item && typeof item === "object" && !Array.isArray(item));
      headers = firstObject ? Object.keys(firstObject).slice(0, 30) : [];
    } else if (parsed && typeof parsed === "object") {
      objectCount = 1;
      headers = Object.keys(parsed).slice(0, 30);
    }
  } else if (kind === "CSV" || kind === "plain text") {
    const lines = trimmed.split(/\r?\n/).filter((line) => line.trim());
    headers = splitDelimitedLine(lines[0] ?? "");
    rowCount = Math.max(0, lines.length - (headers.length ? 1 : 0));
  } else if (kind === "HTML") {
    headers = [
      trimmed.match(/<form\b/i) ? "form" : "",
      trimmed.match(/href=/i) ? "url" : "",
      trimmed.match(/checkout|cart|order/i) ? "checkout" : "",
      trimmed.match(/product|offer|course/i) ? "product" : "",
    ].filter(Boolean);
  }

  const headerMatches = headerLabelsAndSignals(headers);
  const signals = uniqueValues(["parsed_export_structure", ...headerMatches.signals, ...contentSignals(trimmed)]).map(
    (signal) => importerPreflightSignalLabels[signal as ImporterPreflightSignal],
  );

  return {
    id: `export-file-${index}`,
    label,
    kind,
    parseStatus: truncated ? "parsed_truncated" : "parsed",
    sizeBucket: sizeBucket(size),
    rowCount,
    objectCount,
    detectedHeaderLabels: headerMatches.labels,
    detectedSignalLabels: uniqueValues(signals),
    rawFileNameEchoed: false,
    rawRowsEchoed: false,
    rawTextEchoed: false,
  };
}

function nameOnlyExportFile(index: number, kind: ExportFileKind, size: number): ParsedExportFile {
  return {
    id: `export-file-${index}`,
    label: `Uploaded file ${index}`,
    kind,
    parseStatus: "name_only",
    sizeBucket: sizeBucket(size),
    rowCount: null,
    objectCount: null,
    detectedHeaderLabels: [],
    detectedSignalLabels: [importerPreflightSignalLabels.export_file_name],
    rawFileNameEchoed: false,
    rawRowsEchoed: false,
    rawTextEchoed: false,
  };
}

async function uploadedExportFile(file: File, index: number): Promise<ParsedExportFile> {
  const kind = fileKind(file.name, file.type);

  if (!["CSV", "JSON", "HTML", "plain text"].includes(kind)) {
    return nameOnlyExportFile(index, kind, file.size);
  }

  const bytes = Math.min(file.size, importerExportPreflightParser.maxParsedBytesPerFile);
  const truncated = file.size > importerExportPreflightParser.maxParsedBytesPerFile;
  const text = await file.slice(0, bytes).text();

  try {
    return parsedExportFile(index, `Uploaded file ${index}`, kind, file.size, text, truncated);
  } catch {
    return {
      ...nameOnlyExportFile(index, kind, file.size),
      parseStatus: "unreadable",
      detectedSignalLabels: [importerPreflightSignalLabels.export_file_name],
    };
  }
}

export async function exportFileAnalysisFromPayload(payload: ImporterPreflightPayload): Promise<ExportFileAnalysis> {
  const uploadedFiles = await Promise.all(payload.files.map((file, index) => uploadedExportFile(file, index + 1)));
  const pastedManifests = uniqueValues(exportManifestFields.flatMap((field) => payload.getAll(field)))
    .map((value, index) => {
      const kind = value.trim().startsWith("{") || value.trim().startsWith("[") ? "JSON" : "plain text";
      try {
        return parsedExportFile(uploadedFiles.length + index + 1, `Pasted export sample ${index + 1}`, kind, value.length, value, false);
      } catch {
        return parsedExportFile(uploadedFiles.length + index + 1, `Pasted export sample ${index + 1}`, "plain text", value.length, value, false);
      }
    })
    .slice(0, importerExportPreflightParser.maxFilesPerReview - uploadedFiles.length);
  const files = [...uploadedFiles, ...pastedManifests];
  const parsedFileCount = files.filter((file) => file.parseStatus === "parsed" || file.parseStatus === "parsed_truncated").length;

  return {
    fileCount: files.length,
    uploadedFileCount: payload.files.length,
    pastedManifestCount: pastedManifests.length,
    parsedFileCount,
    skippedFileCount: files.length - parsedFileCount,
    maxFilesPerReview: importerExportPreflightParser.maxFilesPerReview,
    maxParsedBytesPerFile: importerExportPreflightParser.maxParsedBytesPerFile,
    detectedSignalLabels: uniqueValues(files.flatMap((file) => file.detectedSignalLabels)),
    detectedHeaderLabels: uniqueValues(files.flatMap((file) => file.detectedHeaderLabels)),
    files,
    rawExportFilesIncluded: false,
    rawFileNamesEchoed: false,
    rawRowsEchoed: false,
    rawTextEchoed: false,
  };
}

export function platformExportMatches(
  platform: ImporterPlatform,
  exportFileAnalysis: ExportFileAnalysis,
): ImporterPlatformExportMatch[] {
  const detectedHeaders = new Set(exportFileAnalysis.detectedHeaderLabels);
  const detectedSignals = new Set(exportFileAnalysis.detectedSignalLabels);
  const detectedKinds = new Set(exportFileAnalysis.files.map((file) => file.kind));

  return importerExportMatchTemplates(platform).map((template) => {
    const matchedRequiredHeaders = template.requiredHeaderLabels.filter((label) => detectedHeaders.has(label));
    const missingRequiredHeaders = template.requiredHeaderLabels.filter((label) => !detectedHeaders.has(label));
    const matchedHelpfulHeaders = template.helpfulHeaderLabels.filter((label) => detectedHeaders.has(label));
    const matchedSignalLabels = template.signalLabels.filter((label) => detectedSignals.has(label));
    const matchedFileKinds = template.fileKinds.filter((kind) => detectedKinds.has(kind));
    const hasAllRequiredHeaders =
      template.requiredHeaderLabels.length > 0 && matchedRequiredHeaders.length === template.requiredHeaderLabels.length;
    const hasUsefulSignal = matchedSignalLabels.length > 0 || matchedHelpfulHeaders.length > 0;
    const status = hasAllRequiredHeaders ? "recognized" : hasUsefulSignal ? "needs_more_context" : "not_detected";

    return {
      id: template.id,
      label: template.label,
      status,
      matchedFileKinds,
      matchedRequiredHeaders,
      missingRequiredHeaders,
      matchedHelpfulHeaders,
      matchedSignalLabels,
      sourceChecklistItemIds: template.sourceChecklistItemIds,
      draftEntities: template.draftEntities,
      usesItFor: template.usesItFor,
      reviewPrompt: template.reviewPrompt,
      rawSourceEchoed: false,
    };
  });
}
