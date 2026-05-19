import { getCloudflareContext } from "@opennextjs/cloudflare";

import { roadmapItems } from "@/lib/roadmap";

export type AdminDataSource = "d1" | "fixture" | "mixed";

export type AdminLink = {
  number?: number;
  label?: string;
  title?: string;
  url: string;
  kind?: string;
};

export type AdminRoadmapStatus = "idea" | "pending" | "active" | "blocked" | "live" | "parked";

export type AdminRoadmapRecord = {
  id: string;
  title: string;
  status: AdminRoadmapStatus;
  issueNumber: number | null;
  featureId: string | null;
  groupName: string;
  summary: string;
  publicEvidence: string[];
  nextMilestone: string;
  markAttention: string | null;
  sortOrder: number;
  updatedAt: string | null;
};

export type AdminWorkLogEntry = {
  id: string;
  title: string;
  agentName: string;
  agentKind: string;
  sessionName: string | null;
  promptFromMark: string;
  githubIssues: AdminLink[];
  closedPrs: AdminLink[];
  featuresUpdated: string[];
  roadmapUpdated: string[];
  userJourneysUpdated: string[];
  documentationUpdated: string[];
  validation: string[];
  flagsAttention: string | null;
  firstPromptAt: string;
  completedAt: string;
  relevantUrls: string[];
  prCommentUrl: string | null;
};

export type AdminUserJourney = {
  id: string;
  title: string;
  featureId: string;
  featureStatus: "live" | "pending";
  issueNumbers: number[];
  primaryUser: string;
  userGoal: string;
  sourceEvidence: string[];
  happyPath: string[];
  edgeCases: string[];
  agentAccess: string;
  validation: string[];
  sortOrder: number;
  updatedAt: string | null;
};

export type MarkAttentionItem = {
  id: string;
  category: "blocked" | "review" | "fyi";
  state: "open" | "read" | "ok" | "resolved";
  urgency: "high" | "medium" | "low";
  title: string;
  summary: string;
  details: string | null;
  requiredAction: string | null;
  responseInstructions: string | null;
  responseChannels?: MarkAttentionResponseChannel[];
  sessionName: string | null;
  sessionEmail: string | null;
  sourceAgent: string;
  sourceKind: string;
  links: AdminLink[];
  metadata: Record<string, unknown>;
  lastActivityAt: string;
  createdAt: string;
};

export type MarkAttentionResponseChannel = {
  id: "read_only" | "github_issue" | "project_email" | "codex_desktop";
  label: string;
  instructions: string;
  href: string | null;
};

export type AdminSurfaceData = {
  source: AdminDataSource;
  loadError: string | null;
  roadmapItems: AdminRoadmapRecord[];
  workLogEntries: AdminWorkLogEntry[];
  userJourneys: AdminUserJourney[];
  attentionItems: MarkAttentionItem[];
};

type D1RoadmapRow = {
  id: string;
  title: string;
  status: AdminRoadmapStatus;
  issue_number: number | null;
  feature_id: string | null;
  group_name: string;
  summary: string;
  public_evidence_json: string;
  next_milestone: string;
  mark_attention: string | null;
  sort_order: number;
  updated_at: number | null;
};

type D1WorkLogRow = {
  id: string;
  title: string;
  agent_name: string;
  agent_kind: string;
  session_name: string | null;
  prompt_from_mark: string;
  github_issues_json: string;
  closed_prs_json: string;
  features_updated_json: string;
  roadmap_updated_json: string;
  user_journeys_updated_json: string;
  documentation_updated_json: string;
  validation_json: string;
  flags_attention: string | null;
  first_prompt_at: number;
  completed_at: number;
  relevant_urls_json: string;
  pr_comment_url: string | null;
};

type D1JourneyRow = {
  id: string;
  title: string;
  feature_id: string;
  feature_status: "live" | "pending";
  issue_numbers_json: string;
  primary_user: string;
  user_goal: string;
  source_evidence_json: string;
  happy_path_json: string;
  edge_cases_json: string;
  agent_access: string;
  validation_json: string;
  sort_order: number;
  updated_at: number | null;
};

type D1AttentionRow = {
  id: string;
  category: "blocked" | "review" | "fyi";
  state: "open" | "read" | "ok" | "resolved";
  urgency: "high" | "medium" | "low";
  title: string;
  summary: string;
  details: string | null;
  required_action: string | null;
  response_instructions: string | null;
  session_name: string | null;
  session_email: string | null;
  source_agent: string;
  source_kind: string;
  links_json: string;
  metadata_json: string;
  last_activity_at: number;
  created_at: number;
};

function isoFromSeconds(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function isoFromRequiredSeconds(value: number) {
  return new Date(value * 1000).toISOString();
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function mapRoadmapStatus(status: string): AdminRoadmapStatus {
  if (status === "shipped") return "live";
  if (status === "next" || status === "planned") return "pending";
  if (status === "active" || status === "blocked") return status;
  return "pending";
}

const fallbackRoadmapItems: AdminRoadmapRecord[] = roadmapItems.map((item, index) => ({
  id: item.id,
  title: item.title,
  status: mapRoadmapStatus(item.status),
  issueNumber: item.issue,
  featureId: item.featureId ?? null,
  groupName: item.group,
  summary: item.summary,
  publicEvidence: item.publicEvidence,
  nextMilestone: item.nextMilestone,
  markAttention: item.markAttention ?? null,
  sortOrder: (index + 1) * 10,
  updatedAt: null,
}));

const fallbackWorkLogEntries: AdminWorkLogEntry[] = [
  {
    id: "work-log-2026-05-18-public-roadmap",
    title: "Shipped public roadmap and source data",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-bootstrap",
    promptFromMark: "Mark asked for a public roadmap inspired by the main feature set and for admin surfaces to stay current.",
    githubIssues: [{ number: 7, url: "https://github.com/markitics/bumpgrade/issues/7" }],
    closedPrs: [{ number: 27, url: "https://github.com/markitics/bumpgrade/pull/27" }],
    featuresUpdated: ["https://bumpgrade.com/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/admin/for-mark"],
    userJourneysUpdated: [],
    documentationUpdated: ["public/llms.txt", "src/app/agent-docs/bumpgrade-agent-surface/page.tsx"],
    validation: ["npm run verify", "npm run cf:build", "npm audit --omit=dev", "Cloudflare live smoke checks"],
    flagsAttention: "codex@bumpgrade.com shipped emails remain blocked by issue #10.",
    firstPromptAt: "2026-05-18T08:03:00.000Z",
    completedAt: "2026-05-18T09:45:51.000Z",
    relevantUrls: ["https://bumpgrade.com/roadmap", "https://bumpgrade.com/admin/for-mark"],
    prCommentUrl: "https://github.com/markitics/bumpgrade/pull/27#issuecomment-4476435044",
  },
];

const fallbackUserJourneys: AdminUserJourney[] = [
  {
    id: "journey-read-public-roadmap-source-data",
    title: "Read public roadmap source data",
    featureId: "feature-public-roadmap",
    featureStatus: "live",
    issueNumbers: [7, 8],
    primaryUser: "Future agent resuming Bumpgrade work",
    userGoal: "Recover shipped, active, blocked, next, and planned state without reading chat history.",
    sourceEvidence: ["https://bumpgrade.com/roadmap/source-data", "https://github.com/markitics/bumpgrade/pull/27"],
    happyPath: ["Fetch /roadmap/source-data.", "Find item IDs, statuses, issue links, evidence, and Mark-attention caveats.", "Continue the next issue without inventing state."],
    edgeCases: ["D1 may be unavailable locally, so pages can show fixture fallback.", "Private admin notes must not leak into public roadmap JSON."],
    agentAccess: "Agents can read the public-safe source data; writes must use approved D1 scripts or future confirmed APIs.",
    validation: ["/roadmap/source-data live smoke returned 200 JSON.", "Playwright test asserts stable roadmap records."],
    sortOrder: 20,
    updatedAt: null,
  },
  {
    id: "journey-agent-reads-bumpgrade-manifest",
    title: "Agent reads Bumpgrade manifest before acting",
    featureId: "feature-agent-ready-contracts",
    featureStatus: "live",
    issueNumbers: [12],
    primaryUser: "Codex, ChatGPT, Claude, or another capable agent",
    userGoal: "Understand what Bumpgrade can read, cite, and safely propose without scraping private admin UI or inventing state.",
    sourceEvidence: [
      "https://bumpgrade.com/agent-docs",
      "https://bumpgrade.com/agent-docs/source-data",
      "https://bumpgrade.com/agent-docs/bumpgrade-agent-surface",
      "https://github.com/markitics/bumpgrade/issues/12",
    ],
    happyPath: [
      "Open /agent-docs or fetch /agent-docs/source-data.",
      "Choose the relevant read contract for feature, roadmap, comparison, commerce, admin, or agent docs.",
      "Cite stable IDs, issue or PR evidence, source URLs, and retrieved dates.",
      "Use MCP roadmap entries only as planned tooling until the MCP server exists.",
      "Require confirmed-write safeguards before any public, billing-impacting, admin, or creator-speech write.",
    ],
    edgeCases: [
      "Human admin pages require Better Auth owner sessions and should not be scraped as a bypass.",
      "The manifest is public-safe discovery metadata, not permission to write.",
      "Volatile competitor pricing, packaging, and feature availability need current source refreshes.",
      "Live billing remains disabled until a separate rollout proves webhook evidence.",
    ],
    agentAccess:
      "Agents can read /agent-docs/source-data, /features/source-data, /roadmap/source-data, /compare/source-data, /commerce/source-data, and /admin/source-data; writes need approved scripts now and confirmed APIs later.",
    validation: [
      "Playwright covers /agent-docs pages and /agent-docs/source-data.",
      "The manifest exposes stable read contract IDs, evidence route IDs, MCP plan IDs, and write-safety rules.",
    ],
    sortOrder: 38,
    updatedAt: null,
  },
  {
    id: "journey-owner-opens-protected-admin",
    title: "Owner opens protected admin surfaces",
    featureId: "feature-better-auth",
    featureStatus: "live",
    issueNumbers: [9, 10, 55],
    primaryUser: "Mark as Bumpgrade owner",
    userGoal: "Sign in with a Bumpgrade owner account before viewing private admin roadmap, work-log, user-journey, or for-Mark pages.",
    sourceEvidence: ["https://bumpgrade.com/login", "https://bumpgrade.com/admin/roadmap", "https://github.com/markitics/bumpgrade/issues/9", "https://github.com/markitics/bumpgrade/issues/55"],
    happyPath: ["Open /login.", "Create or sign in to a Bumpgrade account.", "Open an admin route.", "If the owner email is verified and allowlisted, view the private admin page.", "If the owner email is not verified, use the Gmail or resend actions instead of seeing a raw denial string."],
    edgeCases: ["Cloudflare Email Sending may reject account confirmation mail and must return an actionable browser error.", "Recent verification sends hold a 120 second resend cooldown.", "Agent-readable source-data routes stay public-safe and should not carry private notes or secrets."],
    agentAccess: "Agents can read public-safe source-data routes, but browser admin pages require a Better Auth owner session and must not be scraped as a bypass.",
    validation: ["Playwright covers signed-out admin gates, verified owner sign-in, and unverified owner resend/cooldown copy.", "D1 migration creates Better Auth storage and account verification email event tables."],
    sortOrder: 35,
    updatedAt: null,
  },
  {
    id: "journey-prospect-evaluates-content-surfaces",
    title: "Prospect evaluates Bumpgrade content surfaces",
    featureId: "feature-resources-use-cases-pricing",
    featureStatus: "live",
    issueNumbers: [20],
    primaryUser: "Creator, coach, publisher, agency, or agent evaluating Bumpgrade",
    userGoal: "Understand who Bumpgrade is for, what resources exist, and what pricing can safely claim before live billing ships.",
    sourceEvidence: [
      "https://bumpgrade.com/users",
      "https://bumpgrade.com/developers-and-agents",
      "https://bumpgrade.com/resources",
      "https://bumpgrade.com/pricing",
      "https://bumpgrade.com/content/source-data",
      "https://github.com/markitics/bumpgrade/issues/20",
    ],
    happyPath: [
      "Open /users to find the relevant audience segment and linked feature IDs.",
      "Open /resources to find live comparison, commerce, and agent contract resources.",
      "Open /pricing to read direction and explicit not-yet-claimed billing caveats.",
      "Fetch /content/source-data to cite stable IDs, issue numbers, evidence routes, and agent boundaries.",
    ],
    edgeCases: [
      "Pricing tracks are positioning hypotheses, not published plans or live billing availability.",
      "Migration guides and launch playbooks are planned until the related funnel, checkout, automation, and analytics issues ship.",
      "Agents must not treat content copy as permission to perform public, billing-impacting, or creator-speech writes.",
    ],
    agentAccess:
      "Agents can read /content/source-data for audience, resource, and pricing-direction records. Public copy changes still need source evidence, issue links, or shipped-product proof.",
    validation: [
      "Playwright covers /users, /resources, /pricing, /content/source-data, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #20 updates public route metadata and source-data contracts.",
    ],
    sortOrder: 44,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-seeded-funnel",
    title: "Publisher previews a seeded draft funnel",
    featureId: "feature-funnel-builder",
    featureStatus: "pending",
    issueNumbers: [14, 79],
    primaryUser: "Publisher or agent planning the first funnel",
    userGoal: "Inspect an ordered opt-in, sales, and thank-you funnel before visual editing and publishing writes exist.",
    sourceEvidence: [
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/funnels/indie-launch-sandbox",
      "https://github.com/markitics/bumpgrade/issues/14",
      "https://github.com/markitics/bumpgrade/issues/79",
    ],
    happyPath: [
      "Fetch /funnels/source-data.",
      "Find the seeded draft funnel, revision ID, ordered step IDs, block IDs, preview route, and write boundary.",
      "Open /funnels/indie-launch-sandbox to inspect semantic preview sections.",
      "Use the write boundary to avoid claiming create, edit, publish, checkout-link, or agent-write capability.",
    ],
    edgeCases: [
      "The seeded funnel is read-only and not an authenticated builder UI.",
      "Publishing, checkout linking, deletion, and agent edits require future confirmed-write APIs.",
      "Generated copy remains draft until a publisher confirms it.",
    ],
    agentAccess:
      "Agents can read /funnels/source-data and the preview route. Funnel writes require actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes in a later API.",
    validation: [
      "Playwright covers /funnels/source-data, /funnels/indie-launch-sandbox, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #79 records the first funnel source-data contract and preview scaffold.",
    ],
    sortOrder: 46,
    updatedAt: null,
  },
  {
    id: "journey-owner-seeds-editable-draft-funnel",
    title: "Owner seeds and edits a draft funnel",
    featureId: "feature-funnel-builder",
    featureStatus: "pending",
    issueNumbers: [14, 79, 91, 93, 95],
    primaryUser: "Publisher or owner preparing the first launch funnel",
    userGoal: "Create or seed a D1-backed draft funnel, then tune the ordered opt-in, sales, and thank-you steps before public publishing exists.",
    sourceEvidence: [
      "https://bumpgrade.com/admin/funnels",
      "https://bumpgrade.com/admin/funnels/funnel-draft-indie-launch-working-copy/preview",
      "https://bumpgrade.com/funnels/source-data",
      "https://github.com/markitics/bumpgrade/issues/14",
      "https://github.com/markitics/bumpgrade/issues/91",
      "https://github.com/markitics/bumpgrade/issues/93",
      "https://github.com/markitics/bumpgrade/issues/95",
    ],
    happyPath: [
      "Sign in with an allowlisted owner account.",
      "Open /admin/funnels.",
      "Seed the indie launch working draft or create a new template draft.",
      "Edit a step title, goal, or kind, then move a step up or down.",
      "Open the owner-gated preview route to confirm the private draft sequence reflects current D1 state.",
      "Confirm the page lists the updated D1-backed draft with ordered steps and audit metadata.",
      "Use /funnels/source-data to distinguish owner-session editable drafts from public preview records.",
    ],
    edgeCases: [
      "The admin draft builder is owner-gated and not crawlable public content.",
      "Publishing, checkout linking, deletion, drag-and-drop layout editing, and agent writes still require future confirmed-write APIs.",
      "Draft copy remains private/admin-scoped; the preview route is owner-gated and is not public publishing.",
    ],
    agentAccess:
      "Agents can read public /funnels/source-data for capability metadata. Owner-session UI may create, edit, and preview private draft steps with actor identity, idempotency, audit correlation, stale-state checks, and redaction; direct agent edit tools are still planned.",
    validation: [
      "Playwright covers the owner-gated /admin/funnels surface, seed/update/reorder POST paths, private draft preview, /funnels/source-data capability metadata, and agent manifest discovery.",
      "Issue #91 records the first D1-backed draft funnel builder scaffold.",
      "Issue #93 records the first step edit and reorder controls.",
      "Issue #95 records the first owner-gated private draft preview route.",
    ],
    sortOrder: 47,
    updatedAt: null,
  },
  {
    id: "journey-publisher-checks-mobile-admin",
    title: "Publisher checks mobile admin status",
    featureId: "feature-mobile-admin",
    featureStatus: "pending",
    issueNumbers: [13, 67, 68],
    primaryUser: "Publisher away from desktop",
    userGoal: "Open the future Bumpgrade mobile app to check roadmap, work-log, for-Mark attention, and commerce health without separate mobile-only semantics.",
    sourceEvidence: [
      "https://bumpgrade.com/mobile-admin/source-data",
      "https://bumpgrade.com/mobile-admin/ios/source-data",
      "https://bumpgrade.com/mobile-admin/android/source-data",
      "https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin",
      "https://github.com/markitics/bumpgrade/issues/13",
      "https://github.com/markitics/bumpgrade/issues/67",
      "https://github.com/markitics/bumpgrade/issues/68",
    ],
    happyPath: [
      "Open the future mobile admin app.",
      "For iOS, open the first simulator scaffold and read the digest sourced from the generated /mobile-admin/source-data fixture.",
      "For Android, open the first emulator scaffold and read the digest sourced from the same generated /mobile-admin/source-data fixture.",
      "Later mobile slices should read live /admin/source-data, /features/source-data, /roadmap/source-data, and /commerce/source-data.",
      "Review work-log entries, for-Mark attention, and checkout health.",
      "Follow iOS issue #67 or Android issue #68 for platform-specific implementation evidence.",
    ],
    edgeCases: [
      "The iOS simulator target is not App Store distribution, push notifications, private mobile auth, or confirmed-write support.",
      "The Android emulator target is not Play Store distribution, push notifications, private mobile auth, or confirmed-write support.",
      "Private admin state requires Better Auth owner or publisher sessions.",
      "Mobile writes stay disabled until confirmed-write APIs exist.",
    ],
    agentAccess:
      "Agents can read /mobile-admin/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data to understand app scope and smoke evidence; they must not claim mobile app parity until private auth, live reads, distribution, and confirmed writes ship.",
    validation: [
      "Issue #13 defines the shared contract and splits iOS and Android child issues.",
      "Issue #67 adds an Expo app scaffold, generated fixture, iOS simulator target, validation command, smoke command, and screenshot path.",
      "Issue #68 adds a native Android activity, generated fixture asset, emulator target, validation command, smoke command, and screenshot path.",
      "Playwright covers /agent-docs/bumpgrade-mobile-admin, /mobile-admin/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data.",
    ],
    sortOrder: 42,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-checkout-offer-stack",
    title: "Publisher previews and starts a sandbox checkout bump stack",
    featureId: "feature-checkout-offers",
    featureStatus: "pending",
    issueNumbers: [15, 81, 99],
    primaryUser: "Publisher or agent planning checkout revenue lifts",
    userGoal:
      "Inspect the primary offer, choose the seeded order bump, and start a confirmed sandbox Checkout Session without enabling live billing.",
    sourceEvidence: [
      "https://bumpgrade.com/offers/source-data",
      "https://bumpgrade.com/offers/indie-launch-stack",
      "https://bumpgrade.com/api/commerce/checkout",
      "https://bumpgrade.com/commerce/source-data",
      "https://github.com/markitics/bumpgrade/issues/15",
      "https://github.com/markitics/bumpgrade/issues/81",
      "https://github.com/markitics/bumpgrade/issues/99",
    ],
    happyPath: [
      "Open /offers/indie-launch-stack.",
      "Review the primary sandbox launch pass and launch checklist order bump.",
      "Choose the order bump, enter the exact confirmation text, and submit the sandbox checkout start form.",
      "In test or incomplete-secret environments, receive a redacted preview response.",
      "In production sandbox mode with valid secrets, receive a Bumpgrade redirect URL for the Checkout Session rather than a raw Stripe URL.",
    ],
    edgeCases: [
      "Live billing mode remains disabled.",
      "Only the seeded order bump can be attached in this slice.",
      "One-click upsell/downsell charging, fulfillment, refund, coupon, and customer portal writes require later confirmed-write APIs.",
      "Raw Stripe identifiers and private buyer data stay server-private.",
    ],
    agentAccess:
      "Agents can read /offers/source-data and the preview route, and can inspect the confirmed-write checkout boundary. Agents must not create or mutate checkout sessions without exact confirmation, idempotency, stale-state checks, audit correlation, redaction, and webhook evidence.",
    validation: [
      "Playwright covers /offers/source-data, /offers/indie-launch-stack, the order-bump form preview response, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #99 records the confirmed sandbox checkout start plus constrained order-bump support.",
    ],
    sortOrder: 48,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-product-access",
    title: "Publisher previews product access rules",
    featureId: "feature-products-access",
    featureStatus: "pending",
    issueNumbers: [16, 83, 101],
    primaryUser: "Publisher or agent planning fulfillment",
    userGoal: "Inspect products, assets, access rules, entitlement templates, and sandbox entitlement grant mappings before private fulfillment delivery is enabled.",
    sourceEvidence: [
      "https://bumpgrade.com/products/source-data",
      "https://bumpgrade.com/products/indie-launch-library",
      "https://bumpgrade.com/offers/source-data",
      "https://github.com/markitics/bumpgrade/issues/16",
      "https://github.com/markitics/bumpgrade/issues/83",
      "https://github.com/markitics/bumpgrade/issues/101",
    ],
    happyPath: [
      "Fetch /products/source-data.",
      "Find seeded product types, asset IDs, access rules, entitlement templates, sandbox grant mappings, revision ID, and write boundary.",
      "Open /products/indie-launch-library to inspect the public preview.",
      "Use /offers/source-data and /commerce/source-data to confirm checkout and webhook dependencies before assuming fulfillment exists.",
    ],
    edgeCases: [
      "The seeded product/access catalog is not a product admin.",
      "Private R2 keys, signed URLs, protected lessons, revocation, authenticated customer entitlement inspection, and live fulfillment require future confirmed-write APIs.",
      "Subscription access requires trusted billing state before membership entitlements can be granted.",
    ],
    agentAccess:
      "Agents can read /products/source-data and the preview route. Trusted paid sandbox webhooks can grant seeded entitlement rows; direct product/access writes require actor identity, exact confirmation, idempotency, stale-state checks, audit correlation, redaction, and trusted checkout or subscription evidence in a later API.",
    validation: [
      "Playwright covers /products/source-data, /products/indie-launch-library, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #83 records the first product/access source-data contract and preview scaffold.",
      "Issue #101 records the first sandbox webhook-backed entitlement grant path.",
    ],
    sortOrder: 49,
    updatedAt: null,
  },
  {
    id: "journey-publisher-verifies-sandbox-entitlement-grant",
    title: "Publisher verifies sandbox entitlement grant evidence",
    featureId: "feature-products-access",
    featureStatus: "pending",
    issueNumbers: [16, 83, 99, 101],
    primaryUser: "Publisher or agent validating fulfillment readiness",
    userGoal: "Confirm that a paid sandbox checkout webhook can grant product entitlements and queue fulfillment evidence without exposing private assets.",
    sourceEvidence: [
      "https://bumpgrade.com/products/source-data",
      "https://bumpgrade.com/commerce/source-data",
      "https://bumpgrade.com/offers/source-data",
      "https://github.com/markitics/bumpgrade/issues/16",
      "https://github.com/markitics/bumpgrade/issues/99",
      "https://github.com/markitics/bumpgrade/issues/101",
    ],
    happyPath: [
      "Start a sandbox checkout for the primary offer and selected order bump.",
      "Receive trusted checkout.session.completed webhook evidence.",
      "Update the checkout intent to paid.",
      "Insert idempotent product_entitlements rows for mapped line items.",
      "Queue public-safe fulfillment task evidence without returning signed URLs, R2 object keys, or private buyer data.",
    ],
    edgeCases: [
      "Duplicate webhook events do not create duplicate entitlements.",
      "Private asset delivery remains disabled.",
      "Revocation, signed downloads, protected content, customer portal, refunds, and direct agent writes require later confirmed-write APIs.",
      "Raw Stripe identifiers and buyer email remain server-private.",
    ],
    agentAccess:
      "Agents can read /products/source-data and /commerce/source-data to understand the entitlement grant contract. Agents cannot grant, revoke, inspect private buyer access, or issue signed download URLs without future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers source-data output, a paid test checkout webhook that creates entitlement rows, and duplicate webhook idempotency.",
      "Issue #101 records the sandbox entitlement grant path.",
    ],
    sortOrder: 50,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-audience-automation",
    title: "Publisher previews audience opt-in automation",
    featureId: "feature-email-automation-crm",
    featureStatus: "pending",
    issueNumbers: [17, 85, 103],
    primaryUser: "Publisher or agent planning list growth",
    userGoal: "Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, and the live consent-backed capture boundary before email sends exist.",
    sourceEvidence: [
      "https://bumpgrade.com/audience/source-data",
      "https://bumpgrade.com/audience/indie-launch-waitlist",
      "https://bumpgrade.com/api/audience/opt-in",
      "https://bumpgrade.com/funnels/source-data",
      "https://github.com/markitics/bumpgrade/issues/17",
      "https://github.com/markitics/bumpgrade/issues/85",
      "https://github.com/markitics/bumpgrade/issues/103",
    ],
    happyPath: [
      "Fetch /audience/source-data.",
      "Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, and write boundary.",
      "Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.",
      "Confirm the API trims and normalizes email, stores consent evidence, assigns seeded tags, and records draft sequence enrollment without sending email.",
      "Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists.",
    ],
    edgeCases: [
      "The seeded audience automation workspace can capture explicit-consent opt-ins, but it is not a general contact import or CRM database.",
      "Subscriber imports, direct agent contact writes, email sends, broadcasts, unsubscribe changes, and CRM notes require future confirmed-write APIs.",
      "Codex project email in issue #10 is separate from publisher/customer email workflows.",
    ],
    agentAccess:
      "Agents can read /audience/source-data and the opt-in write boundary. Direct agent subscriber writes, imports, sends, unsubscribes, broadcasts, or CRM notes require future authenticated confirmed-write APIs with consent, suppression, and sender-domain safety.",
    validation: [
      "Playwright covers /audience/source-data, /audience/indie-launch-waitlist, valid opt-in, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.",
      "Issues #85 and #103 record the audience automation source-data contract and first live opt-in capture path.",
    ],
    sortOrder: 50,
    updatedAt: null,
  },
  {
    id: "journey-visitor-joins-indie-launch-waitlist",
    title: "Visitor joins the indie launch waitlist",
    featureId: "feature-email-automation-crm",
    featureStatus: "pending",
    issueNumbers: [17, 85, 103],
    primaryUser: "Visitor interested in the launch checklist",
    userGoal: "Submit a normalized email and explicit consent, then receive a safe confirmation that Bumpgrade recorded the opt-in without sending email yet.",
    sourceEvidence: [
      "https://bumpgrade.com/audience/indie-launch-waitlist",
      "https://bumpgrade.com/audience/source-data",
      "https://bumpgrade.com/api/audience/opt-in",
      "https://github.com/markitics/bumpgrade/issues/17",
      "https://github.com/markitics/bumpgrade/issues/85",
      "https://github.com/markitics/bumpgrade/issues/103",
    ],
    happyPath: [
      "Open /audience/indie-launch-waitlist.",
      "Enter an email with optional first name and check consent.",
      "Submit the form to /api/audience/opt-in.",
      "Bumpgrade trims and normalizes the email, stores subscriber and consent evidence, assigns seeded tags, and records draft sequence enrollment.",
      "The response confirms the normalized email and states email delivery is disabled.",
    ],
    edgeCases: [
      "Missing consent or invalid email returns public-safe validation errors.",
      "Duplicate idempotency keys do not duplicate consent, tag, or sequence rows.",
      "Email sending, imports, unsubscribe management, broadcasts, and CRM notes remain disabled.",
      "Private contact metadata and provider IDs stay server-private.",
    ],
    agentAccess:
      "Agents can read /audience/source-data and the opt-in write boundary. Direct agent subscriber writes, imports, sends, unsubscribes, broadcasts, or CRM notes require future authenticated confirmed-write APIs with consent, suppression, and sender-domain safety.",
    validation: [
      "Playwright covers source-data output, valid opt-in, validation failures, duplicate idempotency, and agent manifest discovery.",
      "Issue #103 records the first live audience opt-in capture path.",
    ],
    sortOrder: 51,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-analytics-experiments",
    title: "Publisher previews analytics and experiment reporting",
    featureId: "feature-analytics-testing",
    featureStatus: "pending",
    issueNumbers: [18, 87, 105],
    primaryUser: "Publisher or agent optimizing a launch funnel",
    userGoal: "Inspect seeded analytics definitions, capture privacy-safe test events, and read aggregate event counts before cookies, contact-level reporting, or automated decisions exist.",
    sourceEvidence: [
      "https://bumpgrade.com/analytics/source-data",
      "https://bumpgrade.com/analytics/indie-launch-dashboard",
      "https://bumpgrade.com/api/analytics/events",
      "https://bumpgrade.com/funnels/source-data",
      "https://github.com/markitics/bumpgrade/issues/18",
      "https://github.com/markitics/bumpgrade/issues/87",
      "https://github.com/markitics/bumpgrade/issues/105",
    ],
    happyPath: [
      "Fetch /analytics/source-data.",
      "Find event IDs, metric IDs, aggregate event counts, experiment IDs, variant IDs, assignment rule, and write boundary.",
      "POST a seeded event to /api/analytics/events with an idempotency key and source route.",
      "Confirm duplicate idempotency returns the same public-safe event without duplicating rows.",
      "Open /analytics/indie-launch-dashboard to inspect the public preview and caveats.",
    ],
    edgeCases: [
      "Public source-data exposes aggregate counts only, not raw event rows.",
      "Unsupported event IDs, source routes, and missing idempotency keys return public-safe validation errors.",
      "Cookie assignment, contact-level analytics, experiment traffic changes, automated winners, and revenue claims require future confirmed-write APIs.",
      "Agents must include sample-size caveats and must not call sparse test events statistically meaningful.",
    ],
    agentAccess:
      "Agents can read /analytics/source-data and event capture boundaries. Direct agent analytics writes, custom events, campaign attribution mutation, experiment routing, and automated decisions require future authenticated confirmed-write APIs with privacy review, idempotency, bot filtering, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.",
    validation: [
      "Playwright covers /analytics/source-data, /analytics/indie-launch-dashboard, event ingestion, duplicate idempotency, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.",
      "Issues #87 and #105 record the analytics source-data scaffold and first privacy-safe event capture path.",
    ],
    sortOrder: 51,
    updatedAt: null,
  },
  {
    id: "journey-agent-records-privacy-safe-analytics-event",
    title: "Agent records a privacy-safe analytics event",
    featureId: "feature-analytics-testing",
    featureStatus: "pending",
    issueNumbers: [18, 87, 105],
    primaryUser: "Agent or system integration validating event capture",
    userGoal: "Record a seeded analytics event with idempotency and verify Bumpgrade stores only public-safe fields plus hashed request evidence.",
    sourceEvidence: [
      "https://bumpgrade.com/api/analytics/events",
      "https://bumpgrade.com/analytics/source-data",
      "https://github.com/markitics/bumpgrade/issues/18",
      "https://github.com/markitics/bumpgrade/issues/87",
      "https://github.com/markitics/bumpgrade/issues/105",
    ],
    happyPath: [
      "Choose a seeded event definition from /analytics/source-data.",
      "POST the event definition ID, source route, public properties, and idempotency key to /api/analytics/events.",
      "Replay the same idempotency key and receive the same public-safe event ID.",
      "Read aggregate counts from /analytics/source-data without exposing raw event rows.",
    ],
    edgeCases: [
      "Missing idempotency is rejected.",
      "Unsupported event IDs and source routes are rejected.",
      "Private request fields are hashed or omitted.",
      "The API does not create cookies, mutate campaign attribution, route experiment traffic, or decide winners.",
    ],
    agentAccess:
      "Agents can inspect the event capture contract and propose analytics events, but direct agent analytics writes beyond seeded events require future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers valid event ingestion, duplicate idempotency, validation failures, and aggregate-only source-data.",
      "Issue #105 records the first live analytics event capture path.",
    ],
    sortOrder: 53,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-affiliate-referrals",
    title: "Publisher previews affiliate and referral management",
    featureId: "feature-affiliates-referrals",
    featureStatus: "pending",
    issueNumbers: [19, 89],
    primaryUser: "Publisher or agent planning partner growth",
    userGoal:
      "Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, payout review states, and fraud flags before live tracking or payouts exist.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/source-data",
      "https://bumpgrade.com/affiliates/indie-launch-partners",
      "https://bumpgrade.com/offers/source-data",
      "https://bumpgrade.com/analytics/source-data",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/89",
    ],
    happyPath: [
      "Fetch /affiliates/source-data.",
      "Find the seeded affiliate program, revision ID, partner IDs, referral link IDs, attribution rule IDs, commission rule IDs, ledger IDs, payout batch ID, review flags, and write boundary.",
      "Open /affiliates/indie-launch-partners to inspect the public preview.",
      "Use /offers/source-data and /analytics/source-data to resolve offer and event dependencies before assuming live affiliate tracking exists.",
    ],
    edgeCases: [
      "The seeded affiliate program uses fixture commissions and does not track live referral clicks.",
      "Cookie assignment, buyer attribution, payout accounts, tax forms, fraud enforcement, Stripe payouts, and partner notifications require future confirmed-write APIs.",
      "Agents must not call fixture commission amounts payable or published affiliate terms.",
    ],
    agentAccess:
      "Agents can read /affiliates/source-data and the preview route. Affiliate writes require actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries in a later API.",
    validation: [
      "Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #89 records the first affiliate/referral source-data contract and preview scaffold.",
    ],
    sortOrder: 52,
    updatedAt: null,
  },
  {
    id: "journey-publisher-plans-first-checkout",
    title: "Publisher plans the first paid offer",
    featureId: "feature-stripe-commerce",
    featureStatus: "live",
    issueNumbers: [11, 34, 15, 16],
    primaryUser: "Publisher preparing to sell a digital offer",
    userGoal: "Understand what Bumpgrade must know before it can create a Stripe checkout session safely.",
    sourceEvidence: [
      "https://bumpgrade.com/features",
      "https://bumpgrade.com/roadmap",
      "https://github.com/markitics/bumpgrade/issues/11",
      "https://github.com/markitics/bumpgrade/issues/34",
    ],
    happyPath: [
      "Create or identify a commerce product record.",
      "Attach a price record with currency, amount, interval, and optional Stripe Price id.",
      "Create a checkout intent with an idempotency key and audit correlation id.",
      "Use sandbox Stripe Checkout first.",
      "Let the webhook update intent, subscription, and audit state before public fulfillment is trusted.",
    ],
    edgeCases: [
      "Live mode is not the default; live rollout needs an explicit later issue.",
      "Agent-started checkout requires exact confirmation and an audit record before Stripe is called.",
      "Webhook payloads must be redacted before model-readable surfaces expose them.",
      "Raw card data never enters Bumpgrade.",
    ],
    agentAccess:
      "Agents may read the architecture, product, price, checkout-intent, and redacted webhook records once exposed. Agents must not create checkout sessions without confirmed-write rules, idempotency, audit correlation, and stale-state checks.",
    validation: [
      "Issue #11 defines the D1 data model and secret plan.",
      "Issue #34 tracks the first sandbox route and webhook ingestion implementation.",
    ],
    sortOrder: 45,
    updatedAt: null,
  },
];

const fallbackAttentionItems: MarkAttentionItem[] = [
  {
    id: "mark-attention-2026-05-18-blocked-valid-stripe-sandbox-secret",
    category: "blocked",
    state: "resolved",
    urgency: "high",
    title: "Stripe sandbox checkout credentials configured",
    summary: "The Bumpgrade sandbox checkout route now has a valid test secret, public key, and endpoint-specific webhook signing secret configured in Cloudflare.",
    details: "Issue #46 tracks the production checkout and webhook smoke evidence. Live mode remains disabled until a later billing rollout issue deliberately enables it.",
    requiredAction: null,
    responseInstructions: null,
    sessionName: "bumpgrade-bootstrap",
    sessionEmail: "codex@bumpgrade.com",
    sourceAgent: "Codex",
    sourceKind: "codex",
    links: [
      { label: "Issue #46", url: "https://github.com/markitics/bumpgrade/issues/46", kind: "issue" },
      { label: "/admin/for-mark", url: "https://bumpgrade.com/admin/for-mark", kind: "roadmap" },
    ],
    metadata: { blocksLiveCheckoutSmoke: false, resolvedByIssue: 46 },
    lastActivityAt: "2026-05-18T12:23:32.000Z",
    createdAt: "2026-05-18T12:23:32.000Z",
  },
];

function firstIssueLink(item: MarkAttentionItem) {
  return item.links.find((link) => link.kind === "issue" || /^issue #\d+/i.test(link.label ?? ""));
}

function firstProjectEmail(item: MarkAttentionItem) {
  const fromInstructions = item.responseInstructions?.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
  return fromInstructions ?? item.sessionEmail ?? null;
}

export function attentionResponseInstruction(item: MarkAttentionItem) {
  const raw = item.responseInstructions?.trim();
  const issue = firstIssueLink(item);
  const email = firstProjectEmail(item);

  if (raw) {
    if (/^this page is read-only\./i.test(raw)) return raw;
    if (/^reply with\b/i.test(raw)) {
      const requestedDetail = raw.replace(/^reply with\s*/i, "");
      const path = issue
        ? `Comment on ${issue.label ?? "the linked GitHub issue"}`
        : email
          ? `Email ${email}`
          : "Continue in the active Codex Desktop thread";
      return `This page is read-only. ${path} with ${requestedDetail}`;
    }
    return `This page is read-only. ${raw}`;
  }

  if (item.state === "resolved" || item.state === "ok") {
    return "This page is read-only. No response is requested for this resolved item.";
  }

  if (issue) {
    return `This page is read-only. Comment on ${issue.label ?? "the linked GitHub issue"} for durable follow-up.`;
  }

  if (email) {
    return `This page is read-only. Email ${email} for follow-up.`;
  }

  return "This page is read-only. Continue in the active Codex Desktop thread only if this item came from the current working session.";
}

export function attentionResponseChannels(item: MarkAttentionItem): MarkAttentionResponseChannel[] {
  const issue = firstIssueLink(item);
  const email = firstProjectEmail(item);
  const channels: MarkAttentionResponseChannel[] = [
    {
      id: "read_only",
      label: "/admin/for-mark is read-only",
      instructions: "This page shows attention items and links; it does not accept replies or direct actions yet.",
      href: null,
    },
  ];

  if (issue) {
    channels.push({
      id: "github_issue",
      label: `Comment on ${issue.label ?? "linked issue"}`,
      instructions: "Use the GitHub issue for durable project-visible comments, decisions, and unblock notes.",
      href: issue.url,
    });
  }

  if (email) {
    channels.push({
      id: "project_email",
      label: `Email ${email}`,
      instructions: "Use project email only when the card explicitly names an email path.",
      href: `mailto:${email}`,
    });
  }

  if (item.sourceKind === "codex" && item.sessionName) {
    channels.push({
      id: "codex_desktop",
      label: "Active Codex Desktop thread",
      instructions: "Use the current Codex Desktop thread when this card belongs to the active workstream you are already discussing.",
      href: null,
    });
  }

  return channels;
}

function attentionWithResponseChannels(item: MarkAttentionItem): MarkAttentionItem {
  return {
    ...item,
    responseInstructions: attentionResponseInstruction(item),
    responseChannels: attentionResponseChannels(item),
  };
}

function roadmapFromRow(row: D1RoadmapRow): AdminRoadmapRecord {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    issueNumber: row.issue_number,
    featureId: row.feature_id,
    groupName: row.group_name,
    summary: row.summary,
    publicEvidence: parseJson<string[]>(row.public_evidence_json, []),
    nextMilestone: row.next_milestone,
    markAttention: row.mark_attention,
    sortOrder: row.sort_order,
    updatedAt: isoFromSeconds(row.updated_at),
  };
}

function workLogFromRow(row: D1WorkLogRow): AdminWorkLogEntry {
  return {
    id: row.id,
    title: row.title,
    agentName: row.agent_name,
    agentKind: row.agent_kind,
    sessionName: row.session_name,
    promptFromMark: row.prompt_from_mark,
    githubIssues: parseJson<AdminLink[]>(row.github_issues_json, []),
    closedPrs: parseJson<AdminLink[]>(row.closed_prs_json, []),
    featuresUpdated: parseJson<string[]>(row.features_updated_json, []),
    roadmapUpdated: parseJson<string[]>(row.roadmap_updated_json, []),
    userJourneysUpdated: parseJson<string[]>(row.user_journeys_updated_json, []),
    documentationUpdated: parseJson<string[]>(row.documentation_updated_json, []),
    validation: parseJson<string[]>(row.validation_json, []),
    flagsAttention: row.flags_attention,
    firstPromptAt: isoFromRequiredSeconds(row.first_prompt_at),
    completedAt: isoFromRequiredSeconds(row.completed_at),
    relevantUrls: parseJson<string[]>(row.relevant_urls_json, []),
    prCommentUrl: row.pr_comment_url,
  };
}

function journeyFromRow(row: D1JourneyRow): AdminUserJourney {
  return {
    id: row.id,
    title: row.title,
    featureId: row.feature_id,
    featureStatus: row.feature_status,
    issueNumbers: parseJson<number[]>(row.issue_numbers_json, []),
    primaryUser: row.primary_user,
    userGoal: row.user_goal,
    sourceEvidence: parseJson<string[]>(row.source_evidence_json, []),
    happyPath: parseJson<string[]>(row.happy_path_json, []),
    edgeCases: parseJson<string[]>(row.edge_cases_json, []),
    agentAccess: row.agent_access,
    validation: parseJson<string[]>(row.validation_json, []),
    sortOrder: row.sort_order,
    updatedAt: isoFromSeconds(row.updated_at),
  };
}

function attentionFromRow(row: D1AttentionRow): MarkAttentionItem {
  return {
    id: row.id,
    category: row.category,
    state: row.state,
    urgency: row.urgency,
    title: row.title,
    summary: row.summary,
    details: row.details,
    requiredAction: row.required_action,
    responseInstructions: row.response_instructions,
    sessionName: row.session_name,
    sessionEmail: row.session_email,
    sourceAgent: row.source_agent,
    sourceKind: row.source_kind,
    links: parseJson<AdminLink[]>(row.links_json, []),
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    lastActivityAt: isoFromRequiredSeconds(row.last_activity_at),
    createdAt: isoFromRequiredSeconds(row.created_at),
  };
}

async function queryRows<T>(db: D1Database, sql: string): Promise<T[]> {
  const result = await db.prepare(sql).all<T>();
  return result.results ?? [];
}

async function getD1(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const db = (env as Cloudflare.Env).DB;

  if (!db) {
    throw new Error("Cloudflare D1 binding DB is not available.");
  }

  return db;
}

function fallbackData(loadError: string | null): AdminSurfaceData {
  return {
    source: "fixture",
    loadError,
    roadmapItems: fallbackRoadmapItems,
    workLogEntries: fallbackWorkLogEntries,
    userJourneys: fallbackUserJourneys,
    attentionItems: fallbackAttentionItems.map(attentionWithResponseChannels),
  };
}

export async function getAdminSurfaceData(): Promise<AdminSurfaceData> {
  try {
    const db = await getD1();
    const [roadmapRows, workRows, journeyRows, attentionRows] = await Promise.all([
      queryRows<D1RoadmapRow>(
        db,
        "SELECT * FROM admin_roadmap_items ORDER BY sort_order ASC, title ASC",
      ),
      queryRows<D1WorkLogRow>(
        db,
        "SELECT * FROM admin_work_log_entries ORDER BY completed_at DESC LIMIT 50",
      ),
      queryRows<D1JourneyRow>(
        db,
        "SELECT * FROM admin_user_journeys ORDER BY sort_order ASC, title ASC",
      ),
      queryRows<D1AttentionRow>(
        db,
        "SELECT * FROM mark_attention_items WHERE state IN ('open', 'read') ORDER BY CASE urgency WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END, last_activity_at DESC",
      ),
    ]);

    const hasAnyD1Rows = roadmapRows.length + workRows.length + journeyRows.length + attentionRows.length > 0;
    const hasCoreD1Rows = roadmapRows.length > 0 && workRows.length > 0 && journeyRows.length > 0;

    if (!hasAnyD1Rows) {
      return fallbackData("D1 admin tables are reachable but empty, so fixture records are shown.");
    }

    return {
      source: hasCoreD1Rows ? "d1" : "mixed",
      loadError: null,
      roadmapItems: roadmapRows.length ? roadmapRows.map(roadmapFromRow) : fallbackRoadmapItems,
      workLogEntries: workRows.length ? workRows.map(workLogFromRow) : fallbackWorkLogEntries,
      userJourneys: journeyRows.length ? journeyRows.map(journeyFromRow) : fallbackUserJourneys,
      attentionItems: attentionRows.map(attentionFromRow).map(attentionWithResponseChannels),
    };
  } catch (error) {
    return fallbackData(error instanceof Error ? error.message : "Unable to load D1 admin surface data.");
  }
}

export function adminRoadmapCounts(items: AdminRoadmapRecord[]) {
  const lanes: AdminRoadmapStatus[] = ["live", "active", "blocked", "pending", "idea", "parked"];
  return lanes.map((status) => ({
    status,
    count: items.filter((item) => item.status === status).length,
  }));
}
