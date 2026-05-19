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
    issueNumbers: [14, 79, 159, 161, 163, 165],
    primaryUser: "Publisher or agent planning the first funnel",
    userGoal:
      "Inspect an ordered opt-in, sales, and thank-you funnel plus reusable templates, block records, owner-session checkout-link capability, and public linked-checkout start capability before visual editing or direct agent template creation exists.",
    sourceEvidence: [
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/funnels/indie-launch-sandbox",
      "https://github.com/markitics/bumpgrade/issues/14",
      "https://github.com/markitics/bumpgrade/issues/79",
      "https://github.com/markitics/bumpgrade/issues/159",
      "https://github.com/markitics/bumpgrade/issues/161",
      "https://github.com/markitics/bumpgrade/issues/163",
      "https://github.com/markitics/bumpgrade/issues/165",
    ],
    happyPath: [
      "Fetch /funnels/source-data.",
      "Find the seeded draft funnel, revision ID, ordered step IDs, block IDs, preview route, public checkout-start capability, and write boundary.",
      "Inspect reusable funnel templates and block-template records, including owner-session draftCreation and block write boundaries.",
      "Open /funnels/indie-launch-sandbox to inspect semantic preview sections.",
      "Use the write boundary to avoid claiming live billing, unpublish/delete, direct agent checkout-link, or direct agent-write capability.",
    ],
    edgeCases: [
      "The seeded funnel is read-only and not an authenticated builder UI.",
      "Owner-session template-to-draft creation and checkout-offer linking are available from /admin/funnels, and published linked checkout blocks can render the existing sandbox checkout start surface. Deletion, unpublishing, live billing, and direct agent edits require future confirmed-write APIs.",
      "Generated copy remains draft until a publisher confirms it.",
    ],
    agentAccess:
      "Agents can read /funnels/source-data, reusable template and block-template records, checkout-link capability metadata, public funnel checkout-start capability metadata, the seeded preview route, and published D1 funnel routes. Owner-session template-to-draft creation and checkout-offer linking require confirmation and idempotency; direct agent writes require actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.",
    validation: [
      "Playwright covers /funnels/source-data, /funnels/indie-launch-sandbox template and block library rendering, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #79 records the first funnel source-data contract and preview scaffold.",
      "Issue #159 records the first reusable template and block-template library contract.",
      "Issue #161 records owner-confirmed template-to-draft creation.",
      "Issue #163 records owner-confirmed checkout-offer linking on private draft steps.",
      "Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.",
    ],
    sortOrder: 46,
    updatedAt: null,
  },
  {
    id: "journey-owner-seeds-editable-draft-funnel",
    title: "Owner seeds, edits, previews, and publishes a draft funnel",
    featureId: "feature-funnel-builder",
    featureStatus: "pending",
    issueNumbers: [14, 79, 91, 93, 95, 135, 159, 161, 163, 165],
    primaryUser: "Publisher or owner preparing the first launch funnel",
    userGoal: "Create, seed, or template-start a D1-backed draft funnel, tune the ordered steps, attach the seeded sandbox checkout offer to a checkout block, preview it privately, then publish it to a public route that can start the linked sandbox checkout after exact confirmation.",
    sourceEvidence: [
      "https://bumpgrade.com/admin/funnels",
      "https://bumpgrade.com/admin/funnels/funnel-draft-indie-launch-working-copy/preview",
      "https://bumpgrade.com/funnels/indie-launch-working-copy",
      "https://bumpgrade.com/funnels/source-data",
      "https://github.com/markitics/bumpgrade/issues/14",
      "https://github.com/markitics/bumpgrade/issues/91",
      "https://github.com/markitics/bumpgrade/issues/93",
      "https://github.com/markitics/bumpgrade/issues/95",
      "https://github.com/markitics/bumpgrade/issues/135",
      "https://github.com/markitics/bumpgrade/issues/159",
      "https://github.com/markitics/bumpgrade/issues/161",
      "https://github.com/markitics/bumpgrade/issues/163",
      "https://github.com/markitics/bumpgrade/issues/165",
    ],
    happyPath: [
      "Sign in with an allowlisted owner account.",
      "Open /admin/funnels.",
      "Seed the indie launch working draft, create a generic draft, or create a private draft from a reusable template after typing the exact template confirmation text.",
      "Edit a step title, goal, or kind, then move a step up or down.",
      "Attach the seeded sandbox checkout offer to a draft checkout block after typing the exact checkout-link confirmation text and using the current draft revision.",
      "Open the owner-gated preview route to confirm the private draft sequence reflects current D1 state.",
      "Type the exact publish confirmation text with the current revision and publish the draft.",
      "Open the public /funnels/{slug} route and confirm the published sequence is crawlable and the linked checkout block renders the sandbox checkout start panel.",
      "Use /funnels/source-data to distinguish published D1 funnels from unpublished private drafts.",
    ],
    edgeCases: [
      "The admin draft builder is owner-gated and unpublished draft copy is not crawlable public content.",
      "Template-to-draft creation writes only private D1 draft rows and audit metadata; it does not publish.",
      "Checkout-offer linking writes public-safe metadata into private draft step blocks and does not start a checkout session or enable live billing by itself.",
      "The public linked checkout start remains sandbox-only, exact-confirmed, idempotent, and constrained to the seeded offer stack.",
      "Publishing requires exact confirmation and a fresh revision ID.",
      "Checkout-link deletion, unpublishing, drag-and-drop layout editing, live billing, and direct agent writes still require future confirmed-write APIs.",
      "/funnels/source-data lists published D1 funnels but does not expose raw owner session or unpublished private draft data.",
    ],
    agentAccess:
      "Agents can read public /funnels/source-data, seeded funnel routes, reusable templates, checkout-link capability metadata, public funnel checkout-start capability metadata, and published D1 funnel routes. Owner-session UI may create from templates, edit, link checkout offers, preview, and publish private draft steps with actor identity, confirmation, idempotency, audit correlation, stale-state checks, and redaction; direct agent edit tools are still planned.",
    validation: [
      "Playwright covers the owner-gated /admin/funnels surface, template-to-draft create path, checkout-link create path, idempotent replay, stale checkout-link rejection, seed/update/reorder/publish POST paths, stale publish rejection, private draft preview, public D1 funnel route rendering, public linked-checkout start rendering, /funnels/source-data capability metadata, and agent manifest discovery.",
      "Issue #91 records the first D1-backed draft funnel builder scaffold.",
      "Issue #93 records the first step edit and reorder controls.",
      "Issue #95 records the first owner-gated private draft preview route.",
      "Issue #135 records the first exact-confirmed D1 draft publishing path.",
      "Issue #159 records reusable template and block-template source data.",
      "Issue #161 records owner-confirmed template-to-draft creation.",
      "Issue #163 records owner-confirmed checkout-offer linking on private draft steps.",
      "Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.",
    ],
    sortOrder: 47,
    updatedAt: null,
  },
  {
    id: "journey-publisher-checks-mobile-admin",
    title: "Publisher checks mobile admin status",
    featureId: "feature-mobile-admin",
    featureStatus: "pending",
    issueNumbers: [13, 67, 68, 153, 155, 157],
    primaryUser: "Publisher away from desktop",
    userGoal: "Open the future Bumpgrade mobile app to check roadmap, work-log, for-Mark attention, and commerce health without separate mobile-only semantics.",
    sourceEvidence: [
      "https://bumpgrade.com/mobile-admin/source-data",
      "https://bumpgrade.com/mobile-admin/dashboard/source-data",
      "https://bumpgrade.com/mobile-admin/ios/source-data",
      "https://bumpgrade.com/mobile-admin/android/source-data",
      "https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin",
      "https://github.com/markitics/bumpgrade/issues/13",
      "https://github.com/markitics/bumpgrade/issues/67",
      "https://github.com/markitics/bumpgrade/issues/68",
      "https://github.com/markitics/bumpgrade/issues/153",
      "https://github.com/markitics/bumpgrade/issues/155",
      "https://github.com/markitics/bumpgrade/issues/157",
    ],
    happyPath: [
      "Open the future mobile admin app.",
      "Fetch /mobile-admin/dashboard/source-data for the public-safe mobile dashboard digest.",
      "For iOS, open the first simulator scaffold and read the live dashboard payload, falling back to the generated fixture if the network is unavailable.",
      "For Android, open the first emulator scaffold and read the live dashboard payload, falling back to the same generated fixture if the network is unavailable.",
      "Confirm the Expo, iOS, and Android surfaces distinguish live network hydration from fixture fallback while keeping the dashboard read-only.",
      "Use the dashboard digest to resolve live /admin/source-data, /features/source-data, /roadmap/source-data, /commerce/source-data, and /agent-docs/source-data without scraping private admin pages.",
      "Review work-log entries, for-Mark attention, and checkout health.",
      "Follow iOS issue #67, Android issue #68, dashboard issue #153, scaffold rendering issue #155, or live hydration issue #157 for implementation evidence.",
    ],
    edgeCases: [
      "The iOS simulator target is not App Store distribution, push notifications, private mobile auth, or confirmed-write support.",
      "The Android emulator target is not Play Store distribution, push notifications, private mobile auth, or confirmed-write support.",
      "Private admin state requires Better Auth owner or publisher sessions.",
      "Mobile writes stay disabled until confirmed-write APIs exist.",
      "/mobile-admin/dashboard/source-data is public-safe and excludes private buyer rows, owner email values, raw inbox bodies, R2 object keys, signed URLs, secret values, upload bodies, session IDs, and write tokens.",
    ],
    agentAccess:
      "Agents can read /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data to understand app scope, live public-safe mobile digest state, and smoke evidence; they must not claim mobile app parity until private auth, distribution, and confirmed writes ship.",
    validation: [
      "Issue #13 defines the shared contract and splits iOS and Android child issues.",
      "Issue #67 adds an Expo app scaffold, generated fixture, iOS simulator target, validation command, smoke command, and screenshot path.",
      "Issue #68 adds a native Android activity, generated fixture asset, emulator target, validation command, smoke command, and screenshot path.",
      "Issue #153 adds /mobile-admin/dashboard/source-data as the live public-safe dashboard contract.",
      "Issue #155 renders the live dashboard route and redaction boundary in the Expo, iOS, and Android scaffold surfaces.",
      "Issue #157 fetches the live dashboard route in Expo, iOS, and Android while preserving fixture fallback for deterministic smoke tests.",
      "Playwright covers /agent-docs/bumpgrade-mobile-admin, /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data. Mobile validations assert the scaffold apps render and live-hydrate the dashboard panel.",
    ],
    sortOrder: 42,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-checkout-offer-stack",
    title: "Publisher previews checkout bump and post-purchase decision stack",
    featureId: "feature-checkout-offers",
    featureStatus: "pending",
    issueNumbers: [15, 81, 99, 101, 111, 113, 115, 117, 133],
    primaryUser: "Publisher or agent planning checkout revenue lifts",
    userGoal:
      "Inspect the primary offer, choose the seeded order bump, start a confirmed sandbox Checkout Session, and understand the post-purchase upsell/downsell decision boundary without enabling live billing.",
    sourceEvidence: [
      "https://bumpgrade.com/offers/source-data",
      "https://bumpgrade.com/offers/indie-launch-stack",
      "https://bumpgrade.com/api/commerce/checkout",
      "https://bumpgrade.com/commerce/checkout/success",
      "https://bumpgrade.com/api/commerce/post-purchase-decisions",
      "https://bumpgrade.com/commerce/source-data",
      "https://github.com/markitics/bumpgrade/issues/15",
      "https://github.com/markitics/bumpgrade/issues/81",
      "https://github.com/markitics/bumpgrade/issues/99",
      "https://github.com/markitics/bumpgrade/issues/101",
      "https://github.com/markitics/bumpgrade/issues/111",
      "https://github.com/markitics/bumpgrade/issues/113",
      "https://github.com/markitics/bumpgrade/issues/115",
      "https://github.com/markitics/bumpgrade/issues/117",
      "https://github.com/markitics/bumpgrade/issues/133",
    ],
    happyPath: [
      "Open /offers/indie-launch-stack.",
      "Review the primary sandbox launch pass and launch checklist order bump.",
      "Choose the order bump, enter the exact confirmation text, and submit the sandbox checkout start form.",
      "In test or incomplete-secret environments, receive a redacted preview response.",
      "In production sandbox mode with valid secrets, receive a Bumpgrade redirect URL for the Checkout Session rather than a raw Stripe URL.",
      "Return to /commerce/checkout/success and wait until the redacted post-purchase contract reports trusted webhook eligibility.",
      "After trusted paid checkout evidence exists, open the post-purchase path and record a non-billing upsell or downsell follow-up decision.",
      "Read aggregate post-purchase decision counts from /offers/source-data or /commerce/source-data without exposing buyer, Stripe, entitlement, or private checkout data.",
    ],
    edgeCases: [
      "Live billing mode remains disabled.",
      "Only the seeded order bump can be attached in this slice.",
      "Missing, untrusted, unpaid, stale, or unsupported checkout intents cannot record post-purchase decisions.",
      "One-click upsell/downsell charging, fulfillment, refund, coupon, and customer portal writes require later confirmed-write APIs.",
      "Raw Stripe identifiers and private buyer data stay server-private.",
    ],
    agentAccess:
      "Agents can read /offers/source-data, /commerce/source-data, the preview route, post-purchase decision contracts, and aggregate decision counts. Agents must not create or mutate checkout sessions or billing-impacting post-purchase actions without exact confirmation, idempotency, stale-state checks, audit correlation, redaction, and webhook evidence.",
    validation: [
      "Playwright covers /offers/source-data, /offers/indie-launch-stack, the order-bump form preview response, checkout success webhook gating, post-purchase page rendering, non-billing decision writes, idempotent replay, stale-state rejection, aggregate source-data, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #117 records the first post-purchase upsell/downsell decision evidence boundary.",
      "Issue #133 gates the checkout success CTA on trusted webhook state.",
    ],
    sortOrder: 48,
    updatedAt: null,
  },
  {
    id: "journey-buyer-chooses-post-purchase-offer",
    title: "Buyer chooses a post-purchase follow-up offer",
    featureId: "feature-checkout-offers",
    featureStatus: "pending",
    issueNumbers: [15, 99, 117, 133],
    primaryUser: "Buyer returning from a trusted sandbox checkout",
    userGoal: "Accept or decline a time-boxed upsell/downsell follow-up without triggering a one-click charge.",
    sourceEvidence: [
      "https://bumpgrade.com/commerce/checkout/success",
      "https://bumpgrade.com/commerce/post-purchase/{checkoutIntentId}",
      "https://bumpgrade.com/api/commerce/post-purchase-decisions",
      "https://bumpgrade.com/offers/source-data",
      "https://bumpgrade.com/commerce/source-data",
      "https://github.com/markitics/bumpgrade/issues/15",
      "https://github.com/markitics/bumpgrade/issues/99",
      "https://github.com/markitics/bumpgrade/issues/117",
      "https://github.com/markitics/bumpgrade/issues/133",
    ],
    happyPath: [
      "Complete or simulate a trusted sandbox checkout intent.",
      "Return to the checkout success page and wait for the redacted contract to confirm trusted webhook eligibility.",
      "Open the post-purchase route for that checkout intent.",
      "Choose the launch accelerator upsell or decline it and choose the launch review downsell.",
      "The decision API records follow-up evidence only and returns a redacted public response.",
      "Source-data exposes aggregate decision counts.",
    ],
    edgeCases: [
      "Checkout intents that are missing, stale, or not paid/completed cannot record decisions.",
      "Accepted follow-up decisions do not charge a card or grant access.",
      "Duplicate idempotency keys replay the same decision row.",
      "Raw Stripe IDs, buyer details, entitlement data, and private payment data stay out of public source-data.",
    ],
    agentAccess:
      "Agents can inspect the decision contract and aggregate counts. Agents cannot create billing-impacting post-purchase charges in this slice.",
    validation: [
      "Playwright covers checkout success webhook gating, post-purchase page rendering, accepted/declined decision writes, stale-state rejection, aggregate source-data, and no billing/fulfillment mutation.",
    ],
    sortOrder: 50,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-product-access",
    title: "Publisher previews product access rules",
    featureId: "feature-products-access",
    featureStatus: "pending",
    issueNumbers: [16, 83, 101, 139, 141, 143, 146, 147, 151],
    primaryUser: "Publisher or agent planning fulfillment",
    userGoal: "Inspect products, assets, access rules, entitlement templates, sandbox entitlement grant mappings, and owner entitlement rows before private fulfillment delivery is enabled.",
    sourceEvidence: [
      "https://bumpgrade.com/products/source-data",
      "https://bumpgrade.com/products/indie-launch-library",
      "https://bumpgrade.com/products/entitlements",
      "https://bumpgrade.com/api/products/entitlements",
      "https://bumpgrade.com/api/products/download-tokens",
      "https://bumpgrade.com/api/admin/products/assets",
      "https://bumpgrade.com/admin/products",
      "https://bumpgrade.com/offers/source-data",
      "https://github.com/markitics/bumpgrade/issues/16",
      "https://github.com/markitics/bumpgrade/issues/83",
      "https://github.com/markitics/bumpgrade/issues/101",
      "https://github.com/markitics/bumpgrade/issues/139",
      "https://github.com/markitics/bumpgrade/issues/141",
      "https://github.com/markitics/bumpgrade/issues/143",
      "https://github.com/markitics/bumpgrade/issues/146",
      "https://github.com/markitics/bumpgrade/issues/147",
      "https://github.com/markitics/bumpgrade/issues/151",
    ],
    happyPath: [
      "Fetch /products/source-data.",
      "Find seeded product types, asset IDs, access rules, entitlement templates, sandbox grant mappings, aggregate entitlement inspection counts, customer lookup contract, private R2-backed delivery contract, owner-upload intent contract, revision ID, and write boundary.",
      "Open /products/indie-launch-library to inspect the public preview.",
      "Open /admin/products as a verified owner to inspect private buyer entitlement rows, checkout state, product/price context, and queued fulfillment evidence.",
      "Open /products/entitlements with a checkout intent reference to inspect customer-safe entitlement and fulfillment state.",
      "Create and consume a short-lived download token for an active file entitlement after current entitlement and trusted checkout state are revalidated, streaming the seeded private R2-backed fixture through Bumpgrade without exposing private R2 keys or signed object URLs.",
      "As a verified owner, create a small private product asset upload record only after exact confirmation, idempotency, and catalog revision checks.",
      "Use /offers/source-data and /commerce/source-data to confirm checkout and webhook dependencies before assuming fulfillment exists.",
    ],
    edgeCases: [
      "The seeded product/access catalog is not a product admin.",
      "Public /products/source-data exposes aggregate entitlement and owner-upload counts plus redaction flags, not buyer emails, raw Stripe IDs, hashes, metadata JSON, R2 keys, signed URLs, or upload bodies.",
      "A token is rejected without being consumed when current entitlement or trusted checkout state is no longer eligible.",
      "Owner-uploaded private assets are stored as records but are not yet wired to customer delivery.",
      "Signed object URLs, protected lessons, revocation, customer delivery of arbitrary uploads, and live fulfillment automation require future APIs.",
      "Subscription access requires trusted billing state before membership entitlements can be granted.",
    ],
    agentAccess:
      "Agents can read /products/source-data, aggregate entitlement inspection counts, the preview route, the customer-safe checkout intent lookup contract, the short-lived private R2-backed download-token boundary with redemption revalidation, and the owner-authenticated private asset upload intent boundary. Owner sessions can inspect private buyer entitlement rows in /admin/products and can create small private asset upload records only through exact-confirmed, idempotent, revision-checked writes. Trusted paid sandbox webhooks can grant seeded entitlement rows; direct customer delivery of arbitrary uploads, revocation, and protected content require later APIs.",
    validation: [
      "Playwright covers /products/source-data, aggregate entitlement inspection redaction, /products/indie-launch-library, customer /products/entitlements lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, owner private asset upload intent creation, idempotent replay, unauthorized rejection, owner /admin/products inspection, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #83 records the first product/access source-data contract and preview scaffold.",
      "Issue #101 records the first sandbox webhook-backed entitlement grant path.",
      "Issue #139 records the owner product entitlement inspection path.",
      "Issue #141 records the customer-safe checkout intent entitlement lookup path.",
      "Issue #143 records the short-lived download-token path.",
      "Issue #146 records the seeded private R2-backed fixture delivery path.",
      "Issue #147 records token redemption revalidation against current entitlement and trusted checkout state.",
      "Issue #151 records the owner-confirmed private product asset upload intent path.",
    ],
    sortOrder: 49,
    updatedAt: null,
  },
  {
    id: "journey-publisher-verifies-sandbox-entitlement-grant",
    title: "Publisher verifies sandbox entitlement grant evidence",
    featureId: "feature-products-access",
    featureStatus: "pending",
    issueNumbers: [16, 83, 99, 101, 139, 141, 143, 146, 147, 151],
    primaryUser: "Publisher or agent validating fulfillment readiness",
    userGoal: "Confirm that a paid sandbox checkout webhook can grant product entitlements and queue fulfillment evidence without exposing private assets.",
    sourceEvidence: [
      "https://bumpgrade.com/products/source-data",
      "https://bumpgrade.com/products/entitlements",
      "https://bumpgrade.com/api/products/entitlements",
      "https://bumpgrade.com/api/products/download-tokens",
      "https://bumpgrade.com/api/admin/products/assets",
      "https://bumpgrade.com/admin/products",
      "https://bumpgrade.com/commerce/source-data",
      "https://bumpgrade.com/offers/source-data",
      "https://github.com/markitics/bumpgrade/issues/16",
      "https://github.com/markitics/bumpgrade/issues/99",
      "https://github.com/markitics/bumpgrade/issues/101",
      "https://github.com/markitics/bumpgrade/issues/139",
      "https://github.com/markitics/bumpgrade/issues/141",
      "https://github.com/markitics/bumpgrade/issues/143",
      "https://github.com/markitics/bumpgrade/issues/146",
      "https://github.com/markitics/bumpgrade/issues/147",
      "https://github.com/markitics/bumpgrade/issues/151",
    ],
    happyPath: [
      "Start a sandbox checkout for the primary offer and selected order bump.",
      "Receive trusted checkout.session.completed webhook evidence.",
      "Update the checkout intent to paid.",
      "Insert idempotent product_entitlements rows for mapped line items.",
      "Queue public-safe fulfillment task evidence without returning signed URLs, R2 object keys, or private buyer data.",
      "Open /products/entitlements with the checkout intent reference to confirm customer-safe entitlement and fulfillment status.",
      "Create and consume a one-use download token that revalidates current entitlement and trusted checkout state before streaming the seeded private R2-backed fixture for a file entitlement.",
      "As a verified owner, create a small private upload record for the file asset after exact confirmation, idempotency, and catalog revision checks.",
      "Open /admin/products as a verified owner to inspect the entitlement rows and queued fulfillment evidence.",
    ],
    edgeCases: [
      "Duplicate webhook events do not create duplicate entitlements.",
      "Public /products/source-data exposes aggregate counts and redaction flags, not raw buyer rows.",
      "A token created before a checkout state change is rejected while checkout state is no longer trusted paid or completed.",
      "Owner-uploaded private assets are not yet customer-delivered.",
      "Revocation, signed downloads, protected content, customer portal, refunds, and direct customer delivery of arbitrary uploads require later confirmed-write APIs.",
      "Raw Stripe identifiers and buyer email remain server-private.",
    ],
    agentAccess:
      "Agents can read /products/source-data, /api/products/entitlements, /api/products/download-tokens, and /commerce/source-data to understand the entitlement grant contract, customer-safe lookup, short-lived private R2-backed fixture delivery with redemption revalidation, owner-upload intent boundary, and aggregate inspection counts. Owner sessions can inspect private buyer entitlement rows in /admin/products and create small private asset upload records via exact-confirmed, idempotent, revision-checked writes. Agents cannot grant, revoke, expose private buyer data, deliver arbitrary uploads to customers, or issue signed object URLs without future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers source-data output, aggregate redaction, a paid test checkout webhook that creates entitlement rows, customer-safe lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, owner private asset upload intent creation, idempotent replay, unauthorized rejection, owner /admin/products inspection, and duplicate webhook idempotency.",
      "Issue #101 records the sandbox entitlement grant path.",
      "Issue #139 records the owner product entitlement inspection path.",
      "Issue #141 records the customer-safe product entitlement lookup path.",
      "Issue #143 records the short-lived download-token path.",
      "Issue #146 records the seeded private R2-backed fixture delivery path.",
      "Issue #147 records token redemption revalidation against current entitlement and trusted checkout state.",
      "Issue #151 records the owner-confirmed private product asset upload intent path.",
    ],
    sortOrder: 50,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-audience-automation",
    title: "Publisher previews audience opt-in automation",
    featureId: "feature-email-automation-crm",
    featureStatus: "pending",
    issueNumbers: [17, 85, 103, 137, 167],
    primaryUser: "Publisher or agent planning list growth",
    userGoal: "Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, and the live consent/unsubscribe boundary before email sends exist.",
    sourceEvidence: [
      "https://bumpgrade.com/audience/source-data",
      "https://bumpgrade.com/audience/indie-launch-waitlist",
      "https://bumpgrade.com/api/audience/opt-in",
      "https://bumpgrade.com/api/audience/unsubscribe",
      "https://bumpgrade.com/admin/audience",
      "https://bumpgrade.com/funnels/source-data",
      "https://github.com/markitics/bumpgrade/issues/17",
      "https://github.com/markitics/bumpgrade/issues/85",
      "https://github.com/markitics/bumpgrade/issues/103",
      "https://github.com/markitics/bumpgrade/issues/137",
      "https://github.com/markitics/bumpgrade/issues/167",
    ],
    happyPath: [
      "Fetch /audience/source-data.",
      "Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, and write boundaries.",
      "Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.",
      "Confirm the API trims and normalizes email, stores consent evidence, assigns seeded tags, and records draft sequence enrollment without sending email.",
      "Submit the unsubscribe form or POST /api/audience/unsubscribe with an email and idempotency key.",
      "Confirm the unsubscribe API records suppression evidence, marks a known subscriber unsubscribed, and does not reveal whether the submitted email was already on the list.",
      "Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, and suppression totals.",
      "Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists.",
    ],
    edgeCases: [
      "The seeded audience automation workspace can capture explicit-consent opt-ins and record unsubscribe/suppression evidence, but it is not a general contact import or CRM database.",
      "Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, reasons, or private metadata.",
      "The unsubscribe API returns the submitted normalized email to the submitter but does not reveal list membership.",
      "Subscriber imports, direct agent contact writes, email sends, broadcasts, private exports, and CRM notes require future confirmed-write APIs.",
      "Codex project email in issue #10 is separate from publisher/customer email workflows.",
    ],
    agentAccess:
      "Agents can read /audience/source-data, aggregate subscriber and suppression counts, and the opt-in/unsubscribe write boundaries. Owner sessions can inspect private rows in /admin/audience. Direct agent subscriber writes, imports, sends, broadcasts, private exports, or CRM notes require future authenticated confirmed-write APIs with consent, suppression, and sender-domain safety.",
    validation: [
      "Playwright covers /audience/source-data, aggregate subscriber and suppression redaction, /audience/indie-launch-waitlist, valid opt-in, unsubscribe, unknown-email suppression, owner /admin/audience inspection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.",
      "Issues #85, #103, #137, and #167 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, and unsubscribe/suppression path.",
    ],
    sortOrder: 50,
    updatedAt: null,
  },
  {
    id: "journey-visitor-joins-indie-launch-waitlist",
    title: "Visitor joins the indie launch waitlist",
    featureId: "feature-email-automation-crm",
    featureStatus: "pending",
    issueNumbers: [17, 85, 103, 167],
    primaryUser: "Visitor interested in the launch checklist",
    userGoal: "Submit a normalized email and explicit consent, then receive a safe confirmation that Bumpgrade recorded the opt-in without sending email yet.",
    sourceEvidence: [
      "https://bumpgrade.com/audience/indie-launch-waitlist",
      "https://bumpgrade.com/audience/source-data",
      "https://bumpgrade.com/api/audience/opt-in",
      "https://bumpgrade.com/api/audience/unsubscribe",
      "https://github.com/markitics/bumpgrade/issues/17",
      "https://github.com/markitics/bumpgrade/issues/85",
      "https://github.com/markitics/bumpgrade/issues/103",
      "https://github.com/markitics/bumpgrade/issues/167",
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
      "A later unsubscribe request records suppression evidence and marks a known subscriber unsubscribed without revealing list membership.",
      "Email sending, imports, broadcasts, and CRM notes remain disabled.",
      "Private contact metadata and provider IDs stay server-private.",
    ],
    agentAccess:
      "Agents can read /audience/source-data, the opt-in write boundary, and the unsubscribe/suppression write boundary. Direct agent subscriber writes, imports, sends, broadcasts, or CRM notes require future authenticated confirmed-write APIs with consent, suppression, and sender-domain safety.",
    validation: [
      "Playwright covers source-data output, valid opt-in, unsubscribe, unknown-email suppression, validation failures, duplicate idempotency, and agent manifest discovery.",
      "Issues #103 and #167 record the first live audience opt-in and unsubscribe/suppression paths.",
    ],
    sortOrder: 51,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-analytics-experiments",
    title: "Publisher previews analytics and experiment reporting",
    featureId: "feature-analytics-testing",
    featureStatus: "pending",
    issueNumbers: [18, 87, 105, 107, 119, 121, 123, 125, 127, 129],
    primaryUser: "Publisher or agent optimizing a launch funnel",
    userGoal:
      "Inspect seeded analytics definitions, capture privacy-safe test events, record browser-side funnel page views with deterministic variant and source attribution evidence, read dashboard-visible fixed-window aggregate source rows, assign deterministic variants, and read aggregate conversion report rows before cookies, contact-level reporting, or automated decisions exist.",
    sourceEvidence: [
      "https://bumpgrade.com/analytics/source-data",
      "https://bumpgrade.com/analytics/indie-launch-dashboard",
      "https://bumpgrade.com/api/analytics/events",
      "https://bumpgrade.com/api/analytics/assignments",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/funnels/indie-launch-sandbox",
      "https://github.com/markitics/bumpgrade/issues/18",
      "https://github.com/markitics/bumpgrade/issues/87",
      "https://github.com/markitics/bumpgrade/issues/105",
      "https://github.com/markitics/bumpgrade/issues/107",
      "https://github.com/markitics/bumpgrade/issues/119",
      "https://github.com/markitics/bumpgrade/issues/121",
      "https://github.com/markitics/bumpgrade/issues/123",
      "https://github.com/markitics/bumpgrade/issues/125",
      "https://github.com/markitics/bumpgrade/issues/127",
      "https://github.com/markitics/bumpgrade/issues/129",
    ],
    happyPath: [
      "Fetch /analytics/source-data.",
      "Find event IDs, page-view beacon boundary, aggregate source attribution counts, aggregate variant event counts, fixed time windows, metric IDs, aggregate event counts, aggregate conversion report rows, experiment IDs, variant IDs, assignment rule, assignment API, dashboard source section, and write boundary.",
      "Fetch /analytics/source-data?window=24h to inspect public-safe aggregate source and conversion rows for one supported fixed window.",
      "Open /funnels/indie-launch-sandbox with safe UTM parameters and let the session-idempotent page-view beacon assign a variant and record a seeded event with that variant ID and normalized source attribution.",
      "POST a seeded event to /api/analytics/events with an idempotency key and source route.",
      "POST a seeded experiment assignment to /api/analytics/assignments with an anonymous assignment key, idempotency key, and source route.",
      "Confirm duplicate idempotency returns the same public-safe event or assignment without duplicating rows.",
      "Open /analytics/indie-launch-dashboard to inspect the public preview, aggregate source rows, fixed-window controls, and caveats.",
    ],
    edgeCases: [
      "Public source-data exposes aggregate counts, aggregate source attribution counts, aggregate variant counts, fixed-window metadata, and conversion rows only, not raw event or assignment rows.",
      "Unsupported event IDs, experiment IDs, source routes, missing idempotency keys, and missing assignment keys return public-safe validation errors.",
      "Bot, crawler, and preview/test-suppressed page-view traffic is ignored before analytics event rows are created.",
      "Cookie assignment, contact-level analytics, raw referrer/query reporting, experiment traffic changes, automated winners, and revenue claims require future confirmed-write APIs.",
      "Agents must include sample-size caveats and must not call sparse test events or assignments statistically meaningful.",
    ],
    agentAccess:
      "Agents can read /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard, event capture boundaries, page-view beacon boundaries, dashboard-visible fixed-window aggregate source attribution evidence, aggregate variant evidence, assignment boundaries, and aggregate conversion report rows. Direct agent analytics writes, custom events, raw campaign/referrer reporting, experiment routing, and automated decisions require future authenticated confirmed-write APIs with privacy review, idempotency, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.",
    validation: [
      "Playwright covers /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard fixed-window source attribution UI, event ingestion, page-view beacon capture with variant and source attribution evidence, bot suppression, assignment ingestion, conversion reporting from captured events, duplicate idempotency, deterministic assignment, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.",
      "Issues #87, #105, #107, #119, #121, #123, #125, #127, and #129 record the analytics source-data scaffold, first privacy-safe event capture path, first deterministic assignment path, first aggregate conversion report, first browser-side funnel page-view beacon, first variant-linked page-view evidence, first aggregate source attribution evidence, first dashboard-visible source breakdown, and first fixed-window aggregate filters.",
    ],
    sortOrder: 51,
    updatedAt: null,
  },
  {
    id: "journey-publisher-reads-funnel-conversion-report",
    title: "Publisher reads a funnel conversion report",
    featureId: "feature-analytics-testing",
    featureStatus: "pending",
    issueNumbers: [18, 87, 105, 107, 119, 121, 123, 125, 127, 129],
    primaryUser: "Publisher or agent validating funnel optimization evidence",
    userGoal:
      "Read visitor, conversion, and conversion-rate rows from captured test events without exposing raw analytics events or visitor identifiers.",
    sourceEvidence: [
      "https://bumpgrade.com/analytics/source-data",
      "https://bumpgrade.com/analytics/indie-launch-dashboard",
      "https://github.com/markitics/bumpgrade/issues/18",
      "https://github.com/markitics/bumpgrade/issues/119",
      "https://github.com/markitics/bumpgrade/issues/121",
      "https://github.com/markitics/bumpgrade/issues/123",
      "https://github.com/markitics/bumpgrade/issues/125",
      "https://github.com/markitics/bumpgrade/issues/127",
      "https://github.com/markitics/bumpgrade/issues/129",
    ],
    happyPath: [
      "Capture seeded analytics events with idempotency or visit the public funnel preview to assign a seeded variant and emit a session-idempotent page-view event with variant and source attribution evidence.",
      "Fetch /analytics/source-data.",
      "Read funnelConversionReport rows for metric ID, step ID, visitor count, conversion count, conversion rate, report mode, selected time window, and sample-size caveat.",
      "Switch /analytics/source-data?window=24h or the dashboard window control to inspect the same aggregate report in a fixed window.",
      "Open /analytics/indie-launch-dashboard and confirm the report and source attribution section render captured aggregate rows when samples exist.",
    ],
    edgeCases: [
      "Duplicate idempotency does not inflate conversion counts.",
      "Bot and preview/test-suppressed page-view traffic is ignored before it can inflate visitor counts.",
      "Rows fall back to fixture counts only when no captured samples exist.",
      "Raw analytics rows, full referrers, raw query strings, IP hashes, user agent hashes, visitor keys, contact IDs, and Stripe IDs are not included.",
      "Sparse samples are not statistically meaningful and must be labeled with caveats.",
    ],
    agentAccess:
      "Agents can read aggregate funnel conversion rows by fixed window and cite metric IDs, event IDs, dashboard-visible aggregate source attribution evidence, aggregate variant evidence, and issues #119/#121/#123/#125/#127/#129 evidence. Direct analytics writes, raw referrer/query reporting, traffic routing, and automated experiment decisions require future confirmed-write APIs.",
    validation: [
      "Playwright seeds captured events, visits the funnel page-view beacon, replays duplicate idempotency, verifies aggregate source and variant counts, verifies dashboard fixed-window source row rendering, verifies conversion counts and rates, and checks public source-data excludes raw/private rows.",
      "Issues #119, #121, #123, #125, #127, and #129 record the aggregate conversion report, browser-side funnel page-view instrumentation, variant-linked page-view evidence, source-attributed page-view evidence, dashboard source attribution preview, and fixed-window aggregate controls.",
    ],
    sortOrder: 55,
    updatedAt: null,
  },
  {
    id: "journey-agent-records-privacy-safe-analytics-event",
    title: "Agent records a privacy-safe analytics event",
    featureId: "feature-analytics-testing",
    featureStatus: "pending",
    issueNumbers: [18, 87, 105, 121, 125],
    primaryUser: "Agent or system integration validating event capture",
    userGoal: "Record a seeded analytics event with idempotency and verify Bumpgrade stores only public-safe fields plus hashed request evidence.",
    sourceEvidence: [
      "https://bumpgrade.com/api/analytics/events",
      "https://bumpgrade.com/analytics/source-data",
      "https://github.com/markitics/bumpgrade/issues/18",
      "https://github.com/markitics/bumpgrade/issues/87",
      "https://github.com/markitics/bumpgrade/issues/105",
      "https://github.com/markitics/bumpgrade/issues/121",
      "https://github.com/markitics/bumpgrade/issues/125",
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
      "Known bot/crawler and explicit preview/test-suppressed traffic returns an ignored public-safe response without adding analytics event rows.",
      "Private request fields are hashed or omitted.",
      "The API does not create cookies, store raw campaign/referrer payloads, route experiment traffic, or decide winners.",
    ],
    agentAccess:
      "Agents can inspect the event capture contract and propose seeded analytics events with normalized public properties, but direct agent analytics writes beyond seeded events and raw attribution access require future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers valid event ingestion, bot/crawler suppression, duplicate idempotency, validation failures, normalized source attribution, and aggregate-only source-data.",
      "Issues #105, #121, and #125 record the first live analytics event capture path, first bot-suppressed browser beacon path, and normalized source attribution boundary.",
    ],
    sortOrder: 53,
    updatedAt: null,
  },
  {
    id: "journey-agent-assigns-privacy-safe-experiment-variant",
    title: "Agent assigns a privacy-safe experiment variant",
    featureId: "feature-analytics-testing",
    featureStatus: "pending",
    issueNumbers: [18, 87, 105, 107],
    primaryUser: "Agent or system integration validating A/B assignment",
    userGoal:
      "Assign a seeded experiment variant with idempotency and verify Bumpgrade stores only public-safe response fields plus hashed visitor evidence.",
    sourceEvidence: [
      "https://bumpgrade.com/api/analytics/assignments",
      "https://bumpgrade.com/analytics/source-data",
      "https://github.com/markitics/bumpgrade/issues/18",
      "https://github.com/markitics/bumpgrade/issues/87",
      "https://github.com/markitics/bumpgrade/issues/105",
      "https://github.com/markitics/bumpgrade/issues/107",
    ],
    happyPath: [
      "Choose a seeded experiment definition from /analytics/source-data.",
      "POST the experiment ID, source route, anonymous assignment key, and idempotency key to /api/analytics/assignments.",
      "Replay the same idempotency key and receive the same public-safe assignment ID.",
      "Use a new idempotency key with the same anonymous assignment key and receive the same variant and bucket.",
      "Read aggregate assignment counts from /analytics/source-data without exposing raw assignment rows.",
    ],
    edgeCases: [
      "Missing idempotency is rejected.",
      "Missing anonymous assignment key is rejected.",
      "Unsupported experiment IDs and source routes are rejected.",
      "Private request fields are hashed or omitted.",
      "The API does not set cookies, route traffic, create page-view events, mutate campaign attribution, or decide winners.",
    ],
    agentAccess:
      "Agents can inspect the assignment contract and propose experiment assignment tests, but direct agent experiment writes beyond seeded assignment requires future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers valid assignment ingestion, duplicate idempotency, deterministic replay with a new idempotency key, validation failures, and aggregate-only source-data.",
      "Issue #107 records the first deterministic experiment assignment path.",
    ],
    sortOrder: 54,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-affiliate-referrals",
    title: "Publisher previews affiliate and referral management",
    featureId: "feature-affiliates-referrals",
    featureStatus: "pending",
    issueNumbers: [19, 89, 109, 111, 113, 115],
    primaryUser: "Publisher or agent planning partner growth",
    userGoal:
      "Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, review-only ledger evidence, owner review/reversal state, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before payouts exist.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/source-data",
      "https://bumpgrade.com/affiliates/indie-launch-partners",
      "https://bumpgrade.com/api/affiliates/clicks",
      "https://bumpgrade.com/api/affiliates/commission-ledger",
      "https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions",
      "https://bumpgrade.com/api/commerce/checkout",
      "https://bumpgrade.com/commerce/source-data",
      "https://bumpgrade.com/offers/source-data",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/89",
      "https://github.com/markitics/bumpgrade/issues/109",
      "https://github.com/markitics/bumpgrade/issues/111",
      "https://github.com/markitics/bumpgrade/issues/113",
      "https://github.com/markitics/bumpgrade/issues/115",
    ],
    happyPath: [
      "Fetch /affiliates/source-data.",
      "Find the seeded affiliate program, revision ID, partner IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, owner review action contract, and write boundary.",
      "POST a seeded referral click to /api/affiliates/clicks with referral link ID or code, destination route, and idempotency key.",
      "Start a sandbox checkout intent through /api/commerce/checkout with the referral click ID and checkout idempotency key.",
      "Create review-only commission evidence through /api/affiliates/commission-ledger with checkout intent ID, exact confirmation, and idempotency key.",
      "As an owner, POST a review, hold, or reversal action to /api/admin/affiliates/commission-ledger/actions with exact confirmation, idempotency, expected updatedAt, and reason.",
      "Confirm duplicate idempotency returns the same ledger row and does not duplicate commission evidence.",
      "Open /affiliates/indie-launch-partners to inspect the public preview.",
      "Use /commerce/source-data and /offers/source-data to distinguish checkout attribution evidence, review-only ledger evidence, and owner review/reversal actions from payable commissions.",
    ],
    edgeCases: [
      "Public source-data exposes aggregate click, checkout attribution, commission ledger, and owner action counts only, not raw click, checkout, buyer, actor, reason, or payout rows.",
      "Unsupported referral link IDs, codes, destination routes, referral click IDs, checkout intent IDs, commission ledger IDs, action kinds, stale expected updatedAt values, and missing idempotency keys return public-safe validation errors.",
      "Cookie assignment, buyer attribution finalization, payable commission writes, payout accounts, tax forms, fraud enforcement, Stripe payouts, and partner notifications require future confirmed-write APIs.",
      "Agents must not call review-only commission evidence payable or published affiliate terms.",
    ],
    agentAccess:
      "Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, and owner review action boundaries. Payout, fraud, tax, partner notification, partner payout account storage, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries.",
    validation: [
      "Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, duplicate idempotency, stale-state validation, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.",
      "Issues #89, #109, #111, #113, and #115 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, and owner review/reversal action boundary.",
    ],
    sortOrder: 52,
    updatedAt: null,
  },
  {
    id: "journey-agent-records-privacy-safe-referral-click",
    title: "Agent records a privacy-safe referral click",
    featureId: "feature-affiliates-referrals",
    featureStatus: "pending",
    issueNumbers: [19, 89, 109],
    primaryUser: "Agent or system integration validating referral tracking",
    userGoal:
      "Record a seeded referral click with idempotency and verify Bumpgrade stores only public-safe response fields plus hashed request evidence.",
    sourceEvidence: [
      "https://bumpgrade.com/api/affiliates/clicks",
      "https://bumpgrade.com/affiliates/source-data",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/89",
      "https://github.com/markitics/bumpgrade/issues/109",
    ],
    happyPath: [
      "Choose a seeded referral link from /affiliates/source-data.",
      "POST the referral link ID or code, destination route, and idempotency key to /api/affiliates/clicks.",
      "Replay the same idempotency key and receive the same public-safe click ID.",
      "Read aggregate click counts from /affiliates/source-data without exposing raw click rows.",
    ],
    edgeCases: [
      "Missing idempotency is rejected.",
      "Unsupported referral links, codes, and destination routes are rejected.",
      "Private request fields are hashed or omitted.",
      "The API does not set cookies, attribute buyers, create commissions, mutate payout state, or enforce fraud decisions.",
    ],
    agentAccess:
      "Agents can inspect the click capture contract and propose referral click tests, but buyer attribution, commission writes, payout mutations, fraud decisions, and direct agent affiliate writes require future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers valid click ingestion, duplicate idempotency, validation failures, and aggregate-only source-data.",
      "Issue #109 records the first live referral click capture path.",
    ],
    sortOrder: 55,
    updatedAt: null,
  },
  {
    id: "journey-agent-attaches-referral-click-to-checkout",
    title: "Agent attaches referral click evidence to checkout",
    featureId: "feature-affiliates-referrals",
    featureStatus: "pending",
    issueNumbers: [19, 109, 111],
    primaryUser: "Agent or system integration validating referral-to-checkout tracking",
    userGoal:
      "Record a seeded referral click, create a sandbox checkout intent that references it, and verify Bumpgrade stores only public-safe attribution evidence.",
    sourceEvidence: [
      "https://bumpgrade.com/api/affiliates/clicks",
      "https://bumpgrade.com/api/commerce/checkout",
      "https://bumpgrade.com/commerce/source-data",
      "https://bumpgrade.com/affiliates/source-data",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/109",
      "https://github.com/markitics/bumpgrade/issues/111",
    ],
    happyPath: [
      "POST a seeded referral click for the launch funnel with idempotency.",
      "POST /api/commerce/checkout with exact confirmation text, checkout idempotency, and the referral click ID.",
      "Replay the checkout idempotency key and receive the same checkout intent plus the same attribution evidence.",
      "Read aggregate attribution counts from /commerce/source-data or /affiliates/source-data without exposing raw rows.",
    ],
    edgeCases: [
      "Missing or unknown referral click IDs are rejected.",
      "Referral clicks for non-eligible destinations are rejected.",
      "The evidence row does not create a commission, payout, fraud decision, tax record, partner notification, or buyer attribution finalization.",
      "Private request, buyer, and Stripe fields remain server-private.",
    ],
    agentAccess:
      "Agents can inspect the checkout attribution contract and propose referral-to-checkout tests, but commission writes, payout mutations, fraud decisions, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers referral click creation, checkout attribution attachment, duplicate idempotency, validation failures, and aggregate-only source-data.",
      "Issue #111 records the first checkout referral attribution evidence path.",
    ],
    sortOrder: 56,
    updatedAt: null,
  },
  {
    id: "journey-agent-creates-review-only-commission-evidence",
    title: "Agent creates review-only commission evidence",
    featureId: "feature-affiliates-referrals",
    featureStatus: "pending",
    issueNumbers: [19, 109, 111, 113],
    primaryUser: "Agent or system integration validating referral-to-commission tracking",
    userGoal:
      "Create a review-only commission ledger row from trusted sandbox checkout attribution and verify it remains non-payable.",
    sourceEvidence: [
      "https://bumpgrade.com/api/affiliates/clicks",
      "https://bumpgrade.com/api/commerce/checkout",
      "https://bumpgrade.com/api/affiliates/commission-ledger",
      "https://bumpgrade.com/commerce/source-data",
      "https://bumpgrade.com/affiliates/source-data",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/109",
      "https://github.com/markitics/bumpgrade/issues/111",
      "https://github.com/markitics/bumpgrade/issues/113",
    ],
    happyPath: [
      "POST a seeded referral click for the launch funnel with idempotency.",
      "POST /api/commerce/checkout with exact confirmation text, checkout idempotency, and the referral click ID.",
      "POST /api/affiliates/commission-ledger with exact commission confirmation, checkout intent ID, and ledger idempotency key.",
      "Replay the ledger idempotency key and receive the same non-payable ledger evidence.",
      "Read aggregate ledger counts from /commerce/source-data or /affiliates/source-data without exposing raw rows.",
    ],
    edgeCases: [
      "Missing or unknown checkout intent IDs are rejected.",
      "Checkout intents without referral attribution are rejected.",
      "Ledger evidence remains review-only and does not create payout, tax, fraud, partner notification, or buyer attribution finalization state.",
      "Private request, buyer, and Stripe fields remain server-private.",
    ],
    agentAccess:
      "Agents can inspect the review-only ledger contract and propose referral-to-commission tests. Owner sessions can review, hold, or reverse evidence through issue #115, but payable commission writes, payout mutations, fraud decisions, buyer attribution finalization, partner notifications, and direct agent affiliate writes require future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers referral click creation, checkout attribution attachment, review-only ledger creation, duplicate idempotency, validation failures, and aggregate-only source-data.",
      "Issue #113 records the first review-only commission ledger evidence path.",
    ],
    sortOrder: 57,
    updatedAt: null,
  },
  {
    id: "journey-owner-reviews-commission-ledger-evidence",
    title: "Owner reviews or reverses commission evidence",
    featureId: "feature-affiliates-referrals",
    featureStatus: "pending",
    issueNumbers: [19, 113, 115],
    primaryUser: "Owner reviewing affiliate commission evidence before payout exists",
    userGoal:
      "Apply an owner review, hold, or reversal action to review-only commission evidence without making it payable.",
    sourceEvidence: [
      "https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions",
      "https://bumpgrade.com/api/affiliates/commission-ledger",
      "https://bumpgrade.com/commerce/source-data",
      "https://bumpgrade.com/affiliates/source-data",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/113",
      "https://github.com/markitics/bumpgrade/issues/115",
    ],
    happyPath: [
      "Create review-only commission ledger evidence from trusted checkout attribution.",
      "Read the current ledger updatedAt from the ledger creation response.",
      "POST an owner review action with exact confirmation, idempotency key, action kind, expectedUpdatedAt, and public reason.",
      "Replay the idempotency key and receive the same action row.",
      "Read aggregate review action counts from /commerce/source-data or /affiliates/source-data without exposing raw actor, buyer, Stripe, payout, or private reason fields.",
    ],
    edgeCases: [
      "Signed-out requests are rejected.",
      "Missing confirmation, unknown action kinds, unknown ledgers, stale expectedUpdatedAt values, and conflicting idempotency keys are rejected.",
      "Actions keep payoutStatus not_payable and do not create payout, tax, fraud, partner notification, or buyer attribution finalization state.",
      "Private actor identity and private reasons remain server-private.",
    ],
    agentAccess:
      "Agents can inspect public-safe review action contracts and aggregate counts. Direct agent review/reversal writes, payable commission writes, payout mutation, fraud decisions, buyer attribution finalization, and partner notifications require future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers owner sign-in, review action creation, duplicate idempotency, stale-state rejection, signed-out rejection, aggregate-only source-data, and no payout/tax/partner notification state.",
      "Issue #115 records the first owner-gated review/reversal action boundary.",
    ],
    sortOrder: 58,
    updatedAt: null,
  },
  {
    id: "journey-publisher-plans-first-checkout",
    title: "Publisher plans the first paid offer",
    featureId: "feature-stripe-commerce",
    featureStatus: "live",
    issueNumbers: [11, 34, 15, 16, 81, 99, 101, 111, 113, 115, 117, 133],
    primaryUser: "Publisher preparing to sell a digital offer",
    userGoal:
      "Plan a checkout offer stack with a primary offer, order bump, post-purchase upsell, and downsell while seeing what is live, what is only decision evidence, and what remains billing-locked.",
    sourceEvidence: [
      "https://bumpgrade.com/features",
      "https://bumpgrade.com/roadmap",
      "https://bumpgrade.com/commerce/source-data",
      "https://bumpgrade.com/offers/source-data",
      "https://bumpgrade.com/offers/indie-launch-stack",
      "https://bumpgrade.com/api/commerce/checkout",
      "https://bumpgrade.com/commerce/checkout/success",
      "https://bumpgrade.com/api/commerce/post-purchase-decisions",
      "https://bumpgrade.com/products/source-data",
      "https://bumpgrade.com/affiliates/source-data",
      "https://github.com/markitics/bumpgrade/issues/11",
      "https://github.com/markitics/bumpgrade/issues/34",
      "https://github.com/markitics/bumpgrade/issues/15",
      "https://github.com/markitics/bumpgrade/issues/16",
      "https://github.com/markitics/bumpgrade/issues/81",
      "https://github.com/markitics/bumpgrade/issues/99",
      "https://github.com/markitics/bumpgrade/issues/101",
      "https://github.com/markitics/bumpgrade/issues/111",
      "https://github.com/markitics/bumpgrade/issues/113",
      "https://github.com/markitics/bumpgrade/issues/115",
      "https://github.com/markitics/bumpgrade/issues/117",
      "https://github.com/markitics/bumpgrade/issues/133",
    ],
    happyPath: [
      "Create or identify a commerce product record.",
      "Attach a price record with currency, amount, interval, and optional Stripe Price id.",
      "Optionally attach a validated seeded referral click when creating a checkout intent.",
      "Create a checkout intent with an idempotency key and audit correlation id.",
      "Use sandbox Stripe Checkout first.",
      "Let the webhook update intent, subscription, entitlement, and audit state before public fulfillment is trusted.",
      "Let the checkout success page gate the post-purchase CTA on trusted webhook state.",
      "Use trusted checkout state to open the post-purchase path and record non-billing upsell/downsell follow-up evidence.",
      "Read aggregate post-purchase decision counts from /offers/source-data or /commerce/source-data without exposing buyer, Stripe, entitlement, or private checkout data.",
    ],
    edgeCases: [
      "Live mode is not the default; live rollout needs an explicit later issue.",
      "Agent-started checkout requires exact confirmation and an audit record before Stripe is called.",
      "Webhook payloads must be redacted before model-readable surfaces expose them.",
      "Referral click evidence is not a commission, payout, fraud decision, or buyer attribution finalization.",
      "Post-purchase decision evidence is not one-click charging, fulfillment, entitlement grants, or payable commission state.",
      "Raw card data never enters Bumpgrade.",
    ],
    agentAccess:
      "Agents may read the architecture, product, price, checkout-intent, referral attribution, post-purchase decision aggregates, and redacted webhook records once exposed. Agents must not create checkout sessions or billing-impacting post-purchase writes without confirmed-write rules, idempotency, audit correlation, and stale-state checks, and must not create commissions or payout state.",
    validation: [
      "Issue #11 defines the D1 data model and secret plan.",
      "Issue #34 tracks the first sandbox route and webhook ingestion implementation.",
      "Issue #111 records the first checkout referral attribution evidence path.",
      "Issue #117 records the first post-purchase upsell/downsell decision evidence boundary.",
      "Issue #133 records the checkout success CTA gating boundary.",
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
