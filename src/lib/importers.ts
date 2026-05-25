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
  unsupportedNow: string[];
  firstReviewSteps: string[];
  agentContract: string;
};

export const importerUpdatedAt = "2026-05-25";
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

export function importerDraftImportConfirmationText(platformName: string) {
  return `Create private ${platformName} import plan`;
}

export function importerDraftRollbackConfirmationText(platformName: string) {
  return `Archive private ${platformName} import plan`;
}

export function importerDraftImportCapabilityId(platformId: string) {
  return `${platformId.replace(/^importer-/, "")}-private-draft-import`;
}

export function importerDraftRollbackCapabilityId(platformId: string) {
  return `${platformId.replace(/^importer-/, "")}-private-draft-rollback`;
}

export const clickFunnelsDraftImportApiRoute = importerDraftImportApiRoute("clickfunnels");
export const clickFunnelsDraftPreviewApiRoute = importerDraftPreviewApiRoute("clickfunnels");
export const clickFunnelsDraftImportConfirmationText = importerDraftImportConfirmationText("ClickFunnels");

export const commonImporterSafetyGates = [
  "Imported material starts in a private workspace and does not publish public pages.",
  "A paid go-live state is required before imported pages, checkout paths, sends, domains, or fulfillment become buyer-facing.",
  "The importer shows a review step before creating Bumpgrade records.",
  "Duplicate review reuses existing private import work when the source platform, target workspace, normalized title, and normalized source URL or export file name match.",
  "Rollback archives private import drafts without deleting draft rows, step rows, or audit rows, so the same source can be restarted cleanly.",
  "Write steps require owner authentication, exact confirmation, idempotency, current workspace state, and audit correlation.",
  "Public source-data excludes raw export files, customer rows, private emails, payment credentials, API keys, and session cookies.",
];

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
  creates: ["free_build_workspace_if_needed", "private_draft_funnel", "funnel_audit_event"],
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
      "Agents can read the ClickFunnels importer contract, input kinds, generated draft entity types, verified-publisher private draft API, safety gates, source IDs, and limitations from /imports/source-data. Agents must not claim live account-to-account transfer, customer password migration, live checkout migration, subscriber sends, domains, fulfillment, or public publishing from this importer.",
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

export function privateDraftImportCapabilityForPlatform(platform: ImporterPlatform) {
  return {
    id: importerDraftImportCapabilityId(platform.id),
    status: "live",
    issue: importerIssue,
    platformId: platform.id,
    platformName: platform.platformName,
    route: platform.route,
    previewApiRoute: importerDraftPreviewApiRoute(platform.slug),
    apiRoute: importerDraftImportApiRoute(platform.slug),
    confirmationText: importerDraftImportConfirmationText(platform.platformName),
    auth: "verified publisher session",
    creates: ["free_build_workspace_if_needed", "private_draft_funnel", "funnel_audit_event"],
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
  },
  rollback: {
    route: importerDraftRollbackApiRoute(platform.slug),
    confirmationText: importerDraftRollbackConfirmationText(platform.platformName),
    auth: "verified publisher session",
    archives: ["private_draft_funnel"],
    deletesRecords: false,
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
    paidGoLiveRequired: true,
  },
  commonContract: {
    importedContentLandsAs: "private Bumpgrade draft records",
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
      "Public preflight review routes return a redacted import map before private draft creation. They do not persist records, require payment, publish pages, run checkout, send subscribers, connect domains, enable fulfillment, or echo pasted source material or export file names.",
    rollback:
      "Verified publisher rollback routes archive private importer-created draft funnels without deleting draft rows, step rows, or audit rows. Archived importer drafts are no longer reused by source-match duplicate review, so the same source can be restarted as a fresh private plan.",
    safetyGates: commonImporterSafetyGates,
    redaction:
      "Public importer source-data includes platform, source IDs, input kinds, generated draft entity types, safety gates, and limitations only. Raw exports, customer rows, private emails, payment credentials, API keys, and session cookies stay out of public source-data.",
    liveWriteActions: importerDraftImportCapabilities,
  },
  platforms: importerPlatforms,
};
