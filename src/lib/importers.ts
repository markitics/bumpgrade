import { competitors, type Competitor } from "@/lib/comparison-data";

export type ImporterStatus = "launch-preview" | "private-draft-live" | "queued";

export type ImportInputKind = "public_url" | "export_file" | "csv_upload" | "manual_paste" | "api_connection";

export type ImportDraftEntity =
  | "draft_funnel"
  | "draft_page_blocks"
  | "draft_checkout_offer"
  | "draft_product_catalog"
  | "draft_audience_import"
  | "draft_sequence_outline"
  | "asset_reference";

export type ImportInput = {
  kind: ImportInputKind;
  label: string;
  description: string;
};

export type ImportableArea = {
  id: string;
  label: string;
  draftEntities: ImportDraftEntity[];
  description: string;
};

export type ImportSourceChecklistItem = {
  id: string;
  label: string;
  bring: string;
  bumpgradeUsesItFor: string;
  reviewBeforePrivatePlan: string;
};

export type ImporterPreflightSignal =
  | "source_url"
  | "export_file_name"
  | "parsed_export_structure"
  | "page_or_offer_copy"
  | "follow_up_notes"
  | "launch_goal"
  | "audience_context";

export type ImportSourceChecklistSourceDataItem = ImportSourceChecklistItem & {
  preflightSignals: ImporterPreflightSignal[];
};

export type ImporterExportMatchTemplate = {
  id: string;
  label: string;
  fileKinds: Array<"CSV" | "JSON" | "HTML" | "plain text">;
  requiredHeaderLabels: string[];
  helpfulHeaderLabels: string[];
  signalLabels: string[];
  sourceChecklistItemIds: string[];
  draftEntities: ImportDraftEntity[];
  usesItFor: string;
  reviewPrompt: string;
};

export type ImporterPlatform = {
  id: string;
  competitorId: string;
  platformName: string;
  slug: string;
  status: ImporterStatus;
  route: string;
  compareRoute: string;
  sourceIds: string[];
  priority: number;
  headline: string;
  summary: string;
  bestFor: string;
  inputs: ImportInput[];
  importableAreas: ImportableArea[];
  sourceChecklist: ImportSourceChecklistItem[];
  unsupportedNow: string[];
  firstReviewSteps: string[];
  agentContract: string;
};

export const importerUpdatedAt = "2026-05-26";
export const importerIssue = 467;
export const importerSourceDataRoute = "/imports/source-data";
export const importerHubRoute = "/imports";
export function importerDraftPreviewApiRoute(slug: string) {
  return `/api/imports/${slug}/preview`;
}

export function importerDraftImportApiRoute(slug: string) {
  return `/api/imports/${slug}/draft`;
}

export function importerDraftRollbackApiRoute(slug: string) {
  return `/api/imports/${slug}/draft/rollback`;
}

export function importerPrivateRecordReviewRoute(slug: string, draftId?: string) {
  const route = `/imports/${slug}/review`;
  if (!draftId) return route;
  return `${route}?draft=${encodeURIComponent(draftId)}`;
}

export function importerPrivateRecordReviewActionApiRoute(slug: string) {
  return `/api/imports/${slug}/records/review`;
}

export function importerDraftImportConfirmationText(platformName: string) {
  return `Create private ${platformName} import plan`;
}

export function importerDraftRollbackConfirmationText(platformName: string) {
  return `Archive private ${platformName} import plan`;
}

export function importerPrivateRecordReviewConfirmationText(
  platformName: string,
  decision: "ready" | "needs_cleanup",
) {
  return decision === "ready"
    ? `Mark ${platformName} import record ready`
    : `Mark ${platformName} import record needs cleanup`;
}

export function importerPrivateRecordExtractedFieldEditConfirmationText(platformName: string) {
  return `Save ${platformName} import field edits`;
}

export function importerPrivateRecordSubscriberPreflightConfirmationText(
  platformName: string,
  decision: "ready_for_import_planning" | "needs_cleanup",
) {
  return decision === "ready_for_import_planning"
    ? `Record ${platformName} subscriber import preflight ready`
    : `Record ${platformName} subscriber import preflight cleanup`;
}

export function importerPrivateRecordSubscriberImportConfirmationText(platformName: string) {
  return `Create ${platformName} private subscriber records`;
}

export function importerPrivateRecordSubscriberAudiencePromotionConfirmationText(platformName: string) {
  return `Add ${platformName} subscribers to audience review list`;
}

export function importerPrivateRecordSubscriberPrivateExportConfirmationText(platformName: string) {
  return `Export ${platformName} private subscriber records`;
}

export function importerDraftImportCapabilityId(platformId: string) {
  return `${platformId.replace(/^importer-/, "")}-private-draft-import`;
}

export function importerDraftRollbackCapabilityId(platformId: string) {
  return `${platformId.replace(/^importer-/, "")}-private-draft-rollback`;
}

export function importerPrivateRecordReviewCapabilityId(platformId: string) {
  return `${platformId.replace(/^importer-/, "")}-private-record-review`;
}

export const importerPreflightSignalLabels: Record<ImporterPreflightSignal, string> = {
  source_url: "Source URL",
  export_file_name: "Export file name",
  parsed_export_structure: "Parsed export structure",
  page_or_offer_copy: "Page or offer copy",
  follow_up_notes: "Follow-up notes",
  launch_goal: "Launch goal",
  audience_context: "Audience context",
};

function addSignal(signals: Set<ImporterPreflightSignal>, condition: boolean, signal: ImporterPreflightSignal) {
  if (condition) signals.add(signal);
}

export function sourceChecklistPreflightSignals(item: ImportSourceChecklistItem): ImporterPreflightSignal[] {
  const text = `${item.id} ${item.label} ${item.bring} ${item.bumpgradeUsesItFor}`.toLowerCase();
  const signals = new Set<ImporterPreflightSignal>();

  addSignal(signals, /url|page|landing|checkout|funnel|form|webinar|campaign|path/.test(text), "source_url");
  addSignal(signals, /export|csv|file|archive|spreadsheet/.test(text), "export_file_name");
  addSignal(signals, /export|csv|file|archive|spreadsheet|row|header|catalog|customer/.test(text), "parsed_export_structure");
  addSignal(
    signals,
    /copy|offer|price|pricing|coupon|guarantee|product|description|promise|checkout|delivery|fulfillment|access|affiliate|partner|payout|rule|membership|module|lesson|download/.test(
      text,
    ),
    "page_or_offer_copy",
  );
  addSignal(
    signals,
    /email|follow-up|follow up|sequence|automation|tag|subscriber|segment|opt-in|message|reminder|post-purchase|send/.test(
      text,
    ),
    "follow_up_notes",
  );
  addSignal(signals, /goal|launch|bundle|preorder|cohort|campaign|move|first/.test(text), "launch_goal");
  addSignal(signals, /audience|subscriber|segment|customer|tag|consent|suppression|list|member/.test(text), "audience_context");

  if (signals.size === 0) signals.add("page_or_offer_copy");

  return Array.from(signals);
}

export const clickFunnelsDraftImportApiRoute = importerDraftImportApiRoute("clickfunnels");
export const clickFunnelsDraftPreviewApiRoute = importerDraftPreviewApiRoute("clickfunnels");
export const clickFunnelsDraftImportConfirmationText = importerDraftImportConfirmationText("ClickFunnels");

export const commonImporterSafetyGates = [
  "Imported material starts in a private workspace and does not publish public pages.",
  "A paid go-live state is required before imported pages, checkout paths, sends, domains, or fulfillment become buyer-facing.",
  "The importer shows a review step before creating Bumpgrade records.",
  "Private importer writes create structured private import records for matched review areas without making them buyer-facing.",
  "Confirmed audience-import review can create private importer subscriber records for owner review, then add them to the audience review list without sequence enrollments or sends.",
  "Private subscriber exports are owner-only CSV downloads from saved importer contacts; public source-data and JSON responses expose counts and redaction rules only.",
  "Duplicate review reuses existing private import work when the source platform, target workspace, normalized title, and normalized source URL or export file name match.",
  "Rollback archives private import plans without deleting saved work or audit history, so the same source can be restarted cleanly.",
  "Write steps require owner authentication, exact confirmation, idempotency, current workspace state, and audit correlation.",
  "Public source-data excludes raw export files, customer rows, private emails, payment credentials, API keys, and session cookies.",
];

export const importerExportPreflightParser = {
  status: "live",
  routeField: "previewApiRoute",
  responseField: "exportFileAnalysis",
  acceptedFormFields: ["exportFiles", "exportFile", "sourceFiles", "exportManifest", "exportFileContent"],
  parsedKinds: ["CSV", "JSON", "HTML", "plain text"],
  maxFilesPerReview: 5,
  maxParsedBytesPerFile: 64_000,
  writesRecords: false,
  rawExportFilesIncluded: false,
  rawFileNamesEchoed: false,
  rawRowsEchoed: false,
  rawTextEchoed: false,
};

export const importerPrivateStructuredRecords = {
  responseField: "importRecords",
  storage: "D1 competitor_import_private_records",
  createdOnPrivateDraftCreate: true,
  reviewRouteField: "privateRecordReviewRoute",
  reviewSurface: "verified-publisher private importer review page",
  reviewSurfaceLive: true,
  reviewActionRouteField: "privateRecordReviewActionApiRoute",
  reviewActionsLive: true,
  extractedFieldsResponseField: "extractedFields",
  extractedFieldsStorage: "competitor_import_private_records.metadata_json",
  extractedFieldsReviewSurfaceLive: true,
  extractedFieldEditingLive: true,
  extractedFieldEditActionRouteField: "privateRecordReviewActionApiRoute",
  subscriberImportDepthResponseField: "subscriberImportDepth",
  subscriberImportDepthLive: true,
  subscriberImportDepthAppliesTo: ["draft_audience_import"],
  subscriberImportDepthDerivedFrom: [
    "safe subscriber/customer header labels",
    "safe tag/segment header labels",
    "safe consent/status/date header labels",
    "safe audience and follow-up signal labels",
    "aggregate parsed export row counts",
  ],
  subscriberImportPreflightResponseField: "subscriberImportPreflight",
  subscriberImportPreflightActionLive: true,
  subscriberImportPreflightActionRouteField: "privateRecordReviewActionApiRoute",
  subscriberImportPreflightAppliesTo: ["draft_audience_import"],
  subscriberImportPreflightStatusValues: ["not_recorded", "ready_for_import_planning", "needs_cleanup"],
  subscriberImportCreationResponseField: "subscriberImportCreation",
  subscriberImportCreationActionLive: true,
  subscriberImportCreationActionRouteField: "privateRecordReviewActionApiRoute",
  subscriberImportCreationAppliesTo: ["draft_audience_import"],
  subscriberImportCreationStatusValues: ["not_created", "subscriber_records_created"],
  subscriberImportRecordInspectionLive: true,
  subscriberImportRecordInspectionReviewField: "privateSubscriberRecordsByImportRecordId",
  subscriberImportRecordInspectionStorage: "D1 competitor_import_subscriber_records",
  subscriberImportRecordInspectionSurface: "same-owner private importer review page",
  subscriberImportRecordInspectionDisplayLimit: 20,
  subscriberImportRecordInspectionQueryLimit: 100,
  privateSubscriberEmailsIncludedInOwnerReview: true,
  privateSubscriberEmailsIncludedInPublicResponses: false,
  privateSubscriberEmailsIncludedInUnauthenticatedResponses: false,
  subscriberAudiencePromotionResponseField: "subscriberAudiencePromotion",
  subscriberAudiencePromotionActionLive: true,
  subscriberAudiencePromotionActionRouteField: "privateRecordReviewActionApiRoute",
  subscriberAudiencePromotionAppliesTo: ["draft_audience_import"],
  subscriberAudiencePromotionStatusValues: ["not_promoted", "global_audience_rows_created"],
  subscriberAudiencePromotionStorage: ["D1 audience_subscribers", "D1 audience_tag_assignments"],
  subscriberAudiencePromotionSourceStatus: "imported_pending_review",
  subscriberAudiencePromotionConsentEventsCreated: false,
  subscriberAudiencePromotionRequiresConsentReviewBeforeSending: true,
  subscriberPrivateExportResponseField: "subscriberPrivateExport",
  subscriberPrivateExportActionLive: true,
  subscriberPrivateExportActionRouteField: "privateRecordReviewActionApiRoute",
  subscriberPrivateExportAppliesTo: ["draft_audience_import"],
  subscriberPrivateExportStatusValues: ["not_exported", "private_export_prepared"],
  subscriberPrivateExportFormat: "text/csv",
  subscriberPrivateExportOwnerOnly: true,
  subscriberPrivateExportIncludesPrivateEmailsInDownload: true,
  subscriberPrivateExportIncludesPrivateEmailsInJsonResponse: false,
  subscriberPrivateExportPublicSourceDataIncludesContactValues: false,
  publicSourceDataExposesContent: false,
  derivedFrom: ["importReview.platformExportMatches", "safe exportFileAnalysis labels", "platform importableAreas"],
  extractedFieldsDerivedFrom: ["safe header labels", "safe signal labels", "record kind"],
  extractedFieldEditableFields: ["label", "status", "reviewPrompt"],
  extractedFieldStatusValues: ["ready_for_review", "needs_context"],
  recordKinds: [
    "draft_funnel",
    "draft_page_blocks",
    "draft_checkout_offer",
    "draft_product_catalog",
    "draft_audience_import",
    "draft_sequence_outline",
    "asset_reference",
  ],
  storesSafeMatchMetadata: true,
  storesSafeExtractedFieldPlan: true,
  storesOwnerEditedExtractedFieldPlan: true,
  storesSafeSubscriberImportDepth: true,
  storesSubscriberImportPreflightMetadata: true,
  storesPrivateSubscriberImportRecords: true,
  storesPrivateEmails: true,
  createsSubscriberRows: true,
  createsGlobalAudienceSubscriberRows: true,
  createsConsentEvents: false,
  createsSequenceEnrollments: false,
  emailDeliveryEnabled: false,
  privateExportEnabled: true,
  publicExportEnabled: false,
  storesRawExtractedValues: false,
  storesRawExportRows: false,
  storesRawExportText: false,
  storesRawExportFileNames: false,
  storesCustomerRows: false,
  goLiveEffectsEnabled: false,
};

const headerLabels = {
  subscriberOrCustomer: "Subscriber or customer column",
  name: "Name column",
  tagOrSegment: "Tag or segment column",
  productOrOffer: "Product or offer column",
  checkoutOrOrder: "Checkout or order column",
  pageOrUrl: "Page or URL column",
  statusOrDate: "Status or date column",
} as const;

function signalLabel(signal: ImporterPreflightSignal) {
  return importerPreflightSignalLabels[signal];
}

function template(
  platform: ImporterPlatform,
  input: Omit<ImporterExportMatchTemplate, "id"> & { id: string },
): ImporterExportMatchTemplate {
  return {
    ...input,
    id: `${platform.slug}-${input.id}`,
  };
}

export const clickFunnelsDraftImportCapability = {
  id: importerDraftImportCapabilityId("importer-clickfunnels"),
  status: "live",
  issue: importerIssue,
  platformId: "importer-clickfunnels",
  route: "/imports/clickfunnels",
  previewApiRoute: clickFunnelsDraftPreviewApiRoute,
  apiRoute: clickFunnelsDraftImportApiRoute,
  confirmationText: clickFunnelsDraftImportConfirmationText,
  auth: "verified publisher session",
  creates: [
    "free_build_workspace_if_needed",
    "private_draft_funnel",
    "private_import_export_review_metadata",
    "private_structured_import_records",
    "funnel_audit_event",
  ],
  accepts: ["public_url", "export_file", "csv_upload", "manual_paste"],
  redaction: {
    rawExportFilesIncluded: false,
    customerRowsIncluded: false,
    privateEmailsIncluded: false,
    paymentCredentialsIncluded: false,
    sessionCookiesIncluded: false,
    rawPastedMaterialIncludedInResponse: false,
  },
  goLiveEffects: {
    publicPublishingEnabled: false,
    liveCheckoutEnabled: false,
    subscriberSendsEnabled: false,
    customDomainsEnabled: false,
    fulfillmentEnabled: false,
  },
  privateDraftExportReview: {
    responseField: "importReview",
    storedOn: "private_draft_metadata_json",
    storesSafeExportAnalysis: true,
    storesPlatformExportMatches: true,
    storesRecognizedPlatformExportMatchIds: true,
    rawExportFilesIncluded: false,
    rawFileNamesEchoed: false,
    rawRowsEchoed: false,
    rawTextEchoed: false,
    rawSourceEchoed: false,
    goLiveEffectsEnabled: false,
  },
  privateStructuredImportRecords: importerPrivateStructuredRecords,
  duplicateProtection:
    "Idempotency replays the same private draft. Source-match duplicate review reuses an existing private draft when platform, workspace, normalized title, and normalized source URL or export file name match.",
};

export const importInputs: Record<ImportInputKind, ImportInput> = {
  public_url: {
    kind: "public_url",
    label: "Public URL",
    description: "Paste a public page, checkout, product, or sign-up URL so Bumpgrade can map the visible structure.",
  },
  export_file: {
    kind: "export_file",
    label: "Export file",
    description: "Upload a file or archive you already exported from the old platform.",
  },
  csv_upload: {
    kind: "csv_upload",
    label: "CSV upload",
    description: "Bring structured contacts, products, offers, or orders in a spreadsheet-style file.",
  },
  manual_paste: {
    kind: "manual_paste",
    label: "Copy and paste",
    description: "Paste page copy, offer details, email outlines, or product notes when there is no clean export.",
  },
  api_connection: {
    kind: "api_connection",
    label: "API connection",
    description: "Connect through an approved platform API only after credentials, scopes, and redaction rules are explicit.",
  },
};

const universalUnsupported = [
  "Live payment processor credentials",
  "Customer passwords or private login sessions",
  "Private community posts or member-only files",
  "Subscriber sends or buyer notifications",
  "Public publishing without go-live approval",
];

function competitorById(id: string): Competitor {
  const competitor = competitors.find((item) => item.id === id);
  if (!competitor) throw new Error(`Missing competitor ${id}`);
  return competitor;
}

function compareRouteFor(competitor: Competitor) {
  return `/compare/${competitor.slug}`;
}

const clickfunnels = competitorById("competitor-clickfunnels");
const kit = competitorById("competitor-kit");
const shopify = competitorById("competitor-shopify");
const samcart = competitorById("competitor-samcart");
const kajabi = competitorById("competitor-kajabi");
const podia = competitorById("competitor-podia");
const systeme = competitorById("competitor-systeme");
const kartra = competitorById("competitor-kartra");
const thrivecart = competitorById("competitor-thrivecart");

export const importerPlatforms: ImporterPlatform[] = [
  {
    id: "importer-clickfunnels",
    competitorId: clickfunnels.id,
    platformName: clickfunnels.name,
    slug: "clickfunnels",
    status: "private-draft-live",
    route: "/imports/clickfunnels",
    compareRoute: compareRouteFor(clickfunnels),
    sourceIds: clickfunnels.sourceIds ?? [clickfunnels.sourceId],
    priority: 10,
    headline: "Import from ClickFunnels without going live too soon.",
    summary:
      "Bring funnel pages, offer steps, checkout notes, product access notes, and follow-up outlines into a private Bumpgrade workspace before anything becomes public.",
    bestFor: "Publishers replacing a funnel-first stack with one connected launch workflow.",
    inputs: [importInputs.public_url, importInputs.export_file, importInputs.manual_paste, importInputs.csv_upload],
    importableAreas: [
      {
        id: "clickfunnels-funnel-pages",
        label: "Funnel pages",
        draftEntities: ["draft_funnel", "draft_page_blocks", "asset_reference"],
        description: "Map opt-in, sales, checkout, upsell, thank-you, webinar, and resource pages into an ordered launch path.",
      },
      {
        id: "clickfunnels-offer-path",
        label: "Offer and checkout path",
        draftEntities: ["draft_checkout_offer", "draft_product_catalog"],
        description: "Capture the main offer, bumps, upsells, downsells, product references, and buyer handoff notes.",
      },
      {
        id: "clickfunnels-follow-up",
        label: "Follow-up outline",
        draftEntities: ["draft_audience_import", "draft_sequence_outline"],
        description: "Carry the launch follow-up intent into Bumpgrade without sending email during import.",
      },
    ],
    sourceChecklist: [
      {
        id: "clickfunnels-page-order",
        label: "Funnel URL or export",
        bring: "Public opt-in, sales, order, upsell, thank-you, webinar, or resource URLs, plus any exported funnel archive you already have.",
        bumpgradeUsesItFor: "Building the private page order, page-block review, and asset checklist.",
        reviewBeforePrivatePlan: "Confirm the page sequence, missing assets, and which pages should become part of the first Bumpgrade launch path.",
      },
      {
        id: "clickfunnels-offer-stack",
        label: "Offer stack notes",
        bring: "Main price, bump, upsell, downsell, product access, and buyer handoff notes.",
        bumpgradeUsesItFor: "Preparing checkout-offer and product-catalog private plan sections.",
        reviewBeforePrivatePlan: "Check that every buyer-facing promise is captured before any checkout route is created.",
      },
      {
        id: "clickfunnels-follow-up-notes",
        label: "Follow-up outline",
        bring: "Automation names, email sequence intent, tags, and post-purchase messages you want to preserve.",
        bumpgradeUsesItFor: "Creating a private sequence outline and audience-review notes without sending email.",
        reviewBeforePrivatePlan: "Review message intent and tag meaning before importing audience or automation context.",
      },
    ],
    unsupportedNow: [...universalUnsupported, "One-click transfer of ClickFunnels account settings"],
    firstReviewSteps: [
      "Sign in or create a Free Build workspace without paying first.",
      "Choose the funnel or offer path that matters most.",
      "Add public URLs, export files, or pasted copy.",
      "Review the detected pages, offer steps, products, assets, and follow-up notes.",
      "Create a private import plan only after the map matches the launch you want.",
      "Go live when the page, checkout, email, product access, and domain gates are ready.",
    ],
    agentContract:
      "Agents can read the ClickFunnels importer contract, input kinds, saved private plan parts, verified-publisher private draft API, safety gates, source IDs, and limitations from /imports/source-data. Agents must not claim live account-to-account transfer, customer password migration, live checkout migration, subscriber sends, domains, fulfillment, or public publishing from this importer.",
  },
  {
    id: "importer-samcart",
    competitorId: samcart.id,
    platformName: samcart.name,
    slug: "samcart",
    status: "private-draft-live",
    route: "/imports/samcart",
    compareRoute: compareRouteFor(samcart),
    sourceIds: samcart.sourceIds ?? [samcart.sourceId],
    priority: 20,
    headline: "Import SamCart offer paths into Bumpgrade.",
    summary:
      "Start from checkout pages, order bumps, upsell paths, product notes, and reporting context so the buying moment can connect to the full launch workflow.",
    bestFor: "Sellers whose current system is checkout-first and needs better funnel, product, and follow-up context.",
    inputs: [importInputs.public_url, importInputs.export_file, importInputs.csv_upload, importInputs.manual_paste],
    importableAreas: [
      {
        id: "samcart-checkout-offers",
        label: "Checkout and offer stack",
        draftEntities: ["draft_checkout_offer", "draft_product_catalog"],
        description: "Bring the primary offer, bump, upsell, subscription, and product delivery notes into one review.",
      },
      {
        id: "samcart-funnel-handoff",
        label: "Funnel handoff",
        draftEntities: ["draft_funnel", "draft_page_blocks"],
        description: "Attach the checkout path to the pages and follow-up that should surround it.",
      },
    ],
    sourceChecklist: [
      {
        id: "samcart-checkout-page",
        label: "Checkout page or export",
        bring: "Checkout page URLs, product export files, or screenshots of the active buying path.",
        bumpgradeUsesItFor: "Preparing the private checkout-offer review and matching the offer to Bumpgrade product records.",
        reviewBeforePrivatePlan: "Confirm the primary offer, currency, payment shape, and buyer promise before any private plan is saved.",
      },
      {
        id: "samcart-bump-upsell-path",
        label: "Bump and upsell path",
        bring: "Order bump, upsell, downsell, subscription, coupon, and guarantee notes.",
        bumpgradeUsesItFor: "Mapping the offer stack around the checkout path.",
        reviewBeforePrivatePlan: "Review which offers belong in the first launch and which should stay parked.",
      },
      {
        id: "samcart-delivery-context",
        label: "Product delivery notes",
        bring: "Product access instructions, fulfillment notes, and post-purchase handoff copy.",
        bumpgradeUsesItFor: "Drafting product access and follow-up context while fulfillment stays off.",
        reviewBeforePrivatePlan: "Check delivery promises before any buyer-facing route or fulfillment rule is enabled.",
      },
    ],
    unsupportedNow: [...universalUnsupported, "Payment token transfer", "Historical payout migration"],
    firstReviewSteps: [
      "Start with the checkout or product path.",
      "Attach offer, bump, upsell, subscription, and delivery notes.",
      "Review the Bumpgrade offer structure before connecting it to a launch path.",
    ],
    agentContract:
      "Agents can describe SamCart import planning for offers, bumps, upsells, product notes, and funnel handoffs. Billing, payout, and payment-token migration are not supported.",
  },
  {
    id: "importer-kit",
    competitorId: kit.id,
    platformName: kit.name,
    slug: "kit",
    status: "private-draft-live",
    route: "/imports/kit",
    compareRoute: compareRouteFor(kit),
    sourceIds: kit.sourceIds ?? [kit.sourceId],
    priority: 30,
    headline: "Import Kit audience context without sending by accident.",
    summary:
      "Bring subscribers, tags, forms, sequence outlines, and creator-commerce notes into Bumpgrade review screens before any broadcast or automation runs.",
    bestFor: "Creators whose email list is the center of the business but whose launch needs pages, checkout, and product access too.",
    inputs: [importInputs.csv_upload, importInputs.export_file, importInputs.manual_paste, importInputs.api_connection],
    importableAreas: [
      {
        id: "kit-audience",
        label: "Audience and tags",
        draftEntities: ["draft_audience_import"],
        description: "Review contacts, tags, consent notes, suppressions, duplicates, and malformed rows before storing import records.",
      },
      {
        id: "kit-sequences",
        label: "Sequence outlines",
        draftEntities: ["draft_sequence_outline"],
        description: "Carry sequence structure and campaign intent into Bumpgrade without scheduling live sends.",
      },
    ],
    sourceChecklist: [
      {
        id: "kit-subscriber-tags",
        label: "Subscriber and tag CSV",
        bring: "Subscriber, tag, segment, consent, suppression, and custom-field exports.",
        bumpgradeUsesItFor: "Preparing private audience-import review counts and malformed-row checks.",
        reviewBeforePrivatePlan: "Confirm consent, duplicates, suppression rules, and fields that should not be imported.",
      },
      {
        id: "kit-forms-landing-pages",
        label: "Forms and landing pages",
        bring: "Form URLs, landing page URLs, incentive copy, and opt-in promises.",
        bumpgradeUsesItFor: "Drafting opt-in page and audience source context.",
        reviewBeforePrivatePlan: "Review the opt-in promise before Bumpgrade stores private audience notes.",
      },
      {
        id: "kit-sequence-outline",
        label: "Sequence outline",
        bring: "Sequence names, subject lines, send timing, and campaign intent notes.",
        bumpgradeUsesItFor: "Creating a private sequence outline without enrolling subscribers or sending messages.",
        reviewBeforePrivatePlan: "Check message order and exclusions before any future send workflow is considered.",
      },
    ],
    unsupportedNow: [...universalUnsupported, "Provider reputation history", "Automatic live sequence enrollment"],
    firstReviewSteps: [
      "Choose a CSV, export, pasted sequence outline, or approved API path.",
      "Review consent, duplicate, suppression, and malformed-row counts.",
      "Create private audience import records before scheduling any message.",
    ],
    agentContract:
      "Agents can map Kit imports to audience import intent and preflight contracts. Agents must not expose raw emails in public source-data or claim live sends, automatic enrollments, or provider reputation migration.",
  },
  {
    id: "importer-kajabi",
    competitorId: kajabi.id,
    platformName: kajabi.name,
    slug: "kajabi",
    status: "private-draft-live",
    route: "/imports/kajabi",
    compareRoute: compareRouteFor(kajabi),
    sourceIds: kajabi.sourceIds ?? [kajabi.sourceId],
    priority: 40,
    headline: "Import Kajabi products, pages, and offer context.",
    summary:
      "Move course, coaching, membership, page, funnel, and email context into a private Bumpgrade workspace before turning on the public launch path.",
    bestFor: "Expert-led businesses moving from an all-in-one knowledge-commerce stack.",
    inputs: [importInputs.public_url, importInputs.export_file, importInputs.csv_upload, importInputs.manual_paste],
    importableAreas: [
      {
        id: "kajabi-products",
        label: "Products and access",
        draftEntities: ["draft_product_catalog", "asset_reference"],
        description: "Map product structure, modules, downloads, memberships, and access notes without exposing private files.",
      },
      {
        id: "kajabi-pages",
        label: "Pages and offers",
        draftEntities: ["draft_funnel", "draft_page_blocks", "draft_checkout_offer"],
        description: "Connect landing pages, sales pages, checkout notes, and delivery gates.",
      },
    ],
    sourceChecklist: [
      {
        id: "kajabi-product-outline",
        label: "Product or course outline",
        bring: "Course, coaching, membership, module, lesson, download, and access-rule notes.",
        bumpgradeUsesItFor: "Preparing private product-catalog and access-review sections.",
        reviewBeforePrivatePlan: "Confirm what should be sellable, protected, or left as reference-only.",
      },
      {
        id: "kajabi-page-offer-path",
        label: "Page and offer URLs",
        bring: "Landing pages, sales pages, checkout pages, offer descriptions, and pricing notes.",
        bumpgradeUsesItFor: "Building a private funnel path and checkout-offer review.",
        reviewBeforePrivatePlan: "Review the public promise and offer shape before creating the private plan.",
      },
      {
        id: "kajabi-email-access-context",
        label: "Email and access notes",
        bring: "Email sequence outlines, community boundaries, member-access notes, and support handoff copy.",
        bumpgradeUsesItFor: "Drafting follow-up and product access context without touching private communities.",
        reviewBeforePrivatePlan: "Check which membership or community details should stay outside the import.",
      },
    ],
    unsupportedNow: [...universalUnsupported, "Member password transfer", "Private community migration"],
    firstReviewSteps: [
      "Choose the product or launch path to move first.",
      "Attach page URLs, product notes, files you own, and offer details.",
      "Review access boundaries before any buyer-facing route changes.",
    ],
    agentContract:
      "Agents can describe Kajabi import planning for products, access, pages, offers, and sequence outlines. Private files, passwords, communities, and live fulfillment remain outside the public importer contract.",
  },
  {
    id: "importer-shopify",
    competitorId: shopify.id,
    platformName: shopify.name,
    slug: "shopify",
    status: "private-draft-live",
    route: "/imports/shopify",
    compareRoute: compareRouteFor(shopify),
    sourceIds: shopify.sourceIds ?? [shopify.sourceId],
    priority: 50,
    headline: "Import Shopify offer and product context for publisher launches.",
    summary:
      "Use product, page, and customer-safe export context to build a launch workspace around a focused offer instead of recreating a full store.",
    bestFor: "Publishers who use Shopify for commerce but want a simpler launch path for a paid offer, resource, or cohort.",
    inputs: [importInputs.public_url, importInputs.export_file, importInputs.csv_upload, importInputs.manual_paste],
    importableAreas: [
      {
        id: "shopify-products",
        label: "Products and pages",
        draftEntities: ["draft_product_catalog", "draft_page_blocks", "asset_reference"],
        description: "Map a focused catalog, sales pages, product descriptions, images, and access notes.",
      },
      {
        id: "shopify-launch-offer",
        label: "Launch offer",
        draftEntities: ["draft_checkout_offer", "draft_funnel"],
        description: "Turn selected products into a Bumpgrade offer path with review before publishing.",
      },
    ],
    sourceChecklist: [
      {
        id: "shopify-product-collection",
        label: "Product or collection export",
        bring: "Focused product, collection, variant, image, price, and description exports for the launch offer.",
        bumpgradeUsesItFor: "Preparing a private product catalog and offer review for the selected launch.",
        reviewBeforePrivatePlan: "Choose the products that belong in Bumpgrade instead of trying to recreate the full store.",
      },
      {
        id: "shopify-product-pages",
        label: "Product and page URLs",
        bring: "Public product pages, landing pages, policy links, and sales-copy references.",
        bumpgradeUsesItFor: "Drafting page blocks and product promise context.",
        reviewBeforePrivatePlan: "Check which public claims, images, and policies should appear in the first launch.",
      },
      {
        id: "shopify-launch-offer-notes",
        label: "Launch offer notes",
        bring: "Bundle, discount, preorder, fulfillment, or delivery notes for the selected launch.",
        bumpgradeUsesItFor: "Shaping the Bumpgrade checkout-offer path around the product context.",
        reviewBeforePrivatePlan: "Review fulfillment boundaries before any buyer-facing checkout is enabled.",
      },
    ],
    unsupportedNow: [...universalUnsupported, "Full store theme migration", "Inventory or fulfillment system replacement"],
    firstReviewSteps: [
      "Choose the product or collection tied to the launch.",
      "Attach product exports, public URLs, images, and offer notes.",
      "Review the Bumpgrade offer path before replacing any live store flow.",
    ],
    agentContract:
      "Agents can plan Shopify imports for focused publisher offers, product context, and page context. Bumpgrade is not claiming full store theme, inventory, or fulfillment migration.",
  },
  {
    id: "importer-podia",
    competitorId: podia.id,
    platformName: podia.name,
    slug: "podia",
    status: "private-draft-live",
    route: "/imports/podia",
    compareRoute: compareRouteFor(podia),
    sourceIds: podia.sourceIds ?? [podia.sourceId],
    priority: 60,
    headline: "Import Podia creator-product context.",
    summary:
      "Bring digital-product, checkout, email, and page notes into Bumpgrade so the launch path can be reviewed before customers see it.",
    bestFor: "Creators moving products, pages, and audience notes into one launch workspace.",
    inputs: [importInputs.public_url, importInputs.export_file, importInputs.csv_upload, importInputs.manual_paste],
    importableAreas: [
      {
        id: "podia-products",
        label: "Digital products",
        draftEntities: ["draft_product_catalog", "asset_reference"],
        description: "Map products, downloads, memberships, and access notes.",
      },
      {
        id: "podia-audience-pages",
        label: "Pages and audience",
        draftEntities: ["draft_funnel", "draft_page_blocks", "draft_audience_import", "draft_sequence_outline"],
        description: "Bring landing pages, checkout notes, and email context into one private review.",
      },
    ],
    sourceChecklist: [
      {
        id: "podia-product-context",
        label: "Digital product details",
        bring: "Product names, descriptions, prices, modules, downloads, memberships, and access notes.",
        bumpgradeUsesItFor: "Preparing private product-catalog and access-review sections.",
        reviewBeforePrivatePlan: "Confirm what customers should receive and which private files stay outside the import.",
      },
      {
        id: "podia-page-checkout-context",
        label: "Sales and checkout pages",
        bring: "Public sales page URLs, checkout notes, coupons, testimonials, and product promise copy.",
        bumpgradeUsesItFor: "Drafting the private funnel and checkout-offer review.",
        reviewBeforePrivatePlan: "Check that the product promise and price path match what you want to launch.",
      },
      {
        id: "podia-audience-email-context",
        label: "Audience and email notes",
        bring: "Email list segments, opt-in copy, launch sequence notes, and follow-up messages.",
        bumpgradeUsesItFor: "Creating audience and sequence outlines while sends remain off.",
        reviewBeforePrivatePlan: "Review consent and message intent before any future automation work.",
      },
    ],
    unsupportedNow: [...universalUnsupported, "Private member comments", "Live email campaign transfer"],
    firstReviewSteps: [
      "Choose the product or list segment to move first.",
      "Attach product, page, checkout, and email context.",
      "Review what should become public only after the workspace is ready.",
    ],
    agentContract:
      "Agents can plan Podia imports across product, page, checkout, and audience context. Private member comments and live campaign transfer remain unsupported.",
  },
  {
    id: "importer-systeme",
    competitorId: systeme.id,
    platformName: systeme.name,
    slug: "systeme-io",
    status: "private-draft-live",
    route: "/imports/systeme-io",
    compareRoute: compareRouteFor(systeme),
    sourceIds: systeme.sourceIds ?? [systeme.sourceId],
    priority: 70,
    headline: "Import Systeme.io launch paths into Bumpgrade.",
    summary:
      "Map funnels, pages, email structure, products, and affiliate notes into a private workspace with clear go-live gates.",
    bestFor: "Teams replacing a broad all-in-one stack with Bumpgrade's publisher launch workflow.",
    inputs: [importInputs.public_url, importInputs.export_file, importInputs.csv_upload, importInputs.manual_paste],
    importableAreas: [
      {
        id: "systeme-funnels-email",
        label: "Funnels and email",
        draftEntities: ["draft_funnel", "draft_page_blocks", "draft_audience_import", "draft_sequence_outline"],
        description: "Carry page order, opt-ins, follow-up intent, tags, and sequence structure into review.",
      },
      {
        id: "systeme-commerce-affiliate",
        label: "Commerce and partner notes",
        draftEntities: ["draft_checkout_offer", "draft_product_catalog"],
        description: "Attach offer, product, and partner-program notes without creating payable obligations.",
      },
    ],
    sourceChecklist: [
      {
        id: "systeme-funnel-path",
        label: "Funnel path",
        bring: "Funnel URLs, page exports, opt-in pages, sales pages, order pages, and thank-you pages.",
        bumpgradeUsesItFor: "Building a private funnel map and page-block review.",
        reviewBeforePrivatePlan: "Confirm the page order and which branch should become the first Bumpgrade launch path.",
      },
      {
        id: "systeme-email-tags",
        label: "Email and tag notes",
        bring: "Campaign outlines, tag meanings, sequence timing, and audience export summaries.",
        bumpgradeUsesItFor: "Drafting audience and sequence context without sending or enrolling anyone.",
        reviewBeforePrivatePlan: "Review consent and send boundaries before importing audience context.",
      },
      {
        id: "systeme-products-partners",
        label: "Product and partner notes",
        bring: "Product, pricing, affiliate, coupon, and payout-rule notes for the launch.",
        bumpgradeUsesItFor: "Preparing offer, product, and partner-context review without payable obligations.",
        reviewBeforePrivatePlan: "Check which partner rules are just notes and which need later owner approval.",
      },
    ],
    unsupportedNow: [...universalUnsupported, "Automatic affiliate payout migration", "Live SMS or email sending"],
    firstReviewSteps: [
      "Choose the funnel, product, or email path that matters most.",
      "Attach pages, exports, and pasted campaign notes.",
      "Review products, partners, and sends before any public action.",
    ],
    agentContract:
      "Agents can plan Systeme.io imports for funnels, audience, products, and partner notes. Live sends, SMS, and payable affiliate migration remain outside this contract.",
  },
  {
    id: "importer-kartra",
    competitorId: kartra.id,
    platformName: kartra.name,
    slug: "kartra",
    status: "private-draft-live",
    route: "/imports/kartra",
    compareRoute: compareRouteFor(kartra),
    sourceIds: kartra.sourceIds ?? [kartra.sourceId],
    priority: 80,
    headline: "Import Kartra campaign context with safer review.",
    summary:
      "Bring pages, funnels, memberships, videos, webinars, checkouts, affiliate notes, and follow-up intent into a private review before launch.",
    bestFor: "Operators replacing a marketing-suite campaign with a simpler Bumpgrade launch workspace.",
    inputs: [importInputs.public_url, importInputs.export_file, importInputs.csv_upload, importInputs.manual_paste],
    importableAreas: [
      {
        id: "kartra-campaign",
        label: "Campaign pages",
        draftEntities: ["draft_funnel", "draft_page_blocks", "asset_reference"],
        description: "Map campaign pages, video or webinar references, and offer handoffs.",
      },
      {
        id: "kartra-membership-commerce",
        label: "Membership and checkout",
        draftEntities: ["draft_product_catalog", "draft_checkout_offer", "draft_sequence_outline"],
        description: "Capture product access, checkout, affiliate, and follow-up structure.",
      },
    ],
    sourceChecklist: [
      {
        id: "kartra-campaign-pages",
        label: "Campaign pages",
        bring: "Campaign page URLs, page exports, video references, webinar references, and offer handoff notes.",
        bumpgradeUsesItFor: "Drafting the private campaign page order and asset checklist.",
        reviewBeforePrivatePlan: "Confirm which campaign pieces matter before creating the private plan.",
      },
      {
        id: "kartra-membership-access",
        label: "Membership and product access",
        bring: "Membership levels, product descriptions, checkout notes, and access promises.",
        bumpgradeUsesItFor: "Preparing product-catalog, access, and checkout-offer review sections.",
        reviewBeforePrivatePlan: "Review what should become protected access and what stays reference-only.",
      },
      {
        id: "kartra-affiliate-follow-up",
        label: "Affiliate and follow-up notes",
        bring: "Affiliate terms, campaign follow-up notes, webinar reminders, and post-purchase messages.",
        bumpgradeUsesItFor: "Capturing partner and sequence context without sending or creating payable obligations.",
        reviewBeforePrivatePlan: "Check partner and webinar boundaries before any future live workflow is connected.",
      },
    ],
    unsupportedNow: [...universalUnsupported, "Hosted video transfer", "Live webinar provider migration"],
    firstReviewSteps: [
      "Choose one campaign or membership path.",
      "Attach URLs, files, product notes, and follow-up notes.",
      "Review campaign pieces before connecting public pages or checkout.",
    ],
    agentContract:
      "Agents can plan Kartra imports for campaign pages, products, checkout, affiliate notes, and webinar references. Hosted video transfer and live webinar migration are unsupported.",
  },
  {
    id: "importer-thrivecart",
    competitorId: thrivecart.id,
    platformName: thrivecart.name,
    slug: "thrivecart",
    status: "private-draft-live",
    route: "/imports/thrivecart",
    compareRoute: compareRouteFor(thrivecart),
    sourceIds: thrivecart.sourceIds ?? [thrivecart.sourceId],
    priority: 90,
    headline: "Import ThriveCart checkout paths into Bumpgrade.",
    summary:
      "Bring checkout, bump, upsell, downsell, product, affiliate, and fulfillment notes into one review before replacing buyer-facing flows.",
    bestFor: "Sellers who want checkout optimization to connect with the wider launch system.",
    inputs: [importInputs.public_url, importInputs.export_file, importInputs.csv_upload, importInputs.manual_paste],
    importableAreas: [
      {
        id: "thrivecart-checkout",
        label: "Checkout path",
        draftEntities: ["draft_checkout_offer", "draft_product_catalog"],
        description: "Map checkout, order bumps, upsells, downsells, payment options, and fulfillment notes.",
      },
      {
        id: "thrivecart-affiliate-context",
        label: "Partner context",
        draftEntities: ["draft_checkout_offer"],
        description: "Carry affiliate-program notes into Bumpgrade without creating payable commission changes.",
      },
    ],
    sourceChecklist: [
      {
        id: "thrivecart-checkout-path",
        label: "Checkout path",
        bring: "Checkout URLs, checkout export files, payment option notes, coupon details, and guarantee copy.",
        bumpgradeUsesItFor: "Preparing the private checkout-offer review around the main buying path.",
        reviewBeforePrivatePlan: "Confirm the checkout promise and payment shape before any Bumpgrade checkout is created.",
      },
      {
        id: "thrivecart-bump-upsell-downsell",
        label: "Bump, upsell, and downsell path",
        bring: "Order bump, upsell, downsell, cart-abandonment, and post-purchase offer notes.",
        bumpgradeUsesItFor: "Mapping the offer stack and buyer handoff sequence.",
        reviewBeforePrivatePlan: "Review the exact order and which offers should ship in the first launch.",
      },
      {
        id: "thrivecart-product-partner-rules",
        label: "Product and partner rules",
        bring: "Product fulfillment notes, affiliate terms, tax or invoice notes, and partner payout rules.",
        bumpgradeUsesItFor: "Capturing product and partner context while payable ledgers stay off.",
        reviewBeforePrivatePlan: "Check which partner rules are evidence only and which require later owner approval.",
      },
    ],
    unsupportedNow: [...universalUnsupported, "Payment processor credential transfer", "Payable affiliate ledger migration"],
    firstReviewSteps: [
      "Choose the checkout path to move first.",
      "Attach checkout pages, offer notes, product details, and partner rules.",
      "Review billing, fulfillment, and partner boundaries before going live.",
    ],
    agentContract:
      "Agents can plan ThriveCart imports for checkout paths, offers, products, and partner notes. Payment credentials and payable affiliate ledgers are not imported.",
  },
];

export const importerRoutes = importerPlatforms.map((platform) => platform.route);

export const featuredImporter = importerPlatforms.find((platform) => platform.id === "importer-clickfunnels") ?? importerPlatforms[0];

export function importerExportMatchTemplates(platform: ImporterPlatform): ImporterExportMatchTemplate[] {
  if (platform.slug === "samcart" || platform.slug === "thrivecart") {
    const sourceChecklistItemIds =
      platform.slug === "samcart"
        ? ["samcart-checkout-page", "samcart-bump-upsell-path"]
        : ["thrivecart-checkout-path", "thrivecart-bump-upsell-downsell"];

    return [
      template(platform, {
        id: "checkout-order-export",
        label: `${platform.platformName} checkout or order export`,
        fileKinds: ["CSV", "JSON"],
        requiredHeaderLabels: [headerLabels.productOrOffer, headerLabels.checkoutOrOrder],
        helpfulHeaderLabels: [headerLabels.pageOrUrl, headerLabels.subscriberOrCustomer, headerLabels.statusOrDate],
        signalLabels: [
          signalLabel("parsed_export_structure"),
          signalLabel("page_or_offer_copy"),
          signalLabel("source_url"),
        ],
        sourceChecklistItemIds,
        draftEntities: ["draft_checkout_offer", "draft_product_catalog"],
        usesItFor: "Recognizing checkout offers, order context, bumps, upsells, and product records before private draft creation.",
        reviewPrompt: "Confirm product names, prices, order shape, and which offer path should become the first Bumpgrade launch.",
      }),
    ];
  }

  if (platform.slug === "kit") {
    return [
      template(platform, {
        id: "subscriber-tag-export",
        label: "Kit subscriber and tag export",
        fileKinds: ["CSV", "JSON"],
        requiredHeaderLabels: [headerLabels.subscriberOrCustomer, headerLabels.tagOrSegment],
        helpfulHeaderLabels: [headerLabels.name, headerLabels.statusOrDate],
        signalLabels: [
          signalLabel("parsed_export_structure"),
          signalLabel("audience_context"),
          signalLabel("follow_up_notes"),
        ],
        sourceChecklistItemIds: ["kit-subscriber-tags", "kit-sequence-outline"],
        draftEntities: ["draft_audience_import", "draft_sequence_outline"],
        usesItFor: "Recognizing audience segments, tags, and sequence context while subscriber sends stay disabled.",
        reviewPrompt: "Review consent, tags, and suppression context before any private audience import plan is saved.",
      }),
    ];
  }

  if (platform.slug === "clickfunnels" || platform.slug === "systeme" || platform.slug === "kartra") {
    const sourceChecklistItemIds =
      platform.slug === "clickfunnels"
        ? ["clickfunnels-page-order", "clickfunnels-offer-stack"]
        : platform.slug === "systeme"
          ? ["systeme-funnel-path", "systeme-products-partners"]
          : ["kartra-campaign-pages", "kartra-membership-access"];

    return [
      template(platform, {
        id: "funnel-page-export",
        label: `${platform.platformName} funnel page export`,
        fileKinds: ["CSV", "JSON", "HTML"],
        requiredHeaderLabels: [headerLabels.pageOrUrl, headerLabels.productOrOffer],
        helpfulHeaderLabels: [headerLabels.checkoutOrOrder, headerLabels.statusOrDate],
        signalLabels: [
          signalLabel("parsed_export_structure"),
          signalLabel("source_url"),
          signalLabel("page_or_offer_copy"),
        ],
        sourceChecklistItemIds,
        draftEntities: ["draft_funnel", "draft_page_blocks", "draft_checkout_offer"],
        usesItFor: "Recognizing page order, offer context, and launch path before a private funnel draft is created.",
        reviewPrompt: "Confirm which pages belong in the first launch path and which pages should stay parked.",
      }),
    ];
  }

  if (platform.slug === "kajabi" || platform.slug === "podia") {
    const sourceChecklistItemIds =
      platform.slug === "kajabi"
        ? ["kajabi-product-outline", "kajabi-email-access-context"]
        : ["podia-product-context", "podia-audience-email-context"];

    return [
      template(platform, {
        id: "product-member-export",
        label: `${platform.platformName} product or member export`,
        fileKinds: ["CSV", "JSON"],
        requiredHeaderLabels: [headerLabels.productOrOffer, headerLabels.subscriberOrCustomer],
        helpfulHeaderLabels: [headerLabels.name, headerLabels.statusOrDate],
        signalLabels: [
          signalLabel("parsed_export_structure"),
          signalLabel("page_or_offer_copy"),
          signalLabel("audience_context"),
        ],
        sourceChecklistItemIds,
        draftEntities: ["draft_product_catalog", "draft_audience_import"],
        usesItFor: "Recognizing product catalog and member context while protected access and fulfillment stay off.",
        reviewPrompt: "Check product access promises, membership state, and what should remain private before go-live.",
      }),
    ];
  }

  if (platform.slug === "shopify") {
    return [
      template(platform, {
        id: "product-order-export",
        label: "Shopify product or order export",
        fileKinds: ["CSV", "JSON"],
        requiredHeaderLabels: [headerLabels.productOrOffer, headerLabels.checkoutOrOrder],
        helpfulHeaderLabels: [headerLabels.subscriberOrCustomer, headerLabels.statusOrDate],
        signalLabels: [
          signalLabel("parsed_export_structure"),
          signalLabel("page_or_offer_copy"),
          signalLabel("audience_context"),
        ],
        sourceChecklistItemIds: ["shopify-product-collection", "shopify-launch-offer-notes"],
        draftEntities: ["draft_product_catalog", "draft_checkout_offer"],
        usesItFor: "Recognizing products, prices, and order context for a private Bumpgrade offer plan.",
        reviewPrompt: "Confirm which products belong in the first launch bundle and which order history is reference-only.",
      }),
    ];
  }

  return [
    template(platform, {
      id: "general-export",
      label: `${platform.platformName} export structure`,
      fileKinds: ["CSV", "JSON", "HTML", "plain text"],
      requiredHeaderLabels: [headerLabels.productOrOffer],
      helpfulHeaderLabels: [headerLabels.pageOrUrl, headerLabels.subscriberOrCustomer, headerLabels.statusOrDate],
      signalLabels: [signalLabel("parsed_export_structure"), signalLabel("page_or_offer_copy")],
      sourceChecklistItemIds: platform.sourceChecklist.slice(0, 2).map((item) => item.id),
      draftEntities: Array.from(new Set(platform.importableAreas.flatMap((area) => area.draftEntities))).slice(0, 3),
      usesItFor: "Recognizing the strongest importable shape before private draft creation.",
      reviewPrompt: "Confirm the source context before saving a private import plan.",
    }),
  ];
}

export function privateDraftImportCapabilityForPlatform(platform: ImporterPlatform) {
  return {
    id: importerDraftImportCapabilityId(platform.id),
    status: "live",
    issue: importerIssue,
    platformId: platform.id,
    platformName: platform.platformName,
    route: platform.route,
    privateRecordReviewRoute: importerPrivateRecordReviewRoute(platform.slug),
    privateRecordReviewActionApiRoute: importerPrivateRecordReviewActionApiRoute(platform.slug),
    previewApiRoute: importerDraftPreviewApiRoute(platform.slug),
    apiRoute: importerDraftImportApiRoute(platform.slug),
    confirmationText: importerDraftImportConfirmationText(platform.platformName),
    auth: "verified publisher session",
    creates: [
      "free_build_workspace_if_needed",
      "private_draft_funnel",
      "private_import_export_review_metadata",
      "private_structured_import_records",
      "funnel_audit_event",
    ],
    accepts: platform.inputs.map((input) => input.kind),
    draftEntities: Array.from(new Set(platform.importableAreas.flatMap((area) => area.draftEntities))),
    redaction: {
      rawExportFilesIncluded: false,
      customerRowsIncluded: false,
      privateEmailsIncluded: false,
      paymentCredentialsIncluded: false,
      sessionCookiesIncluded: false,
      rawPastedMaterialIncludedInResponse: false,
    },
    goLiveEffects: {
      publicPublishingEnabled: false,
      liveCheckoutEnabled: false,
      subscriberSendsEnabled: false,
      customDomainsEnabled: false,
      fulfillmentEnabled: false,
    },
    preflightReview: {
      route: importerDraftPreviewApiRoute(platform.slug),
      auth: "public redacted preflight",
      writesRecords: false,
      createsDraft: false,
      rawSourceEchoed: false,
      goLiveEffectsEnabled: false,
      responseFields: [
        "inputSummary",
        "sourceChecklistReview",
        "exportFileAnalysis",
        "platformExportMatches",
        "detectedAreas",
        "safetyGates",
      ],
      exportFileAnalysis: importerExportPreflightParser,
    },
    privateDraftExportReview: {
      responseField: "importReview",
      storedOn: "private_draft_metadata_json",
      storesSafeExportAnalysis: true,
      storesPlatformExportMatches: true,
      storesRecognizedPlatformExportMatchIds: true,
      rawExportFilesIncluded: false,
      rawFileNamesEchoed: false,
      rawRowsEchoed: false,
      rawTextEchoed: false,
      rawSourceEchoed: false,
      goLiveEffectsEnabled: false,
    },
    privateStructuredImportRecords: {
      ...importerPrivateStructuredRecords,
      recordKinds: Array.from(new Set(platform.importableAreas.flatMap((area) => area.draftEntities))),
    },
    privateRecordReview: {
      id: importerPrivateRecordReviewCapabilityId(platform.id),
      status: "live",
      route: importerPrivateRecordReviewRoute(platform.slug),
      actionApiRoute: importerPrivateRecordReviewActionApiRoute(platform.slug),
      auth: "verified publisher session",
      requires: ["draft query parameter", "same owner as private import plan"],
      reads: [
        "private_draft_funnel_summary",
        "competitor_import_private_records",
        "competitor_import_subscriber_records",
        "audience_subscribers",
        "audience_tag_assignments",
      ],
      responseFields: [
        "draft",
        "importRecords",
        "extractedFields",
        "subscriberImportDepth",
        "subscriberImportPreflight",
        "subscriberImportCreation",
        "subscriberAudiencePromotion",
        "subscriberPrivateExport",
        "privateSubscriberRecords",
        "recordConfidence",
        "reviewDecision",
        "goLiveEffects",
        "redaction",
      ],
      privateSubscriberRecordInspectionLive: true,
      privateSubscriberRecordInspectionReviewField: importerPrivateStructuredRecords.subscriberImportRecordInspectionReviewField,
      privateSubscriberRecordInspectionDisplayLimit: importerPrivateStructuredRecords.subscriberImportRecordInspectionDisplayLimit,
      ownerReviewCanShowPrivateSubscriberEmails: true,
      publicResponsesIncludePrivateSubscriberEmails: false,
      unauthenticatedResponsesIncludePrivateSubscriberEmails: false,
      subscriberAudiencePromotionLive: true,
      subscriberAudiencePromotionReviewField: importerPrivateStructuredRecords.subscriberAudiencePromotionResponseField,
      subscriberAudiencePromotionCreatesGlobalAudienceSubscriberRows: true,
      subscriberAudiencePromotionCreatesConsentEvents: false,
      subscriberAudiencePromotionSubscriberStatus: importerPrivateStructuredRecords.subscriberAudiencePromotionSourceStatus,
      subscriberAudiencePromotionRequiresConsentReviewBeforeSending: true,
      subscriberPrivateExportLive: true,
      subscriberPrivateExportResponseField: importerPrivateStructuredRecords.subscriberPrivateExportResponseField,
      subscriberPrivateExportFormat: importerPrivateStructuredRecords.subscriberPrivateExportFormat,
      subscriberPrivateExportOwnerOnly: true,
      subscriberPrivateExportIncludesPrivateEmailsInDownload: true,
      subscriberPrivateExportIncludesPrivateEmailsInJsonResponse: false,
      subscriberPrivateExportPublicSourceDataIncludesContactValues: false,
      actions: [
        {
          decision: "ready",
          confirmationText: importerPrivateRecordReviewConfirmationText(platform.platformName, "ready"),
        },
        {
          decision: "needs_cleanup",
          confirmationText: importerPrivateRecordReviewConfirmationText(platform.platformName, "needs_cleanup"),
        },
        {
          action: "edit_extracted_field",
          confirmationText: importerPrivateRecordExtractedFieldEditConfirmationText(platform.platformName),
          editableFields: importerPrivateStructuredRecords.extractedFieldEditableFields,
          statusValues: importerPrivateStructuredRecords.extractedFieldStatusValues,
        },
        {
          action: "record_subscriber_import_preflight",
          responseField: "subscriberImportPreflight",
          appliesTo: importerPrivateStructuredRecords.subscriberImportPreflightAppliesTo,
          decisions: [
            {
              status: "ready_for_import_planning",
              confirmationText: importerPrivateRecordSubscriberPreflightConfirmationText(
                platform.platformName,
                "ready_for_import_planning",
              ),
            },
            {
              status: "needs_cleanup",
              confirmationText: importerPrivateRecordSubscriberPreflightConfirmationText(platform.platformName, "needs_cleanup"),
            },
          ],
        },
        {
          action: "create_subscriber_import_records",
          responseField: "subscriberImportCreation",
          appliesTo: importerPrivateStructuredRecords.subscriberImportCreationAppliesTo,
          confirmationText: importerPrivateRecordSubscriberImportConfirmationText(platform.platformName),
          accepts: ["exportFiles", "exportManifest", "subscriberImportRows"],
        },
        {
          action: "promote_subscriber_import_records_to_audience",
          responseField: "subscriberAudiencePromotion",
          appliesTo: importerPrivateStructuredRecords.subscriberAudiencePromotionAppliesTo,
          confirmationText: importerPrivateRecordSubscriberAudiencePromotionConfirmationText(platform.platformName),
          writes: importerPrivateStructuredRecords.subscriberAudiencePromotionStorage,
          subscriberStatus: importerPrivateStructuredRecords.subscriberAudiencePromotionSourceStatus,
        },
        {
          action: "export_private_subscriber_records",
          responseField: "subscriberPrivateExport",
          appliesTo: importerPrivateStructuredRecords.subscriberPrivateExportAppliesTo,
          confirmationText: importerPrivateRecordSubscriberPrivateExportConfirmationText(platform.platformName),
          format: importerPrivateStructuredRecords.subscriberPrivateExportFormat,
          ownerOnly: true,
        },
      ],
      writes: [
        "record_review_decision_metadata",
        "extracted_field_plan_metadata",
        "subscriber_import_preflight_metadata",
        "private_subscriber_import_records",
        "global_audience_subscriber_review_rows",
        "audience_import_tag_assignments",
        "private_subscriber_export_metadata",
      ],
      idempotencyRequired: true,
      rawRowsEchoed: false,
      rawTextEchoed: false,
      rawExportFileNamesEchoed: false,
      rawExtractedValuesStored: false,
      subscriberRowsCreated: true,
      globalAudienceSubscriberRowsCreated: true,
      consentEventsCreated: false,
      sequenceEnrollmentsCreated: false,
      subscriberSendsEnabled: false,
      privateExportsEnabled: true,
      publicExportsEnabled: false,
      customerRowsIncluded: false,
      privateEmailsIncludedInOwnerReview: true,
      privateEmailsIncludedInPublicResponses: false,
      confirmationTextStored: false,
      idempotencyKeysIncluded: false,
      goLiveEffectsEnabled: false,
    },
    rollback: {
      route: importerDraftRollbackApiRoute(platform.slug),
      confirmationText: importerDraftRollbackConfirmationText(platform.platformName),
      auth: "verified publisher session",
      archives: ["private_draft_funnel"],
      deletesRecords: false,
      preservesPrivateStructuredImportRecords: true,
      restartsAvailable: true,
      rawSourceEchoed: false,
      goLiveEffectsEnabled: false,
    },
    duplicateProtection:
      "Idempotency replays the same private draft. Source-match duplicate review reuses an existing private draft when platform, workspace, normalized title, and normalized source URL or export file name match.",
    duplicateReview: {
      responseField: "duplicateReview",
      statuses: ["created", "idempotent_replay", "source_match_reused"],
      checkedFields: ["source_platform", "target_workspace", "normalized_title", "source_url", "source_file_name"],
      sourceUrlMatchingLive: true,
      sourceFileNameMatchingLive: true,
      rawSourceEchoed: false,
    },
  };
}

export const importerDraftImportCapabilities = importerPlatforms.map(privateDraftImportCapabilityForPlatform);

export function importerPlatformSourceData(platform: ImporterPlatform): Omit<ImporterPlatform, "sourceChecklist"> & {
  sourceChecklist: ImportSourceChecklistSourceDataItem[];
  exportMatchTemplates: ImporterExportMatchTemplate[];
} {
  return {
    ...platform,
    sourceChecklist: platform.sourceChecklist.map((item) => ({
      ...item,
      preflightSignals: sourceChecklistPreflightSignals(item),
    })),
    exportMatchTemplates: importerExportMatchTemplates(platform),
  };
}

export function getImporterBySlug(slug: string) {
  return importerPlatforms.find((platform) => platform.slug === slug);
}

export function getImporterForCompetitor(competitorId: string) {
  return importerPlatforms.find((platform) => platform.competitorId === competitorId);
}

export const importerSourceData = {
  id: "bumpgrade-competitor-importer-source-data",
  updatedAt: importerUpdatedAt,
  issue: importerIssue,
  status: "private-draft-live",
  generatedFrom: "src/lib/importers.ts",
  routes: [importerHubRoute, importerSourceDataRoute, ...importerRoutes],
  currentAvailability: {
    publicImporterPagesLive: true,
    clickFunnelsPrivateDraftImportLive: true,
    allDedicatedPrivateDraftImportersLive: true,
    privateDraftImportPlatformIds: importerPlatforms.map((platform) => platform.id),
    otherDedicatedImportPathsLive: true,
    preflightReviewLive: true,
    sourceMatchDuplicateReviewLive: true,
    sourceFileNameDuplicateReviewLive: true,
    privateDraftRollbackLive: true,
    platformSpecificExtractionGuidanceLive: true,
    platformSpecificPreflightExtractionLive: true,
    exportFilePreflightParsingLive: true,
    platformExportMatchTemplatesLive: true,
    privateDraftExportReviewMetadataLive: true,
    privateStructuredImportRecordsLive: true,
    privateStructuredImportRecordReviewLive: true,
    privateStructuredImportRecordReviewActionsLive: true,
    privateStructuredImportRecordFieldExtractionLive: true,
    privateStructuredImportRecordFieldEditingLive: true,
    privateSubscriberImportDepthLive: true,
    privateSubscriberImportPreflightActionsLive: true,
    privateSubscriberImportCreationLive: true,
    privateSubscriberImportRecordInspectionLive: true,
    privateSubscriberAudiencePromotionLive: true,
    privateSubscriberExportLive: true,
    paidGoLiveRequired: true,
  },
  commonContract: {
    importedContentLandsAs: "private Bumpgrade import plans and structured private import records",
    goLiveRequires: [
      "paid publisher plan where required",
      "explicit owner approval",
      "public publishing gate",
      "checkout/billing gate",
      "subscriber-send gate",
      "fulfillment/access gate",
    ],
    duplicateReview:
      "Private draft writes return duplicateReview.status as created, idempotent_replay, or source_match_reused. Source-match reuse is live for normalized source URLs or normalized export file names inside the same platform, target workspace, and normalized title.",
    preflightReview:
      "Public preflight review routes return a redacted import map before private draft creation. They review each platform sourceChecklist item against supplied source signals and parsed export-file structure, then report ready, needs-more-context, or needs-source status without persisting records, requiring payment, publishing pages, running checkout, sending subscribers, connecting domains, enabling fulfillment, or echoing pasted source material, export file names, raw rows, or raw file text.",
    rollback:
      "Verified publisher rollback routes archive private importer-created launch plans without deleting saved plan content, steps, or audit history. Archived importer plans are no longer reused by source-match duplicate review, so the same source can be restarted as a fresh private plan.",
    platformSpecificExtractionGuidance:
      "Each dedicated importer includes a sourceChecklist and exportMatchTemplates that explain which platform-specific URLs, exports, files, and notes Bumpgrade can use before a private import plan is created. Public preview routes return redacted sourceChecklistReview items, exportFileAnalysis summaries, and platformExportMatches with matched signal/header labels only, not the raw source values. Verified private draft creation stores the same safe export analysis, platform export matches, and recognized match IDs in private draft metadata as importReview, then creates private structured import records for matched review areas, still without raw rows, raw file text, export file-name echo, customer rows, payment credentials, or go-live side effects.",
    exportFilePreflightParser: importerExportPreflightParser,
    privateDraftExportReview:
      "Verified private importer writes return importReview and store that redacted export analysis on new private draft metadata so the recognized export shape survives the handoff after sign-in. Idempotent replays and source-match reuse report importReview without rewriting the existing private draft metadata.",
    privateStructuredImportRecords:
      "Verified private importer writes return importRecords and save structured private review records derived from safe importReview metadata. Records cover matched funnel, page-block, offer, product, audience, sequence, and asset areas as applicable; a verified-publisher private review route can inspect those records for the same owner, mark each record ready or needing cleanup, inspect saved private importer subscriber records after confirmed creation, add those saved contacts to the audience review list as imported-pending rows, and download an owner-only private subscriber CSV. Public source-data exposes only the contract and counts, not private record content, raw rows, raw file text, raw export file names, customer rows, private subscriber emails, payment credentials, idempotency keys, confirmation text, or go-live effects.",
    privateStructuredImportRecordFieldExtraction:
      "Private importRecords now include extractedFields: safe target field labels and review prompts derived from matched header labels, signal labels, and record kind. Audience import records also include subscriberImportDepth with aggregate contact-row counts and safe identity/tag/consent/sequence signals. The owner review page can show and edit field labels, review status, and review prompts, record a subscriberImportPreflight decision, create private importer subscriber records from a confirmed re-upload or paste, inspect those saved private contacts as the same verified owner, add them to the audience review list, and download an owner-only private subscriber CSV without exposing raw row values, file names, pasted source text, customer values, credentials, sequence enrollments, sends, public exports, or go-live effects.",
    privateSubscriberImportDepth:
      "Private audience import records include subscriberImportDepth: aggregate contact-row counts plus safe identity, tag/segment, consent/status, and sequence-context signals derived from headers and source signals only. It helps the owner review subscriber import readiness without creating subscriber rows, storing raw emails/names/contact rows, enrolling sequences, sending email, exporting private data, or enabling go-live effects.",
    privateSubscriberImportPreflight:
      "Verified publishers can record subscriberImportPreflight on private audience import records from the private review page after exact confirmation and idempotency. The action stores only readiness/cleanup metadata, aggregate depth references, and acknowledged go-live blockers; it creates no subscriber rows, no sequence enrollments, no private exports, no email sends, and no buyer-facing effects.",
    privateSubscriberImportCreation:
      "Verified publishers can create private importer subscriber records from an audience import review after exact confirmation, idempotency, and a fresh export upload or paste. The records are scoped to the private import plan and can store normalized private subscriber email/name data server-side for later owner review, but public responses and source-data expose counts only; this creation step does not create global audience subscriber rows, sequence enrollments, sends, exports, checkout, domains, fulfillment, or go-live effects.",
    privateSubscriberRecordInspection:
      "Verified publishers can inspect saved private importer subscriber records from their same-owner private review page after subscriber import creation. The owner review can show saved private contact emails, names, source status, and tag labels; public source-data, public preview routes, unauthenticated API responses, and agent-readable public contracts expose only counts, field names, and redaction rules.",
    privateSubscriberAudiencePromotion:
      "Verified publishers can add saved private importer subscriber records to Bumpgrade's audience review list after exact confirmation and idempotency. The action writes audience_subscribers rows with imported_pending_review status and non-sending tag assignments, but creates no consent events, sequence enrollments, provider sends, public exports, checkout, domains, fulfillment, or go-live effects. Public and unauthenticated responses stay redacted and expose counts only.",
    privateSubscriberExport:
      "Verified publishers can download a private owner-only CSV from saved importer subscriber records after exact confirmation and idempotency. The CSV response can include private contact emails because it requires the same verified owner session; public source-data, unauthenticated responses, and JSON API responses expose counts and redaction rules only. The export creates no consent events, sequence enrollments, sends, checkout, domains, fulfillment, or go-live effects.",
    privateStructuredRecords: importerPrivateStructuredRecords,
    preflightSignalLabels: importerPreflightSignalLabels,
    safetyGates: commonImporterSafetyGates,
    redaction:
      "Public importer source-data includes platform, source IDs, input kinds, saved private plan parts, safety gates, parser fields, and limitations only. Raw exports, raw rows, raw file text, export file names, customer rows, private subscriber emails, payment credentials, API keys, and session cookies stay out of public source-data and preview responses.",
    liveWriteActions: importerDraftImportCapabilities,
  },
  platforms: importerPlatforms.map(importerPlatformSourceData),
};
