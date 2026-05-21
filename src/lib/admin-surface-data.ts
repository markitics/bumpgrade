import { getCloudflareContext } from "@opennextjs/cloudflare";

import { type FeatureStatus } from "@/lib/feature-catalog";
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
  featureStatus: FeatureStatus;
  issueNumbers: number[];
  primaryUser: string;
  userGoal: string;
  sourceEvidence: string[];
  happyPath: string[];
  edgeCases: string[];
  agentAccess: string;
  validation: string[];
  proof?: AdminUserJourneyProof;
  sortOrder: number;
  updatedAt: string | null;
};

export type AdminUserJourneyProof = {
  status: "passed" | "partial" | "blocked" | "not_run";
  lastTestedAt: string | null;
  environment: string;
  method: string;
  summary: string;
  ciLinks: AdminLink[];
  screenshotLinks: AdminLink[];
  validationLinks: AdminLink[];
  notes: string[];
};

export type AdminUserJourneyProofSummary = {
  totalJourneys: number;
  testedJourneys: number;
  partialJourneys: number;
  blockedJourneys: number;
  notRunJourneys: number;
  screenshotLinks: number;
  ciLinks: number;
  latestTestedAt: string | null;
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

export function summarizeUserJourneyProof(userJourneys: AdminUserJourney[]): AdminUserJourneyProofSummary {
  let latestTimestamp = 0;

  const summary = userJourneys.reduce<AdminUserJourneyProofSummary>(
    (acc, journey) => {
      acc.totalJourneys += 1;

      if (journey.proof?.status === "passed") acc.testedJourneys += 1;
      if (journey.proof?.status === "partial") acc.partialJourneys += 1;
      if (journey.proof?.status === "blocked") acc.blockedJourneys += 1;
      if (journey.proof?.status === "not_run") acc.notRunJourneys += 1;

      acc.screenshotLinks += journey.proof?.screenshotLinks.length ?? 0;
      acc.ciLinks += journey.proof?.ciLinks.length ?? 0;

      if (journey.proof?.lastTestedAt) {
        const timestamp = Date.parse(journey.proof.lastTestedAt);
        if (Number.isFinite(timestamp) && timestamp > latestTimestamp) latestTimestamp = timestamp;
      }

      return acc;
    },
    {
      totalJourneys: 0,
      testedJourneys: 0,
      partialJourneys: 0,
      blockedJourneys: 0,
      notRunJourneys: 0,
      screenshotLinks: 0,
      ciLinks: 0,
      latestTestedAt: null,
    },
  );

  return {
    ...summary,
    latestTestedAt: latestTimestamp ? new Date(latestTimestamp).toISOString() : null,
  };
}

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
  feature_status: FeatureStatus;
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

const launchProofUpdatedAt = "2026-05-20T14:31:00.000Z";
const issue217PrUrl = "https://github.com/markitics/bumpgrade/pull/218";
const issue217CiRunUrl = "https://github.com/markitics/bumpgrade/actions/runs/26155451076";
const issue222PrUrl = "https://github.com/markitics/bumpgrade/pull/227";
const issue222CiRunUrl = "https://github.com/markitics/bumpgrade/actions/runs/26160043319";
const issue223PrUrl = "https://github.com/markitics/bumpgrade/pull/228";
const issue223LivePrUrl = "https://github.com/markitics/bumpgrade/pull/229";
const issue223CiRunUrl = "https://github.com/markitics/bumpgrade/actions/runs/26162614936";
const issue224PrUrl = "https://github.com/markitics/bumpgrade/pull/230";
const issue224CiRunUrl = "https://github.com/markitics/bumpgrade/actions/runs/26164091138";
const issue225PrUrl = "https://github.com/markitics/bumpgrade/pull/232";
const issue225CiRunUrl = "https://github.com/markitics/bumpgrade/actions/runs/26166024751";
const issue226PrUrl = "https://github.com/markitics/bumpgrade/pull/233";
const issue226CiRunUrl = "https://github.com/markitics/bumpgrade/actions/runs/26168608279";
const issue217CiWorkflowUrl = "https://github.com/markitics/bumpgrade/actions/workflows/ci.yml";
const issue240PrUrl = "https://github.com/markitics/bumpgrade/pull/241";
const issue240CiRunUrl = "https://github.com/markitics/bumpgrade/actions/runs/26173122434";
const issue242PrUrl = "https://github.com/markitics/bumpgrade/pull/243";
const issue242CiRunUrl = "https://github.com/markitics/bumpgrade/actions/runs/26175118817";
const issue244PrUrl = "https://github.com/markitics/bumpgrade/pull/244";
const issue244MainCiRunUrl = "https://github.com/markitics/bumpgrade/actions/runs/26176981405";
const journeyProofRefreshAt = "2026-05-20T17:20:00.000Z";

const defaultJourneyProof: AdminUserJourneyProof = {
  status: "partial",
  lastTestedAt: null,
  environment: "Bumpgrade production or local preview, depending on the linked evidence.",
  method: "Route smoke, source-data inspection, and issue-linked screenshot review.",
  summary: "Historical route evidence exists; this journey should be retested when its feature changes.",
  ciLinks: [
    { label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" },
  ],
  screenshotLinks: [
    { label: "PR screenshots index", url: "https://bumpgrade.com/pr-screenshots/issue-6-features-desktop.png", kind: "screenshot" },
  ],
  validationLinks: [
    { label: "Admin user journeys source data", url: "https://bumpgrade.com/admin/user-journeys/source-data", kind: "source-data" },
  ],
  notes: ["Default proof is attached when a journey does not have a more specific proof bundle yet."],
};

const journeyProofById: Record<string, AdminUserJourneyProof> = {
  "journey-compare-bumpgrade-to-clickfunnels": {
    status: "passed",
    lastTestedAt: journeyProofRefreshAt,
    environment: "GitHub Actions CI, merged PR #243, deployed screenshots, and production comparison route smoke.",
    method: "Comparison hub route smoke, every alternative-page route smoke, source-data inspection, and marketing-copy visible-text scan.",
    summary:
      "The comparison journey has current proof for /compare, the ClickFunnels alternative page, competitor-source metadata, and public copy that avoids internal implementation language.",
    ciLinks: [
      { label: "PR #243 CI run", url: issue242CiRunUrl, kind: "ci" },
      { label: "Main CI after PR #243", url: "https://github.com/markitics/bumpgrade/actions/runs/26175761582", kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Compare issue #242 screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-242-compare.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Comparison hub", url: "https://bumpgrade.com/compare", kind: "route" },
      { label: "ClickFunnels alternative", url: "https://bumpgrade.com/compare/clickfunnels-alternative", kind: "route" },
      { label: "Comparison source data", url: "https://bumpgrade.com/compare/source-data", kind: "source-data" },
      { label: "PR #243", url: issue242PrUrl, kind: "pr" },
      { label: "Issue #242", url: "https://github.com/markitics/bumpgrade/issues/242", kind: "issue" },
    ],
    notes: [
      "Competitor facts remain volatile; agents should refresh external competitor pages before making time-sensitive claims.",
    ],
  },
  "journey-mark-reviews-nonblocking-attention": {
    status: "passed",
    lastTestedAt: journeyProofRefreshAt,
    environment: "Production source-data routes, merged PRs #241 and #244, and deployed admin/for-Mark screenshots.",
    method: "For-Mark source-data smoke, admin source-data smoke, user-journey proof summary smoke, and screenshot evidence for response channels.",
    summary:
      "Mark-facing attention is now explicit about read-only page behavior, GitHub issue response paths, project email, and durable work-log evidence.",
    ciLinks: [
      { label: "PR #241 CI run", url: issue240CiRunUrl, kind: "ci" },
      { label: "Main CI after PR #244", url: issue244MainCiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "For-Mark response channels", url: "https://bumpgrade.com/pr-screenshots/issue-73-for-mark-response-channels.png", kind: "screenshot" },
      { label: "For-Mark email auth", url: "https://bumpgrade.com/pr-screenshots/issue-61-for-mark-email-auth.png", kind: "screenshot" },
      { label: "User-journey proof matrix", url: "https://bumpgrade.com/pr-screenshots/issue-240-user-journeys-proof-matrix.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "For-Mark source data", url: "https://bumpgrade.com/admin/for-mark/source-data", kind: "source-data" },
      { label: "Admin source data", url: "https://bumpgrade.com/admin/source-data", kind: "source-data" },
      { label: "PR #241", url: issue240PrUrl, kind: "pr" },
      { label: "PR #244", url: issue244PrUrl, kind: "pr" },
      { label: "Issue #61", url: "https://github.com/markitics/bumpgrade/issues/61", kind: "issue" },
      { label: "Issue #73", url: "https://github.com/markitics/bumpgrade/issues/73", kind: "issue" },
    ],
    notes: [
      "/admin/for-mark is intentionally read-only; response choices point to GitHub, project email, or this Codex thread instead of pretending the page accepts direct replies.",
    ],
  },
  "journey-agent-reads-bumpgrade-manifest": {
    status: "passed",
    lastTestedAt: journeyProofRefreshAt,
    environment: "Production agent-doc routes, GitHub Actions CI, and deployed agent documentation screenshots.",
    method: "Agent docs route smoke, source-data contract inspection, sitemap discovery, and manifest stable-ID checks.",
    summary:
      "Agent-readable Bumpgrade contracts expose source-data routes, action boundaries, feature IDs, roadmap IDs, and write-safety rules without requiring private admin scraping.",
    ciLinks: [
      { label: "Main CI after PR #244", url: issue244MainCiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Agent docs index", url: "https://bumpgrade.com/pr-screenshots/issue-12-agent-docs-index-desktop.png", kind: "screenshot" },
      { label: "Agent MCP mobile", url: "https://bumpgrade.com/pr-screenshots/issue-12-agent-mcp-mobile.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Agent docs", url: "https://bumpgrade.com/agent-docs", kind: "route" },
      { label: "Agent docs source data", url: "https://bumpgrade.com/agent-docs/source-data", kind: "source-data" },
      { label: "Agent surface", url: "https://bumpgrade.com/agent-docs/bumpgrade-agent-surface", kind: "route" },
      { label: "Issue #12", url: "https://github.com/markitics/bumpgrade/issues/12", kind: "issue" },
    ],
    notes: [
      "The manifest is public-safe read discovery. Public, billing-impacting, admin, or creator-speech writes still need confirmed-write contracts.",
    ],
  },
  "journey-owner-opens-protected-admin": {
    status: "passed",
    lastTestedAt: journeyProofRefreshAt,
    environment: "Local authenticated Playwright smoke, GitHub Actions browser journeys, and deployed auth/admin screenshots.",
    method: "Signed-out admin gate checks, allowlisted owner sign-in journey, verified-email admin access checks, and auth-aware nav screenshot review.",
    summary:
      "Owner-protected admin routes have current proof for sign-in, verified owner access, source-data bypass boundaries, and the authenticated nav state.",
    ciLinks: [
      { label: "Main CI after PR #244", url: issue244MainCiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Signed-in admin", url: "https://bumpgrade.com/pr-screenshots/issue-9-admin-signed-in-desktop.png", kind: "screenshot" },
      { label: "Admin locked mobile", url: "https://bumpgrade.com/pr-screenshots/issue-9-admin-locked-mobile.png", kind: "screenshot" },
      { label: "Authenticated admin nav", url: "https://bumpgrade.com/pr-screenshots/issue-70-authenticated-admin-nav.png", kind: "screenshot" },
      { label: "Auth-aware For Mark nav", url: "https://bumpgrade.com/pr-screenshots/issue-97-auth-aware-nav-for-mark.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Login", url: "https://bumpgrade.com/login", kind: "route" },
      { label: "Admin roadmap source data", url: "https://bumpgrade.com/admin/roadmap/source-data", kind: "source-data" },
      { label: "PR #244", url: issue244PrUrl, kind: "pr" },
      { label: "Issue #9", url: "https://github.com/markitics/bumpgrade/issues/9", kind: "issue" },
      { label: "Issue #70", url: "https://github.com/markitics/bumpgrade/issues/70", kind: "issue" },
      { label: "Issue #97", url: "https://github.com/markitics/bumpgrade/issues/97", kind: "issue" },
    ],
    notes: [
      "Public-safe source-data routes remain readable for agents, but browser admin pages require a Better Auth owner session.",
    ],
  },
  "journey-prospect-evaluates-content-surfaces": {
    status: "passed",
    lastTestedAt: journeyProofRefreshAt,
    environment: "GitHub Actions CI, merged PR #243, deployed screenshots, and production route smoke.",
    method: "Users/resources/pricing route smoke, content source-data inspection, public visible-text scan, and screenshot review.",
    summary:
      "The content surfaces now present Bumpgrade by user outcomes and launch jobs, with pricing and resource routes avoiding internal build language.",
    ciLinks: [
      { label: "PR #243 CI run", url: issue242CiRunUrl, kind: "ci" },
      { label: "Main CI after PR #243", url: "https://github.com/markitics/bumpgrade/actions/runs/26175761582", kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Users issue #242 screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-242-users.png", kind: "screenshot" },
      { label: "Resources issue #242 screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-242-resources.png", kind: "screenshot" },
      { label: "Pricing issue #226 screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-226-pricing.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Users", url: "https://bumpgrade.com/users", kind: "route" },
      { label: "Resources", url: "https://bumpgrade.com/resources", kind: "route" },
      { label: "Pricing", url: "https://bumpgrade.com/pricing", kind: "route" },
      { label: "Content source data", url: "https://bumpgrade.com/content/source-data", kind: "source-data" },
      { label: "PR #243", url: issue242PrUrl, kind: "pr" },
      { label: "Issue #242", url: "https://github.com/markitics/bumpgrade/issues/242", kind: "issue" },
    ],
    notes: [
      "Pricing remains launch/pilot positioning until Mark confirms the live self-serve checkout rollout in issue #219.",
    ],
  },
  "journey-publisher-checks-mobile-admin": {
    status: "passed",
    lastTestedAt: journeyProofRefreshAt,
    environment: "Mobile source-data routes, first iOS/Android scaffold evidence, and deployed mobile-admin screenshots.",
    method: "Mobile admin source-data smoke, dashboard source-data smoke, iOS and Android fixture/live-hydration evidence, and agent-doc link checks.",
    summary:
      "Mobile admin has launch proof for read-only dashboard contracts, iOS scaffold hydration, Android scaffold hydration, and shared source-data semantics.",
    ciLinks: [
      { label: "Main CI after PR #244", url: issue244MainCiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Mobile admin contract desktop", url: "https://bumpgrade.com/pr-screenshots/issue-13-mobile-admin-contract-desktop.png", kind: "screenshot" },
      { label: "iOS simulator", url: "https://bumpgrade.com/pr-screenshots/issue-67-ios-mobile-admin-simulator.png", kind: "screenshot" },
      { label: "Android emulator", url: "https://bumpgrade.com/pr-screenshots/issue-68-android-mobile-admin-emulator.png", kind: "screenshot" },
      { label: "iOS live dashboard hydration", url: "https://bumpgrade.com/pr-screenshots/issue-157-ios-live-dashboard-hydration.png", kind: "screenshot" },
      { label: "Android live dashboard hydration", url: "https://bumpgrade.com/pr-screenshots/issue-157-android-live-dashboard-hydration.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Mobile admin source data", url: "https://bumpgrade.com/mobile-admin/source-data", kind: "source-data" },
      { label: "Mobile dashboard source data", url: "https://bumpgrade.com/mobile-admin/dashboard/source-data", kind: "source-data" },
      { label: "iOS source data", url: "https://bumpgrade.com/mobile-admin/ios/source-data", kind: "source-data" },
      { label: "Android source data", url: "https://bumpgrade.com/mobile-admin/android/source-data", kind: "source-data" },
      { label: "Issue #157", url: "https://github.com/markitics/bumpgrade/issues/157", kind: "issue" },
    ],
    notes: [
      "This is read-only launch proof for mobile admin scaffolds and dashboard hydration, not App Store or Play Store distribution.",
      "Mobile writes, push notifications, and private mobile auth remain future confirmed-write/mobile distribution work.",
    ],
  },
  "journey-publisher-plans-first-checkout": {
    status: "passed",
    lastTestedAt: journeyProofRefreshAt,
    environment: "Sandbox checkout contract evidence, GitHub Actions CI, merged PR #244, deployed screenshots, and production POST-interception smoke.",
    method: "Commerce source-data inspection, offer route smoke, checkout start smoke, checkout success proof, post-purchase decision proof, and safe production payload interception.",
    summary:
      "Publishers can inspect the first paid-offer stack, order bump, post-purchase options, and payment boundaries with current proof; live self-serve checkout remains explicitly gated.",
    ciLinks: [
      { label: "Main CI after PR #244", url: issue244MainCiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Commerce contract", url: "https://bumpgrade.com/pr-screenshots/issue-11-commerce-contract-desktop.png", kind: "screenshot" },
      { label: "Sandbox checkout contract", url: "https://bumpgrade.com/pr-screenshots/issue-34-sandbox-checkout-contract-desktop.png", kind: "screenshot" },
      { label: "Order bump checkout start", url: "https://bumpgrade.com/pr-screenshots/issue-99-checkout-order-bump-start.png", kind: "screenshot" },
      { label: "Post-purchase offer stack", url: "https://bumpgrade.com/pr-screenshots/issue-117-post-purchase-offer-stack-desktop.png", kind: "screenshot" },
      { label: "Checkout success", url: "https://bumpgrade.com/pr-screenshots/issue-133-checkout-success-desktop.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Commerce source data", url: "https://bumpgrade.com/commerce/source-data", kind: "source-data" },
      { label: "Offers source data", url: "https://bumpgrade.com/offers/source-data", kind: "source-data" },
      { label: "Indie launch offer", url: "https://bumpgrade.com/offers/indie-launch-stack", kind: "route" },
      { label: "PR #244", url: issue244PrUrl, kind: "pr" },
      { label: "Issue #219", url: "https://github.com/markitics/bumpgrade/issues/219", kind: "issue" },
    ],
    notes: [
      "Production checkout POST interception in PR #244 verified payload behavior without creating real checkout records.",
      "Live self-serve checkout is intentionally parked in issue #219 until Mark confirms product, amount, and rollout.",
    ],
  },
  "journey-prospect-explores-launch-marketing": {
    status: "passed",
    lastTestedAt: launchProofUpdatedAt,
    environment: "Local launch branch, GitHub Actions CI, merged PRs #218 and #233, deployed screenshots, and production route smoke.",
    method: "Public route smoke tests, sitemap checks, feature source-data checks, production visible-text smoke, and launch screenshots.",
    summary: "Homepage, feature index, feature detail, pricing, account setup, and source-data routes have route, CI, and screenshot proof for the invite wave.",
    ciLinks: [
      { label: "PR #218 CI run", url: issue217CiRunUrl, kind: "ci" },
      { label: "PR #233 CI run", url: issue226CiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Homepage issue #226 screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-226-homepage.png", kind: "screenshot" },
      { label: "Features issue #226 screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-226-features.png", kind: "screenshot" },
      { label: "Order bump issue #226 screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-226-order-bump.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Feature source data", url: "https://bumpgrade.com/features/source-data", kind: "source-data" },
      { label: "PR #218", url: issue217PrUrl, kind: "pr" },
      { label: "PR #233", url: issue226PrUrl, kind: "pr" },
      { label: "Issue #217", url: "https://github.com/markitics/bumpgrade/issues/217", kind: "issue" },
      { label: "Issue #226", url: "https://github.com/markitics/bumpgrade/issues/226", kind: "issue" },
      { label: "Issue #234", url: "https://github.com/markitics/bumpgrade/issues/234", kind: "issue" },
    ],
    notes: ["This proof is for launch marketing readiness; feature-specific billing and provider-send claims still require their own evidence."],
  },
  "journey-prospect-reviews-launch-pricing": {
    status: "passed",
    lastTestedAt: launchProofUpdatedAt,
    environment: "Local launch branch, GitHub Actions CI, merged launch PRs, and production route smoke.",
    method: "Pricing route smoke test, content review, commerce boundary inspection, account setup source-data inspection, and domain-policy proof.",
    summary: "Pricing explains invite access, paid pilots, Bumpgrade subdomains, existing-domain setup, no domain purchase, and live-checkout boundaries without exposing an unverified checkout button.",
    ciLinks: [
      { label: "PR #218 CI run", url: issue217CiRunUrl, kind: "ci" },
      { label: "PR #232 CI run", url: issue225CiRunUrl, kind: "ci" },
      { label: "PR #233 CI run", url: issue226CiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Pricing issue #226 screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-226-pricing.png", kind: "screenshot" },
      { label: "Account setup issue #226 screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-226-account-setup.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Commerce source data", url: "https://bumpgrade.com/commerce/source-data", kind: "source-data" },
      { label: "Account source data", url: "https://bumpgrade.com/account/source-data", kind: "source-data" },
      { label: "PR #232", url: issue225PrUrl, kind: "pr" },
      { label: "PR #233", url: issue226PrUrl, kind: "pr" },
      { label: "Issue #217", url: "https://github.com/markitics/bumpgrade/issues/217", kind: "issue" },
      { label: "Issue #226", url: "https://github.com/markitics/bumpgrade/issues/226", kind: "issue" },
      { label: "Issue #234", url: "https://github.com/markitics/bumpgrade/issues/234", kind: "issue" },
    ],
    notes: [
      "Bumpgrade pilot payment can be handled through a confirmed payment path, but customer-facing publisher checkout remains offer-specific.",
      "Live self-serve customer checkout remains gated until live Stripe smoke proof is available for the specific offer.",
    ],
  },
  "journey-publisher-reserves-bumpgrade-subdomain": {
    status: "passed",
    lastTestedAt: launchProofUpdatedAt,
    environment: "Local launch branch, GitHub Actions CI, merged PR #227, and production source-data smoke.",
    method: "Full Playwright browser suite, account setup route smoke test, source-data inspection, and authenticated API reservation checks.",
    summary: "Paid publisher tenant setup and Bumpgrade subdomain reservation passed local and GitHub validation.",
    ciLinks: [
      { label: "PR #227 CI run", url: issue222CiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Account setup screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-222-account-setup.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Account source data", url: "https://bumpgrade.com/account/source-data", kind: "source-data" },
      { label: "PR #227", url: issue222PrUrl, kind: "pr" },
      { label: "Issue #222", url: "https://github.com/markitics/bumpgrade/issues/222", kind: "issue" },
    ],
    notes: [
      "Custom-domain DNS verification is tracked separately in issue #223.",
      "Domain purchase is tracked separately in issue #225.",
    ],
  },
  "journey-publisher-connects-custom-domain": {
    status: "passed",
    lastTestedAt: launchProofUpdatedAt,
    environment: "Local launch branch, GitHub Actions CI, merged PRs #228, #229, and #232, and production source-data smoke.",
    method: "Account setup route smoke test, source-data inspection, and authenticated custom-domain API checks.",
    summary: "Existing custom-domain onboarding shows deterministic CNAME instructions, redacted verification state, and the no-domain-purchase launch policy.",
    ciLinks: [
      { label: "PR #229 CI run", url: issue223CiRunUrl, kind: "ci" },
      { label: "PR #232 CI run", url: issue225CiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Account setup screenshot", url: "https://bumpgrade.com/pr-screenshots/issue-223-custom-domain-setup.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Account source data", url: "https://bumpgrade.com/account/source-data", kind: "source-data" },
      { label: "PR #228", url: issue223PrUrl, kind: "pr" },
      { label: "PR #229", url: issue223LivePrUrl, kind: "pr" },
      { label: "PR #232", url: issue225PrUrl, kind: "pr" },
      { label: "Issue #223", url: "https://github.com/markitics/bumpgrade/issues/223", kind: "issue" },
    ],
    notes: [
      "Custom-domain login semantics are documented in issue #224.",
      "Issue #225 documents the launch policy: Bumpgrade connects domains users already own but does not sell or register domains today.",
    ],
  },
  "journey-customer-uses-one-login-across-bumpgrade-subdomains": {
    status: "passed",
    lastTestedAt: launchProofUpdatedAt,
    environment: "Local contract tests, GitHub Actions CI, and production source-data smoke after Worker version cd663146-20c5-4899-a43f-5faec8c720a5.",
    method: "Better Auth configuration assertions, account source-data inspection, GitHub Actions browser journeys, and production route smoke tests.",
    summary:
      "The production auth contract uses the bumpgrade.com cookie domain and *.bumpgrade.com trusted origin so Bumpgrade-hosted publisher subdomains share identity while tenant access stays scoped.",
    ciLinks: [
      { label: "PR #230 CI run", url: issue224CiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [],
    validationLinks: [
      { label: "Account source data", url: "https://bumpgrade.com/account/source-data", kind: "source-data" },
      { label: "PR #230", url: issue224PrUrl, kind: "pr" },
      { label: "Issue #224", url: "https://github.com/markitics/bumpgrade/issues/224", kind: "issue" },
    ],
    notes: [
      "Localhost cannot prove production browser cookie sharing for bumpgrade.com, so tests assert the production Better Auth boundary and production smoke verifies source-data after deploy.",
      "Custom domains use a central Bumpgrade sign-in handoff instead of raw cross-domain cookie sharing.",
      "A local account setup screenshot was not attached because the in-app browser rejected the localhost capture target.",
    ],
  },
};

const journeyProofByFeatureId: Record<string, AdminUserJourneyProof> = {
  "feature-funnel-builder": {
    status: "passed",
    lastTestedAt: "2026-05-18T18:10:00.000Z",
    environment: "Production screenshot and source-data evidence from funnel feature issues.",
    method: "Route smoke, owner-gated admin preview, and screenshot evidence.",
    summary: "Funnel previews, template library, draft admin, publishing, checkout linking, and webinar/resource shapes have screenshot evidence.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [
      { label: "Funnel template library", url: "https://bumpgrade.com/pr-screenshots/issue-159-funnel-template-library.png", kind: "screenshot" },
      { label: "Template draft admin", url: "https://bumpgrade.com/pr-screenshots/issue-161-template-draft-admin.png", kind: "screenshot" },
      { label: "Webinar and resource funnels", url: "https://bumpgrade.com/pr-screenshots/issue-213-webinar-resource-funnels.png", kind: "screenshot" },
    ],
    validationLinks: [{ label: "Funnels source data", url: "https://bumpgrade.com/funnels/source-data", kind: "source-data" }],
    notes: ["Live billing, deletion, unpublishing, and direct public agent edits remain outside this proof. Issue #215 adds owner-confirmed private draft duplication without copying checkout-link metadata."],
  },
  "feature-checkout-offers": {
    status: "passed",
    lastTestedAt: "2026-05-18T16:30:00.000Z",
    environment: "Production screenshot and sandbox checkout contract evidence.",
    method: "Sandbox checkout start, checkout success, order bump, and post-purchase source-data validation.",
    summary: "Sandbox checkout, order bump, referral attribution, and post-purchase decision evidence are proven; live mode is not enabled.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [
      { label: "Order bump checkout start", url: "https://bumpgrade.com/pr-screenshots/issue-99-checkout-order-bump-start.png", kind: "screenshot" },
      { label: "Checkout success", url: "https://bumpgrade.com/pr-screenshots/issue-133-checkout-success-desktop.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Offers source data", url: "https://bumpgrade.com/offers/source-data", kind: "source-data" },
      { label: "Commerce source data", url: "https://bumpgrade.com/commerce/source-data", kind: "source-data" },
    ],
    notes: ["This proof intentionally separates sandbox checkout from live product payment readiness."],
  },
  "feature-products-access": {
    status: "passed",
    lastTestedAt: "2026-05-18T18:00:00.000Z",
    environment: "Production screenshot and product/access source-data evidence.",
    method: "Product preview, entitlement lookup, download token, protected content, and owner inspection smoke evidence.",
    summary: "Product access, entitlement lookup, protected fixture delivery, and membership state have route and screenshot proof.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [
      { label: "R2 delivery", url: "https://bumpgrade.com/pr-screenshots/issue-146-r2-delivery-desktop.png", kind: "screenshot" },
      { label: "Customer entitlements", url: "https://bumpgrade.com/pr-screenshots/issue-141-customer-entitlements-desktop.png", kind: "screenshot" },
    ],
    validationLinks: [{ label: "Products source data", url: "https://bumpgrade.com/products/source-data", kind: "source-data" }],
    notes: ["Customer delivery of arbitrary private uploads still needs a later confirmed rollout."],
  },
  "feature-email-automation-crm": {
    status: "passed",
    lastTestedAt: "2026-05-20T08:17:44.000Z",
    environment: "Production screenshot and audience automation source-data evidence.",
    method: "Opt-in, suppression, CRM note, broadcast readiness, queue, provider, and dispatch readiness route checks.",
    summary: "Audience capture and campaign readiness surfaces have broad screenshot proof; real provider sends remain gated.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [
      { label: "Audience opt-in", url: "https://bumpgrade.com/pr-screenshots/issue-103-audience-opt-in.png", kind: "screenshot" },
      { label: "Broadcast readiness", url: "https://bumpgrade.com/pr-screenshots/issue-171-broadcast-readiness.png", kind: "screenshot" },
      { label: "Queue consumer readiness", url: "https://bumpgrade.com/pr-screenshots/issue-211-audience-queue-consumer-readiness.png", kind: "screenshot" },
    ],
    validationLinks: [{ label: "Audience source data", url: "https://bumpgrade.com/audience/source-data", kind: "source-data" }],
    notes: ["Provider sends and queue consumption are not claimed as live customer email delivery."],
  },
  "feature-analytics-testing": {
    status: "passed",
    lastTestedAt: "2026-05-21T06:10:00.000Z",
    environment: "Production screenshot and analytics source-data evidence.",
    method: "Analytics event, page-view beacon, source attribution, variant, time-window, and owner decision-evidence route checks.",
    summary:
      "Analytics preview, aggregate conversion reporting, source attribution, time windows, and owner-confirmed experiment decision evidence have proof surfaces.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [
      { label: "Analytics time windows", url: "https://bumpgrade.com/pr-screenshots/issue-129-analytics-time-windows-desktop.png", kind: "screenshot" },
      { label: "Source attribution", url: "https://bumpgrade.com/pr-screenshots/issue-127-dashboard-source-attribution-desktop.png", kind: "screenshot" },
      { label: "Experiment decisions", url: "https://bumpgrade.com/pr-screenshots/issue-261-admin-analytics-experiment-decisions.png", kind: "screenshot" },
    ],
    validationLinks: [{ label: "Analytics source data", url: "https://bumpgrade.com/analytics/source-data", kind: "source-data" }],
    notes: ["Reports and decision evidence are aggregate and public-safe; raw visitor data is not exposed."],
  },
  "feature-affiliates-referrals": {
    status: "passed",
    lastTestedAt: "2026-05-18T18:08:00.000Z",
    environment: "Production screenshot and affiliate/referral source-data evidence.",
    method: "Referral click, checkout attribution, commission ledger, review action, partner report, and payout-prep route checks.",
    summary: "Referral and affiliate evidence surfaces are proven; payout mutation remains owner-reviewed and future-gated.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [
      { label: "Affiliate payout prep", url: "https://bumpgrade.com/pr-screenshots/issue-195-affiliate-payout-prep.png", kind: "screenshot" },
      { label: "Commission review", url: "https://bumpgrade.com/pr-screenshots/issue-115-commission-review-affiliates-desktop.png", kind: "screenshot" },
    ],
    validationLinks: [{ label: "Affiliates source data", url: "https://bumpgrade.com/affiliates/source-data", kind: "source-data" }],
    notes: ["Payable commissions and live payouts remain outside the current proof."],
  },
  "feature-public-roadmap": {
    status: "passed",
    lastTestedAt: "2026-05-18T09:45:51.000Z",
    environment: "Production route smoke and screenshot evidence from roadmap/admin issue work.",
    method: "Roadmap route and source-data smoke checks.",
    summary: "Roadmap source data and public roadmap have route proof; this proof now links into journey records.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [{ label: "Roadmap desktop", url: "https://bumpgrade.com/pr-screenshots/issue-7-roadmap-desktop.png", kind: "screenshot" }],
    validationLinks: [{ label: "Roadmap source data", url: "https://bumpgrade.com/roadmap/source-data", kind: "source-data" }],
    notes: ["Public roadmap is for status; product marketing now belongs on /features and /."],
  },
};

function createJourneyProof(journeyId: string, featureId: string): AdminUserJourneyProof {
  return journeyProofById[journeyId] ?? journeyProofByFeatureId[featureId] ?? defaultJourneyProof;
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
    id: "work-log-2026-05-20-launch-marketing-readiness",
    title: "Prepared launch marketing and journey proof surfaces",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-launch-readiness",
    promptFromMark:
      "Mark asked to make the public homepage, features, feature detail pages, pricing, and user-journey proof feel ready before inviting people to try Bumpgrade.",
    githubIssues: [{ number: 217, url: "https://github.com/markitics/bumpgrade/issues/217" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/",
      "https://bumpgrade.com/features",
      "https://bumpgrade.com/features/email-campaigns",
      "https://bumpgrade.com/features/order-bump",
      "https://bumpgrade.com/pricing",
      "https://bumpgrade.com/features/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys", "https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: [".github/workflows/ci.yml", "docs/pr-screenshots/issue-217-homepage.png"],
    validation: [
      "npm run lint",
      "npm run typecheck",
      "npm run test:runtime-secrets",
      "npm run build",
      "npm run cf:build",
      "npm run test:browser",
    ],
    flagsAttention:
      "Live self-serve checkout is still not claimed until the production Stripe path has a linked live smoke test. The Documents checkout stayed blocked by macOS TCC in this running Codex process, so this branch was built from /tmp/bumpgrade-launch.",
    firstPromptAt: "2026-05-20T08:18:39.622Z",
    completedAt: "2026-05-20T09:41:40.000Z",
    relevantUrls: [
      "https://bumpgrade.com/pr-screenshots/issue-217-homepage.png",
      "https://bumpgrade.com/pr-screenshots/issue-217-features.png",
      "https://bumpgrade.com/pr-screenshots/issue-217-pricing.png",
      "https://bumpgrade.com/pr-screenshots/issue-217-admin-user-journeys.png",
    ],
    prCommentUrl: null,
  },
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
    id: "journey-prospect-explores-launch-marketing",
    title: "Prospect explores Bumpgrade launch features",
    featureId: "feature-public-feature-catalog",
    featureStatus: "live",
    issueNumbers: [6, 14, 15, 16, 17, 18, 19, 217, 226, 234],
    primaryUser: "Publisher invited to try Bumpgrade",
    userGoal: "Understand what Bumpgrade can do for a launch without needing to decode project management notes.",
    sourceEvidence: [
      "https://bumpgrade.com/",
      "https://bumpgrade.com/features",
      "https://bumpgrade.com/features/email-campaigns",
      "https://bumpgrade.com/features/order-bump",
      "https://bumpgrade.com/features/source-data",
      "https://github.com/markitics/bumpgrade/issues/217",
    ],
    happyPath: [
      "Open the homepage and understand Bumpgrade as a publisher launch system.",
      "Open /features to see customer-facing feature groups organized by launch job.",
      "Open a dedicated feature page such as /features/email-campaigns or /features/order-bump.",
      "Follow feature examples or related launch previews when the feature fits the offer.",
      "Open /pricing to understand invite access and payment options.",
    ],
    edgeCases: [
      "Live billing must not be promoted until live Stripe smoke evidence is linked.",
      "Feature pages must distinguish launch-preview availability from planned parity work.",
      "Admin and implementation details should not be the public marketing story.",
    ],
    agentAccess:
      "Agents can read /features/source-data and feature detail pages; public copy changes still need issue evidence, route proof, or source-data support.",
    validation: [
      "Issue #217 adds launch marketing pages, dedicated feature routes, sitemap entries, screenshots, and CI wiring.",
      "Issue #226 removes internal status-board language from public launch copy and refreshes pricing/domain readiness proof.",
      "Issue #234 refreshes launch user-journey proof with the latest PR #233 CI and issue #226 screenshot links.",
      "Playwright smoke tests cover homepage, /features, dedicated feature pages, /pricing, and source-data routes.",
    ],
    proof: createJourneyProof("journey-prospect-explores-launch-marketing", "feature-public-feature-catalog"),
    sortOrder: 8,
    updatedAt: null,
  },
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
    proof: createJourneyProof("journey-read-public-roadmap-source-data", "feature-public-roadmap"),
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
    proof: createJourneyProof("journey-agent-reads-bumpgrade-manifest", "feature-agent-ready-contracts"),
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
    proof: createJourneyProof("journey-owner-opens-protected-admin", "feature-better-auth"),
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
    proof: createJourneyProof("journey-prospect-evaluates-content-surfaces", "feature-resources-use-cases-pricing"),
    sortOrder: 44,
    updatedAt: null,
  },
  {
    id: "journey-prospect-reviews-launch-pricing",
    title: "Prospect reviews launch pricing and payment options",
    featureId: "feature-resources-use-cases-pricing",
    featureStatus: "live",
    issueNumbers: [20, 46, 217, 222, 223, 225, 226, 234],
    primaryUser: "Publisher deciding whether to request Bumpgrade access",
    userGoal: "Understand how early access, paid pilots, and live payment handling work before inviting buyers.",
    sourceEvidence: [
      "https://bumpgrade.com/pricing",
      "https://bumpgrade.com/commerce/source-data",
      "https://github.com/markitics/bumpgrade/issues/46",
      "https://github.com/markitics/bumpgrade/issues/217",
    ],
    happyPath: [
      "Open /pricing.",
      "Read launch preview, publisher pilot, and operator stack options.",
      "Review payment option language for pilot payments, Stripe invoices, subdomains, custom domains, and manual approval.",
      "Use the access CTA when ready to discuss the first live offer.",
    ],
    edgeCases: [
      "No self-serve live checkout button should appear until live checkout smoke proof is linked.",
      "Pricing should not invent fixed plan amounts before the launch wave confirms packaging.",
      "Sandbox checkout proof is not the same as live-mode product payment proof.",
      "Bumpgrade connects domains customers already own; it does not sell, register, renew, transfer, or price domains today.",
    ],
    agentAccess:
      "Agents can read /pricing and /content/source-data, but billing-impacting recommendations must cite /commerce/source-data and current Stripe proof.",
    validation: [
      "Issue #217 rewrites pricing as launch-facing copy.",
      "Issue #225 clarifies the domain purchase policy.",
      "Issue #226 refreshes launch signup and pricing copy for paid domain readiness.",
      "Issue #234 refreshes pricing user-journey proof with the latest PR #233 CI and issue #226 screenshot links.",
      "The pricing page links to human contact paths instead of an unverified live checkout button.",
    ],
    proof: createJourneyProof("journey-prospect-reviews-launch-pricing", "feature-resources-use-cases-pricing"),
    sortOrder: 43,
    updatedAt: null,
  },
  {
    id: "journey-publisher-reserves-bumpgrade-subdomain",
    title: "Publisher reserves a paid Bumpgrade subdomain",
    featureId: "feature-better-auth",
    featureStatus: "live",
    issueNumbers: [9, 221, 222],
    primaryUser: "Publisher who has activated a paid plan or launch pilot",
    userGoal:
      "Sign in, confirm email, and reserve a unique Bumpgrade subdomain that can become the default public hostname for the publisher workspace.",
    sourceEvidence: [
      "https://bumpgrade.com/account/setup",
      "https://bumpgrade.com/account/source-data",
      "https://github.com/markitics/bumpgrade/issues/221",
      "https://github.com/markitics/bumpgrade/issues/222",
    ],
    happyPath: [
      "Create or sign into a Bumpgrade publisher account.",
      "Confirm the account email.",
      "Activate a paid plan or launch-pilot entitlement.",
      "Open /account/setup.",
      "Enter the desired subdomain, such as studio, and submit the reservation.",
      "See the reserved hostname, such as studio.bumpgrade.com, recorded for the publisher tenant.",
    ],
    edgeCases: [
      "Signed-out users must sign in first.",
      "Unverified users must confirm email first.",
      "Free or unpaid accounts cannot reserve a Bumpgrade subdomain.",
      "Reserved platform names such as admin, api, www, login, pricing, and features are blocked.",
      "A subdomain already reserved by another tenant returns a conflict.",
      "Custom domains are tracked separately; buying, registering, renewing, or transferring domains through Bumpgrade should not be claimed as live.",
    ],
    agentAccess:
      "Agents can read /account/source-data and inspect the tenant/subdomain contract. Public or delegated agent writes still require authenticated user context, idempotency, audit correlation, redaction, and paid-plan checks.",
    validation: [
      "Playwright covers /account/setup rendering, /account/source-data, paid owner reservation, idempotent replay, reserved-name rejection, and unpaid account rejection.",
      "Issue #222 records the D1 migration, API, account setup route, and cross-subdomain auth configuration.",
    ],
    proof: createJourneyProof("journey-publisher-reserves-bumpgrade-subdomain", "feature-better-auth"),
    sortOrder: 44,
    updatedAt: null,
  },
  {
    id: "journey-publisher-connects-custom-domain",
    title: "Publisher connects an existing custom domain",
    featureId: "feature-better-auth",
    featureStatus: "live",
    issueNumbers: [9, 221, 222, 223],
    primaryUser: "Paid publisher who already controls a domain",
    userGoal:
      "Add an existing domain to a Bumpgrade tenant, copy the required DNS record, and see whether DNS has been verified before activation.",
    sourceEvidence: [
      "https://bumpgrade.com/account/setup",
      "https://bumpgrade.com/account/source-data",
      "https://github.com/markitics/bumpgrade/issues/221",
      "https://github.com/markitics/bumpgrade/issues/223",
    ],
    happyPath: [
      "Create or sign into a Bumpgrade publisher account.",
      "Confirm the account email.",
      "Activate a paid plan or launch-pilot entitlement.",
      "Reserve the default Bumpgrade subdomain first.",
      "Open /account/setup and enter the existing domain.",
      "Copy the CNAME record name and target shown by Bumpgrade.",
      "Click re-check DNS after the record is created at the domain host.",
      "See pending DNS or verified DNS state without exposing private provider credentials.",
    ],
    edgeCases: [
      "Signed-out users must sign in first.",
      "Unverified users must confirm email first.",
      "Free or unpaid accounts cannot add a custom domain.",
      "A default Bumpgrade hostname is required before custom-domain onboarding.",
      "Bumpgrade-owned domains such as bumpgrade.com are rejected here.",
      "Domains already claimed by another tenant return a conflict.",
      "DNS verification can be pending while records propagate.",
      "SSL and final custom-hostname activation remain visible as state, not hidden implementation detail.",
      "Domain purchase, transfer, renewal, registrar pricing, and TLD availability are not offered by Bumpgrade today.",
    ],
    agentAccess:
      "Agents can read /account/source-data and inspect the custom-domain DNS contract. Custom-domain writes require authenticated user context, paid-plan checks, idempotency, audit correlation, redaction, and explicit DNS verification state.",
    validation: [
      "Playwright covers /account/setup rendering, /account/source-data, paid custom-domain onboarding, idempotent replay, DNS verification transition, invalid Bumpgrade-owned domain rejection, and unpaid account rejection.",
      "Issue #223 records the D1 migration, API, account setup UI, DNS instruction, and redacted source-data contract.",
    ],
    proof: createJourneyProof("journey-publisher-connects-custom-domain", "feature-better-auth"),
    sortOrder: 45,
    updatedAt: null,
  },
  {
    id: "journey-customer-uses-one-login-across-bumpgrade-subdomains",
    title: "Customer uses one login across Bumpgrade-hosted publisher sites",
    featureId: "feature-better-auth",
    featureStatus: "live",
    issueNumbers: [9, 221, 222, 223, 224],
    primaryUser: "Customer buying from multiple Bumpgrade-hosted publishers",
    userGoal:
      "Use one Bumpgrade identity session across publisher subdomains while each publisher site keeps its own access and entitlement checks.",
    sourceEvidence: [
      "https://bumpgrade.com/account/source-data",
      "https://github.com/markitics/bumpgrade/issues/221",
      "https://github.com/markitics/bumpgrade/issues/224",
    ],
    happyPath: [
      "Customer signs into the central Bumpgrade account session.",
      "Customer opens a paid publisher site on a.bumpgrade.com.",
      "Customer later opens another paid publisher site on b.bumpgrade.com without creating a second identity login.",
      "Each site resolves its hostname to the correct publisher tenant before showing protected products, memberships, or customer content.",
      "If the publisher uses a custom domain, Bumpgrade uses the central sign-in handoff and returns the customer to the custom domain for tenant-scoped access checks.",
    ],
    edgeCases: [
      "A shared identity session must not grant access to products or memberships sold by a different publisher.",
      "A shared identity session must not grant owner/admin access.",
      "Unrelated customer-owned domains cannot receive the bumpgrade.com browser cookie directly.",
      "Localhost smoke tests cannot prove bumpgrade.com browser cookie sharing; production smoke should verify the deployed source-data contract.",
    ],
    agentAccess:
      "Agents can read /account/source-data for the session boundary. They must not infer cross-tenant customer access from a shared identity session.",
    validation: [
      "Playwright asserts the production Better Auth cookie-domain and trusted-origin contract.",
      "Playwright asserts /account/source-data exposes the Bumpgrade-subdomain and custom-domain auth boundary.",
      "Issue #224 records the explicit launch behavior and custom-domain limitation.",
    ],
    proof: createJourneyProof("journey-customer-uses-one-login-across-bumpgrade-subdomains", "feature-better-auth"),
    sortOrder: 46,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-seeded-funnel",
    title: "Publisher previews a seeded draft funnel",
    featureId: "feature-funnel-builder",
    featureStatus: "launch-preview",
    issueNumbers: [14, 79, 159, 161, 163, 165, 213, 215],
    primaryUser: "Publisher or agent planning the first funnel",
    userGoal:
      "Inspect an ordered opt-in, sales, and thank-you funnel plus reusable templates, webinar/resource page shapes, block records, owner-session draft duplication capability, owner-session checkout-link capability, and public linked-checkout start capability before visual editing or direct agent template creation exists.",
    sourceEvidence: [
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/funnels/indie-launch-sandbox",
      "https://github.com/markitics/bumpgrade/issues/14",
      "https://github.com/markitics/bumpgrade/issues/79",
      "https://github.com/markitics/bumpgrade/issues/159",
      "https://github.com/markitics/bumpgrade/issues/161",
      "https://github.com/markitics/bumpgrade/issues/163",
      "https://github.com/markitics/bumpgrade/issues/165",
      "https://github.com/markitics/bumpgrade/issues/213",
      "https://github.com/markitics/bumpgrade/issues/215",
    ],
    happyPath: [
      "Fetch /funnels/source-data.",
      "Find the seeded draft funnel, revision ID, ordered step IDs, block IDs, preview route, private draft duplication capability, public checkout-start capability, and write boundary.",
      "Inspect reusable funnel templates and block-template records, including webinar/resource templates, owner-session draftCreation, and block write boundaries.",
      "Open /funnels/indie-launch-sandbox to inspect semantic preview sections.",
      "Use the write boundary to avoid claiming live billing, unpublish/delete, direct agent checkout-link, or direct agent-write capability.",
    ],
    edgeCases: [
      "The seeded funnel is read-only and not an authenticated builder UI.",
      "Owner-session template-to-draft creation, private draft duplication, and checkout-offer linking are available from /admin/funnels, and published linked checkout blocks can render the existing sandbox checkout start surface. Duplicates stay private and strip checkout-link metadata. Webinar/resource templates do not schedule webinars, host replays, deliver private files, or grant entitlements. Deletion, unpublishing, live billing, and direct agent edits require future confirmed-write APIs.",
      "Generated copy remains draft until a publisher confirms it.",
    ],
    agentAccess:
      "Agents can read /funnels/source-data, reusable template and block-template records, webinar/resource page-shape records, draft duplication capability metadata, checkout-link capability metadata, public funnel checkout-start capability metadata, the seeded preview route, and published D1 funnel routes. Owner-session template-to-draft creation, private draft duplication, and checkout-offer linking require confirmation and idempotency; direct agent writes require actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.",
    validation: [
      "Playwright covers /funnels/source-data, /funnels/indie-launch-sandbox template and block library rendering, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #79 records the first funnel source-data contract and preview scaffold.",
      "Issue #159 records the first reusable template and block-template library contract.",
      "Issue #161 records owner-confirmed template-to-draft creation.",
      "Issue #163 records owner-confirmed checkout-offer linking on private draft steps.",
      "Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.",
      "Issue #213 records webinar/resource template and block contracts.",
      "Issue #215 records owner-confirmed private draft duplication.",
    ],
    sortOrder: 46,
    updatedAt: null,
  },
  {
    id: "journey-owner-seeds-editable-draft-funnel",
    title: "Owner seeds, edits, previews, and publishes a draft funnel",
    featureId: "feature-funnel-builder",
    featureStatus: "launch-preview",
    issueNumbers: [14, 79, 91, 93, 95, 135, 159, 161, 163, 165, 213, 215],
    primaryUser: "Publisher or owner preparing the first launch funnel",
    userGoal: "Create, seed, template-start, or duplicate an owner-gated draft funnel, including webinar and resource page shapes, tune the ordered steps, attach the seeded sandbox checkout offer to a checkout block, preview it privately, then publish it to a public route that can start the linked sandbox checkout after exact confirmation.",
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
      "https://github.com/markitics/bumpgrade/issues/213",
      "https://github.com/markitics/bumpgrade/issues/215",
    ],
    happyPath: [
      "Sign in with an allowlisted owner account.",
      "Open /admin/funnels.",
      "Seed the indie launch working draft, create a generic draft, or create a private draft from a reusable template after typing the exact template confirmation text.",
      "Create webinar registration/replay or resource-library private drafts from the reusable templates when those page shapes fit the offer.",
      "Duplicate an existing private draft after typing the exact duplicate confirmation text and using the current draft revision.",
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
      "Draft duplication writes only a new private D1 draft, copies ordered steps and blocks, strips checkout-link metadata, and does not publish.",
      "Webinar/resource templates are page shapes only; they do not create webinar provider state, reminder sequences, replay hosting, private files, signed URLs, or entitlements.",
      "Checkout-offer linking writes public-safe metadata into private draft step blocks and does not start a checkout session or enable live billing by itself.",
      "The public linked checkout start remains sandbox-only, exact-confirmed, idempotent, and constrained to the seeded offer stack.",
      "Publishing requires exact confirmation and a fresh revision ID.",
      "Checkout-link deletion, unpublishing, drag-and-drop layout editing, live billing, direct agent duplication, and direct agent writes still require future confirmed-write APIs.",
      "/funnels/source-data lists published D1 funnels but does not expose raw owner session or unpublished private draft data.",
    ],
    agentAccess:
      "Agents can read public /funnels/source-data, seeded funnel routes, reusable templates including webinar/resource page shapes, draft duplication capability metadata, checkout-link capability metadata, public funnel checkout-start capability metadata, and published D1 funnel routes. Owner-session UI may create from templates, duplicate, edit, link checkout offers, preview, and publish private draft steps with actor identity, confirmation, idempotency, audit correlation, stale-state checks, and redaction; direct agent edit/duplicate tools are still planned.",
    validation: [
      "Playwright covers the owner-gated /admin/funnels surface, webinar/resource template records, template-to-draft create path, draft duplicate path, checkout-link create path, idempotent replay, stale checkout-link rejection, seed/update/reorder/publish POST paths, stale publish rejection, private draft preview, public D1 funnel route rendering, public linked-checkout start rendering, /funnels/source-data capability metadata, and agent manifest discovery.",
      "Issue #91 records the first owner-gated draft funnel builder scaffold.",
      "Issue #93 records the first step edit and reorder controls.",
      "Issue #95 records the first owner-gated private draft preview route.",
      "Issue #135 records the first exact-confirmed D1 draft publishing path.",
      "Issue #159 records reusable template and block-template source data.",
      "Issue #161 records owner-confirmed template-to-draft creation.",
      "Issue #163 records owner-confirmed checkout-offer linking on private draft steps.",
      "Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.",
      "Issue #213 records webinar/resource funnel template and D1 step-kind storage readiness.",
      "Issue #215 records owner-confirmed private draft duplication.",
    ],
    sortOrder: 47,
    updatedAt: null,
  },
  {
    id: "journey-publisher-checks-mobile-admin",
    title: "Publisher checks mobile admin status",
    featureId: "feature-mobile-admin",
    featureStatus: "launch-preview",
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
    featureStatus: "launch-preview",
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
    featureStatus: "launch-preview",
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
    featureStatus: "launch-preview",
    issueNumbers: [16, 83, 101, 139, 141, 143, 146, 147, 151, 179, 181, 185, 187, 251],
    primaryUser: "Publisher or agent planning fulfillment",
    userGoal:
      "Inspect products, assets, access rules, entitlement templates, sandbox entitlement grant mappings, subscription-backed membership access, owner entitlement rows, owner-confirmed revocation intents, and protected fixture delivery checks before real private content storage is enabled.",
    sourceEvidence: [
      "https://bumpgrade.com/products/source-data",
      "https://bumpgrade.com/products/indie-launch-library",
      "https://bumpgrade.com/products/entitlements",
      "https://bumpgrade.com/api/products/entitlements",
      "https://bumpgrade.com/api/products/download-tokens",
      "https://bumpgrade.com/api/products/protected-content",
      "https://bumpgrade.com/api/admin/products/assets",
      "https://bumpgrade.com/api/admin/products/revocation-intents",
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
      "https://github.com/markitics/bumpgrade/issues/179",
      "https://github.com/markitics/bumpgrade/issues/181",
      "https://github.com/markitics/bumpgrade/issues/185",
      "https://github.com/markitics/bumpgrade/issues/187",
      "https://github.com/markitics/bumpgrade/issues/251",
    ],
    happyPath: [
      "Fetch /products/source-data.",
      "Find seeded product types, asset IDs, access rules, entitlement templates, sandbox grant mappings, subscription membership access contract, aggregate entitlement inspection counts, customer lookup contract, private R2-backed delivery contract, owner-upload intent contract, owner-confirmed revocation intent contract, protected content readiness, protected fixture delivery contract, revision ID, and write boundary.",
      "Open /products/indie-launch-library to inspect the public preview.",
      "Open /admin/products as a verified owner to inspect private buyer entitlement rows, checkout state, product/price context, and queued fulfillment evidence.",
      "Open /products/entitlements with a checkout intent reference to inspect customer-safe entitlement and fulfillment state.",
      "Create and consume a short-lived download token for an active file entitlement after current entitlement and trusted checkout state are revalidated, streaming the seeded private R2-backed fixture through Bumpgrade without exposing private R2 keys or signed object URLs.",
      "As a verified owner, create a small private product asset upload record only after exact confirmation, idempotency, and catalog revision checks.",
      "Record a non-destructive revocation intent in /admin/products without removing access.",
      "Use /api/products/protected-content with a known checkout intent, active matching entitlement, and protected content id to read the seeded protected fixture.",
      "Use trusted Stripe Billing subscription state to activate or pause checkout-linked membership access without exposing raw subscription/customer identifiers.",
      "Use /offers/source-data and /commerce/source-data to confirm checkout and webhook dependencies before assuming fulfillment exists.",
    ],
    edgeCases: [
      "The seeded product/access catalog is not a product admin.",
      "Public /products/source-data exposes aggregate entitlement, owner-upload, and revocation-intent counts plus redaction flags, not buyer emails, owner emails, target entitlement IDs, raw Stripe IDs, hashes, private reason notes, metadata JSON, R2 keys, signed URLs, or upload bodies.",
      "A token is rejected without being consumed when current entitlement or trusted checkout state is no longer eligible.",
      "Owner-uploaded private assets are stored as records but are not yet wired to customer delivery.",
      "Owner-confirmed revocation intent records are non-destructive and stale-state checked, but they do not remove access, refund, change billing, or notify customers.",
      "Protected fixture delivery rejects mismatched entitlements and stale checkout state.",
      "Canceled, unpaid, incomplete_expired, or deleted subscriptions pause membership access without exposing raw subscription/customer IDs, Customer Portal URLs, member posts, private files, or progress rows.",
      "Signed object URLs, real protected media, destructive revocation, customer delivery of arbitrary uploads, Customer Portal actions, and live fulfillment automation require future APIs.",
    ],
    agentAccess:
      "Agents can read /products/source-data, aggregate entitlement inspection counts, the preview route, the customer-safe checkout intent lookup contract, the short-lived private R2-backed download-token boundary with redemption revalidation, the owner-authenticated private asset upload intent boundary, owner-confirmed non-destructive revocation intent evidence, protected content readiness, protected fixture delivery checks, and subscription-backed membership access state. Owner sessions can inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products, create small private asset upload records, and record non-destructive revocation intents only through exact-confirmed, idempotent, stale-state-checked writes. Trusted paid sandbox webhooks can grant seeded entitlement rows and trusted Stripe Billing webhooks can sync membership access; direct customer delivery of arbitrary uploads, destructive revocation, real protected media delivery, Customer Portal actions, and subscription mutations require later APIs.",
    validation: [
      "Playwright covers /products/source-data, aggregate entitlement inspection redaction, /products/indie-launch-library, customer /products/entitlements lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, protected fixture delivery, protected fixture stale-state rejection, subscription-backed membership access activation/inactivation, owner private asset upload intent creation, owner-confirmed non-destructive revocation intent creation, idempotent replay, stale-state rejection, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #83 records the first product/access source-data contract and preview scaffold.",
      "Issue #101 records the first sandbox webhook-backed entitlement grant path.",
      "Issue #139 records the owner product entitlement inspection path.",
      "Issue #141 records the customer-safe checkout intent entitlement lookup path.",
      "Issue #143 records the short-lived download-token path.",
      "Issue #146 records the seeded private R2-backed fixture delivery path.",
      "Issue #147 records token redemption revalidation against current entitlement and trusted checkout state.",
      "Issue #151 records the owner-confirmed private product asset upload intent path.",
      "Issue #179 records the non-destructive revocation intent readiness path.",
      "Issue #181 records the non-delivery protected content readiness path.",
      "Issue #185 records the first checkout-scoped protected fixture delivery path.",
      "Issue #187 records the first subscription-backed membership entitlement path.",
      "Issue #251 records the first owner-confirmed non-destructive revocation intent path.",
    ],
    sortOrder: 49,
    updatedAt: null,
  },
  {
    id: "journey-publisher-verifies-sandbox-entitlement-grant",
    title: "Publisher verifies sandbox entitlement grant evidence",
    featureId: "feature-products-access",
    featureStatus: "launch-preview",
    issueNumbers: [16, 83, 99, 101, 139, 141, 143, 146, 147, 151, 179, 181, 185, 187, 251],
    primaryUser: "Publisher or agent validating fulfillment readiness",
    userGoal:
      "Confirm that a paid sandbox checkout webhook can grant product entitlements, trusted Stripe Billing state can sync membership access, queued fulfillment evidence stays public-safe, owner-confirmed revocation intent records stay non-destructive, and protected fixtures return only for active eligible checkout-linked entitlements.",
    sourceEvidence: [
      "https://bumpgrade.com/products/source-data",
      "https://bumpgrade.com/products/entitlements",
      "https://bumpgrade.com/api/products/entitlements",
      "https://bumpgrade.com/api/products/download-tokens",
      "https://bumpgrade.com/api/products/protected-content",
      "https://bumpgrade.com/api/admin/products/assets",
      "https://bumpgrade.com/api/admin/products/revocation-intents",
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
      "https://github.com/markitics/bumpgrade/issues/179",
      "https://github.com/markitics/bumpgrade/issues/181",
      "https://github.com/markitics/bumpgrade/issues/185",
      "https://github.com/markitics/bumpgrade/issues/187",
      "https://github.com/markitics/bumpgrade/issues/251",
    ],
    happyPath: [
      "Start a sandbox checkout for the primary offer and selected order bump.",
      "Receive trusted checkout.session.completed webhook evidence.",
      "Update the checkout intent to paid.",
      "Insert idempotent product_entitlements rows for mapped line items.",
      "Queue public-safe fulfillment task evidence without returning signed URLs, R2 object keys, or private buyer data.",
      "Open /products/entitlements with the checkout intent reference to confirm customer-safe entitlement and fulfillment status.",
      "Create and consume a one-use download token that revalidates current entitlement and trusted checkout state before streaming the seeded private R2-backed fixture for a file entitlement.",
      "Use the bundle entitlement and checkout intent to read a seeded protected course/member fixture through /api/products/protected-content.",
      "Receive trusted Stripe Billing subscription state and sync checkout-linked membership entitlement access while the subscription is active or trialing.",
      "As a verified owner, create a small private upload record for the file asset after exact confirmation, idempotency, and catalog revision checks.",
      "As a verified owner, record a non-destructive product access removal intent with exact confirmation and a current entitlement status check.",
      "Open /admin/products as a verified owner to inspect the entitlement rows, queued fulfillment evidence, revocation intents, and protected content readiness.",
    ],
    edgeCases: [
      "Duplicate webhook events do not create duplicate entitlements.",
      "Public /products/source-data exposes aggregate counts and redaction flags, not raw buyer rows.",
      "A token created before a checkout state change is rejected while checkout state is no longer trusted paid or completed.",
      "Owner-uploaded private assets are not yet customer-delivered.",
      "Owner-confirmed revocation intents reject stale entitlement status and idempotency conflicts but do not mutate access, billing, refunds, notifications, or fulfillment.",
      "Protected fixture delivery rejects mismatched entitlements and stale checkout state.",
      "Canceled, unpaid, incomplete_expired, or deleted subscriptions pause membership access without exposing raw subscription/customer IDs, Customer Portal URLs, member posts, private files, or progress rows.",
      "Signed downloads, arbitrary protected content delivery, customer portal, refunds, destructive revocation, and direct customer delivery of arbitrary uploads require later confirmed-write APIs.",
      "Raw Stripe identifiers and buyer email remain server-private.",
    ],
    agentAccess:
      "Agents can read /products/source-data, /api/products/entitlements, /api/products/download-tokens, /api/products/protected-content, and /commerce/source-data to understand the entitlement grant contract, customer-safe lookup, short-lived private R2-backed fixture delivery with redemption revalidation, owner-upload intent boundary, owner-confirmed non-destructive revocation intent boundary, protected content readiness, protected fixture delivery checks, subscription-backed membership access, and aggregate inspection counts. Owner sessions can inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products, create small private asset upload records, and record revocation intents via exact-confirmed, idempotent, stale-state-checked writes. Agents cannot grant, destructively revoke, expose private buyer data, deliver arbitrary protected bodies, deliver arbitrary uploads to customers, mutate subscriptions, create Customer Portal sessions, or issue signed object URLs without future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers source-data output, aggregate redaction, a paid test checkout webhook that creates entitlement rows, customer-safe lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, protected fixture delivery and stale-state rejection, subscription-backed membership access activation/inactivation, owner private asset upload intent creation, owner-confirmed non-destructive revocation intent creation, idempotent replay, stale-state rejection, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, and duplicate webhook idempotency.",
      "Issue #101 records the sandbox entitlement grant path.",
      "Issue #139 records the owner product entitlement inspection path.",
      "Issue #141 records the customer-safe product entitlement lookup path.",
      "Issue #143 records the short-lived download-token path.",
      "Issue #146 records the seeded private R2-backed fixture delivery path.",
      "Issue #147 records token redemption revalidation against current entitlement and trusted checkout state.",
      "Issue #151 records the owner-confirmed private product asset upload intent path.",
      "Issue #179 records the non-destructive revocation intent readiness path.",
      "Issue #181 records the non-delivery protected content readiness path.",
      "Issue #185 records the first checkout-scoped protected fixture delivery path.",
      "Issue #187 records the first subscription-backed membership entitlement path.",
      "Issue #251 records the owner-confirmed non-destructive revocation intent path.",
    ],
    sortOrder: 50,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-audience-automation",
    title: "Publisher previews audience opt-in automation",
    featureId: "feature-email-automation-crm",
    featureStatus: "launch-preview",
    issueNumbers: [17, 85, 103, 137, 167, 169, 171, 173, 175, 177, 183, 189, 191, 197, 199, 201, 203, 205, 207, 209, 211, 253, 259],
    primaryUser: "Publisher or agent planning list growth",
    userGoal: "Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, private CRM timeline note counts, broadcast readiness, dry-run schedule intents, preview/footer safety, queue readiness, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, owner-confirmed import intents, owner-confirmed import preflights, and the live consent/unsubscribe/note/import-intent/import-preflight boundary before email sends or real imports exist.",
    sourceEvidence: [
      "https://bumpgrade.com/audience/source-data",
      "https://bumpgrade.com/audience/indie-launch-waitlist",
      "https://bumpgrade.com/api/audience/opt-in",
      "https://bumpgrade.com/api/audience/unsubscribe",
      "https://bumpgrade.com/api/admin/audience/notes",
      "https://bumpgrade.com/api/admin/audience/broadcasts/schedule-intents",
      "https://bumpgrade.com/api/admin/audience/broadcasts/delivery-batches",
      "https://bumpgrade.com/api/admin/audience/broadcasts/delivery-queue-messages",
      "https://bumpgrade.com/api/admin/audience/broadcasts/dispatch-preflights",
      "https://bumpgrade.com/api/admin/audience/broadcasts/dispatch-attempts",
      "https://bumpgrade.com/api/admin/audience/import-intents",
      "https://bumpgrade.com/api/admin/audience/import-preflights",
      "https://bumpgrade.com/admin/audience",
      "https://bumpgrade.com/funnels/source-data",
      "https://github.com/markitics/bumpgrade/issues/17",
      "https://github.com/markitics/bumpgrade/issues/85",
      "https://github.com/markitics/bumpgrade/issues/103",
      "https://github.com/markitics/bumpgrade/issues/137",
      "https://github.com/markitics/bumpgrade/issues/167",
      "https://github.com/markitics/bumpgrade/issues/169",
      "https://github.com/markitics/bumpgrade/issues/171",
      "https://github.com/markitics/bumpgrade/issues/173",
      "https://github.com/markitics/bumpgrade/issues/175",
      "https://github.com/markitics/bumpgrade/issues/177",
      "https://github.com/markitics/bumpgrade/issues/183",
      "https://github.com/markitics/bumpgrade/issues/189",
      "https://github.com/markitics/bumpgrade/issues/191",
      "https://github.com/markitics/bumpgrade/issues/197",
      "https://github.com/markitics/bumpgrade/issues/199",
      "https://github.com/markitics/bumpgrade/issues/201",
      "https://github.com/markitics/bumpgrade/issues/203",
      "https://github.com/markitics/bumpgrade/issues/205",
      "https://github.com/markitics/bumpgrade/issues/207",
      "https://github.com/markitics/bumpgrade/issues/209",
      "https://github.com/markitics/bumpgrade/issues/211",
      "https://github.com/markitics/bumpgrade/issues/253",
      "https://github.com/markitics/bumpgrade/issues/259",
    ],
    happyPath: [
      "Fetch /audience/source-data.",
      "Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, aggregate CRM timeline counts, broadcast readiness counts, dry-run schedule intent counts, preview/footer safety records, queue readiness records, delivery-batch dry-run counts, dry-run queue-message counts, dispatch preflight counts, dispatch attempt counts, sender-domain readiness records, provider-event readiness records, provider rate-limit readiness records, provider response readiness records, send-payload readiness records, Queue producer readiness records, Queue consumer readiness records, import intent counts, import preflight counts, and write boundaries.",
      "Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.",
      "Confirm the API trims and normalizes email, stores consent evidence, assigns seeded tags, and records draft sequence enrollment without sending email.",
      "Submit the unsubscribe form or POST /api/audience/unsubscribe with an email and idempotency key.",
      "Confirm the unsubscribe API records suppression evidence, marks a known subscriber unsubscribed, and does not reveal whether the submitted email was already on the list.",
      "Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, suppression totals, private CRM timeline notes, broadcast readiness, dry-run schedule intents, preview safety, queue readiness, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, import intent records, and import preflight records.",
      "Create a short owner CRM note with exact confirmation, idempotency, and the expected subscriber status.",
      "Record a dry-run broadcast schedule intent with exact confirmation, idempotency, current draft revision, and expected readiness count.",
      "Record a delivery-batch dry run from the current schedule intent after preview safety, queue readiness, sender-domain gate, and suppression counts are checked.",
      "Record dry-run queue-message evidence from the current delivery batch after stale-state and dry-run queue gates are checked.",
      "Record dispatch preflight evidence from the current queue-message dry run after provider-limit, sender-domain, suppression, unsubscribe, audit, and queue-dispatch gates are checked.",
      "Record a dispatch attempt receipt from the current dispatch preflight after queue-producer and provider-response gates are checked.",
      "Record an import intent with exact confirmation, idempotency, current workspace revision/status, aggregate counts, and no raw contact rows or emails.",
      "Record an import preflight with exact confirmation, idempotency, selected import-intent source checks, current workspace revision/status, aggregate eligibility counts, and no raw contact rows, subscriber writes, exports, or sends.",
      "Use sender-domain readiness records to confirm live sends remain blocked until SPF, DKIM, DMARC, reply-path, bounce, and provider evidence are aligned.",
      "Use provider-event readiness records to confirm bounces, complaints, delivery events, raw provider payloads, and provider secrets stay redacted before provider webhooks exist.",
      "Use provider rate-limit readiness records to confirm throttles, retries, backpressure, and provider-limit secrets stay redacted before provider sends exist.",
      "Use provider response readiness records to confirm accepted, transient failure, permanent failure, raw response body, and provider message ID handling stays redacted before provider sends exist.",
      "Use send-payload readiness records to confirm recipient identity, personalization, unsubscribe footer, raw payload body, and audit handling stay redacted before recipient payloads or Queue producers exist.",
      "Use Queue producer readiness records to confirm binding, producer mode, payload dependency, consumer dependency, idempotency, audit, and backpressure gates stay explicit before Cloudflare Queue producers are enabled.",
      "Use Queue consumer readiness records to confirm consumer mode, producer dependency, ack, retry, dead-letter, provider handoff, idempotency, and audit gates stay explicit before Cloudflare Queue consumers are enabled.",
      "Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists.",
    ],
    edgeCases: [
      "The seeded audience automation workspace can capture explicit-consent opt-ins, record unsubscribe/suppression evidence, store private owner notes, calculate broadcast readiness, record dry-run schedule intent metadata, expose preview safety metadata, expose queue readiness metadata, record delivery-batch dry runs, record aggregate dry-run queue-message evidence, record dispatch preflight evidence, record dispatch attempt receipts, expose sender-domain, provider-event, provider rate-limit, provider response, send-payload, Queue producer, and Queue consumer readiness gates, record non-destructive import intents, and record aggregate import preflights, but it is not a general contact import, live Cloudflare Queue producer, live Cloudflare Queue consumer, provider-send path, provider webhook receiver, recipient-payload creator, or full CRM database.",
      "Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, note bodies, actor emails, actor hashes, import private notes, raw import rows, raw contact emails, private DNS credentials, raw DNS records, provider secrets, provider limit secrets, raw provider payloads, raw provider response bodies, recipient payloads, personalized bodies, raw payload bodies, provider message IDs, provider responses, Cloudflare Queue message bodies, Queue consumer ack/retry/dead-letter rows, send queue payloads, delivery payloads, reasons, subscriber rows from imports, exports, or private metadata.",
      "The unsubscribe API returns the submitted normalized email to the submitter but does not reveal list membership.",
      "Real subscriber imports, direct agent contact writes, real email sends, Queue producer execution, Queue consumer execution, private exports, and CRM automation require future confirmed-write APIs.",
      "Codex project email in issue #10 is separate from publisher/customer email workflows.",
    ],
    agentAccess:
      "Agents can read /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent/preview safety/queue readiness/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/sender-domain/provider-event/provider rate-limit/provider response/send-payload/Queue producer/Queue consumer/import-intent/import-preflight counts, and the opt-in/unsubscribe/note/schedule-intent/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/import-intent/import-preflight write boundaries. Owner sessions can inspect private rows, create private notes, view broadcast readiness, inspect preview safety, queue readiness, sender-domain readiness, provider-event readiness, provider rate-limit readiness, provider response readiness, send-payload readiness, Queue producer readiness, Queue consumer readiness, import intent records, and import preflight records, and record dry-run schedule intents, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, non-destructive import intents, and aggregate import preflights in /admin/audience. Direct agent subscriber writes, real imports, real sends, private exports, provider setup, provider webhooks, Queue producer execution, Queue consumer execution, or CRM automation require future authenticated confirmed-write APIs with consent, suppression, sender-domain safety, provider-event safety, provider rate-limit safety, provider response safety, send-payload safety, Queue producer safety, Queue consumer safety, queue safety, and audit correlation.",
    validation: [
      "Playwright covers /audience/source-data, aggregate subscriber/suppression/timeline/broadcast readiness/schedule intent/preview safety/queue readiness/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/sender-domain/provider-event/provider rate-limit/provider response/send-payload/Queue producer/Queue consumer/import-intent/import-preflight readiness redaction, /audience/indie-launch-waitlist, valid opt-in, unsubscribe, unknown-email suppression, owner /admin/audience inspection, owner CRM note creation, owner schedule-intent creation, owner delivery-batch creation, owner queue-message creation, owner dispatch-preflight creation, owner dispatch-attempt creation, owner import-intent creation, owner import-preflight creation, unauthorized note/schedule-intent/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/import-intent/import-preflight rejection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.",
      "Issues #85, #103, #137, #167, #169, #171, #173, #175, #177, #183, #189, #191, #197, #199, #201, #203, #205, #207, #209, #211, #253, and #259 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, unsubscribe/suppression path, owner CRM timeline note path, broadcast readiness path, dry-run broadcast schedule intent path, broadcast preview safety path, queue readiness path, delivery-batch dry-run path, queue-message dry-run path, dispatch-preflight dry-run path, dispatch-attempt receipt path, sender-domain readiness path, provider-event readiness path, provider rate-limit readiness path, provider response readiness path, send-payload readiness path, Queue producer readiness path, Queue consumer readiness path, owner import-intent path, and owner import-preflight path.",
    ],
    sortOrder: 50,
    updatedAt: null,
  },
  {
    id: "journey-visitor-joins-indie-launch-waitlist",
    title: "Visitor joins the indie launch waitlist",
    featureId: "feature-email-automation-crm",
    featureStatus: "launch-preview",
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
    featureStatus: "launch-preview",
    issueNumbers: [18, 87, 105, 107, 119, 121, 123, 125, 127, 129, 261],
    primaryUser: "Publisher or agent optimizing a launch funnel",
    userGoal:
      "Inspect seeded analytics definitions, capture privacy-safe test events, record browser-side funnel page views with deterministic variant and source attribution evidence, read dashboard-visible fixed-window aggregate source rows, assign deterministic variants, read aggregate conversion report rows, and record owner-reviewed experiment decision evidence before cookies, contact-level reporting, traffic routing, or automated winners exist.",
    sourceEvidence: [
      "https://bumpgrade.com/analytics/source-data",
      "https://bumpgrade.com/analytics/indie-launch-dashboard",
      "https://bumpgrade.com/api/analytics/events",
      "https://bumpgrade.com/api/analytics/assignments",
      "https://bumpgrade.com/api/admin/analytics/experiment-decisions",
      "https://bumpgrade.com/admin/analytics",
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
      "https://github.com/markitics/bumpgrade/issues/261",
    ],
    happyPath: [
      "Fetch /analytics/source-data.",
      "Find event IDs, page-view beacon boundary, aggregate source attribution counts, aggregate variant event counts, fixed time windows, metric IDs, aggregate event counts, aggregate conversion report rows, experiment IDs, variant IDs, assignment rule, assignment API, dashboard source section, and write boundary.",
      "Fetch /analytics/source-data?window=24h to inspect public-safe aggregate source and conversion rows for one supported fixed window.",
      "Open /funnels/indie-launch-sandbox with safe UTM parameters and let the session-idempotent page-view beacon assign a variant and record a seeded event with that variant ID and normalized source attribution.",
      "POST a seeded event to /api/analytics/events with an idempotency key and source route.",
      "POST a seeded experiment assignment to /api/analytics/assignments with an anonymous assignment key, idempotency key, and source route.",
      "Open /admin/analytics as a verified owner and record a redacted experiment decision with the current aggregate assignment counts, fixed-window conversion sample size, and sample-size caveat acknowledgement.",
      "Confirm duplicate idempotency returns the same public-safe event or assignment without duplicating rows.",
      "Open /analytics/indie-launch-dashboard to inspect the public preview, aggregate source rows, fixed-window controls, and caveats.",
    ],
    edgeCases: [
      "Public source-data exposes aggregate counts, aggregate source attribution counts, aggregate variant counts, fixed-window metadata, and conversion rows only, not raw event or assignment rows.",
      "Unsupported event IDs, experiment IDs, source routes, missing idempotency keys, and missing assignment keys return public-safe validation errors.",
      "Bot, crawler, and preview/test-suppressed page-view traffic is ignored before analytics event rows are created.",
      "Cookie assignment, contact-level analytics, raw referrer/query reporting, experiment traffic changes, automated winners, and revenue claims remain disabled even after owner decision evidence is recorded.",
      "Agents must include sample-size caveats and must not call sparse test events or assignments statistically meaningful.",
    ],
    agentAccess:
      "Agents can read /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard, event capture boundaries, page-view beacon boundaries, dashboard-visible fixed-window aggregate source attribution evidence, aggregate variant evidence, assignment boundaries, aggregate conversion report rows, and redacted experiment decision evidence. Owner sessions can record decision evidence through /api/admin/analytics/experiment-decisions. Direct public agent analytics writes, custom events, raw campaign/referrer reporting, experiment routing, automated winners, and revenue claims require future authenticated confirmed-write APIs with privacy review, idempotency, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.",
    validation: [
      "Playwright covers /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard fixed-window source attribution UI, /admin/analytics owner decision evidence, event ingestion, page-view beacon capture with variant and source attribution evidence, bot suppression, assignment ingestion, conversion reporting from captured events, duplicate idempotency, deterministic assignment, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.",
      "Issues #87, #105, #107, #119, #121, #123, #125, #127, #129, and #261 record the analytics source-data scaffold, first privacy-safe event capture path, first deterministic assignment path, first aggregate conversion report, first browser-side funnel page-view beacon, first variant-linked page-view evidence, first aggregate source attribution evidence, first dashboard-visible source breakdown, first fixed-window aggregate filters, and first owner-confirmed experiment decision evidence.",
    ],
    sortOrder: 51,
    updatedAt: null,
  },
  {
    id: "journey-publisher-reads-funnel-conversion-report",
    title: "Publisher reads a funnel conversion report",
    featureId: "feature-analytics-testing",
    featureStatus: "launch-preview",
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
      "Agents can read aggregate funnel conversion rows by fixed window and cite metric IDs, event IDs, dashboard-visible aggregate source attribution evidence, aggregate variant evidence, owner decision evidence, and issues #119/#121/#123/#125/#127/#129/#261 evidence. Direct analytics writes, raw referrer/query reporting, traffic routing, and automated experiment decisions require future confirmed-write APIs.",
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
    featureStatus: "launch-preview",
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
    featureStatus: "launch-preview",
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
    featureStatus: "launch-preview",
    issueNumbers: [19, 89, 109, 111, 113, 115, 193, 195],
    primaryUser: "Publisher or agent planning partner growth",
    userGoal:
      "Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, public-safe partner reports, read-only payout preparation, review-only ledger evidence, owner review/reversal state, payout review states, fraud flags, aggregate click counts, and checkout attribution evidence before payouts exist.",
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
      "https://github.com/markitics/bumpgrade/issues/193",
      "https://github.com/markitics/bumpgrade/issues/195",
    ],
    happyPath: [
      "Fetch /affiliates/source-data.",
      "Find the seeded affiliate program, revision ID, partner IDs, partner report IDs, payout preparation IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, owner review action contract, partner report contract, payout preparation contract, and write boundary.",
      "Read partnerReportSummary to compare aggregate click, attributed checkout, review-only ledger, review action, and commission evidence totals by partner without exposing raw rows.",
      "Read payoutPreparationSummary to inspect eligible, blocked, and reversed fixture ledgers plus readiness checklist items without treating them as payable.",
      "POST a seeded referral click to /api/affiliates/clicks with referral link ID or code, destination route, and idempotency key.",
      "Start a sandbox checkout intent through /api/commerce/checkout with the referral click ID and checkout idempotency key.",
      "Create review-only commission evidence through /api/affiliates/commission-ledger with checkout intent ID, exact confirmation, and idempotency key.",
      "As an owner, POST a review, hold, or reversal action to /api/admin/affiliates/commission-ledger/actions with exact confirmation, idempotency, expected updatedAt, and reason.",
      "Confirm duplicate idempotency returns the same ledger row and does not duplicate commission evidence.",
      "Open /affiliates/indie-launch-partners to inspect the public preview.",
      "Use /commerce/source-data and /offers/source-data to distinguish checkout attribution evidence, review-only ledger evidence, public-safe partner reports, and owner review/reversal actions from payable commissions.",
    ],
    edgeCases: [
      "Public source-data exposes aggregate click, checkout attribution, commission ledger, owner action, partner report, and payout preparation counts only, not raw click, checkout, buyer, actor, reason, tax, payout, partner notification, or Stripe rows.",
      "Unsupported referral link IDs, codes, destination routes, referral click IDs, checkout intent IDs, commission ledger IDs, action kinds, stale expected updatedAt values, and missing idempotency keys return public-safe validation errors.",
      "Cookie assignment, buyer attribution finalization, payable commission writes, payout accounts, tax forms, fraud enforcement, Stripe payouts, private partner portals, and partner notifications require future confirmed-write APIs.",
      "Agents must not call review-only commission evidence, partner report totals, or payout preparation rows payable or published affiliate terms.",
    ],
    agentAccess:
      "Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, owner review action boundaries, public-safe partner reports, and read-only payout preparation. Payout execution, fraud, tax, partner notification, private partner portal access, partner payout account storage, buyer attribution finalization, and direct agent affiliate writes require future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, and private payout data boundaries.",
    validation: [
      "Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, public-safe partner reports, read-only payout preparation, duplicate idempotency, stale-state validation, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.",
      "Issues #89, #109, #111, #113, #115, #193, and #195 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, owner review/reversal action boundary, public-safe partner report contract, and read-only payout preparation contract.",
    ],
    sortOrder: 52,
    updatedAt: null,
  },
  {
    id: "journey-agent-records-privacy-safe-referral-click",
    title: "Agent records a privacy-safe referral click",
    featureId: "feature-affiliates-referrals",
    featureStatus: "launch-preview",
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
    featureStatus: "launch-preview",
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
    featureStatus: "launch-preview",
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
    featureStatus: "launch-preview",
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
    id: "journey-publisher-prepares-affiliate-payout-batch",
    title: "Publisher prepares an affiliate payout batch",
    featureId: "feature-affiliates-referrals",
    featureStatus: "launch-preview",
    issueNumbers: [19, 113, 115, 193, 195],
    primaryUser: "Publisher reviewing affiliate payout readiness before payable state exists",
    userGoal:
      "Inspect read-only payout preparation rows, checklist blockers, and partner-report links before any Stripe payout, tax, payout account, or partner notification capability exists.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/source-data",
      "https://bumpgrade.com/affiliates/indie-launch-partners",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/113",
      "https://github.com/markitics/bumpgrade/issues/115",
      "https://github.com/markitics/bumpgrade/issues/193",
      "https://github.com/markitics/bumpgrade/issues/195",
    ],
    happyPath: [
      "Fetch /affiliates/source-data.",
      "Find payoutPreparationContract and payoutPreparationSummary.",
      "Inspect each payoutPreparationId, linked payoutBatchId, partnerReportIds, eligible ledger IDs, blocked ledger IDs, reversed ledger IDs, readiness checklist, and public-safe aggregate totals.",
      "Open /affiliates/indie-launch-partners and inspect the read-only payout preparation card.",
      "Treat the preparation row as a checklist only; do not call it payable commission state or a partner statement.",
    ],
    edgeCases: [
      "Refund-window, owner-hold, and self-referral evidence keep preparation blocked until future private review contracts exist.",
      "Public preparation rows never expose buyer data, raw ledger rows, raw actor identity, private reasons, partner payout accounts, tax forms, Stripe payout identifiers, or partner notification payloads.",
      "Stripe payouts, transfer creation, private partner portals, payout account storage, tax collection, fraud decisions, payable commission finalization, and direct agent writes require future confirmed-write APIs.",
    ],
    agentAccess:
      "Agents can read public-safe payout preparation from /affiliates/source-data and cite payoutPreparationId values. Payout execution, tax handling, payout accounts, partner notifications, fraud decisions, and direct agent affiliate writes require future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers payoutPreparationContract, payoutPreparationSummary, preview rendering, admin journey exposure, agent manifest stable IDs, and redaction boundaries.",
      "Issue #195 records the read-only payout preparation slice.",
    ],
    sortOrder: 59,
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
    proof: createJourneyProof(row.id, row.feature_id),
    sortOrder: row.sort_order,
    updatedAt: isoFromSeconds(row.updated_at),
  };
}

function journeyWithProof(journey: AdminUserJourney): AdminUserJourney {
  return {
    ...journey,
    proof: journey.proof ?? createJourneyProof(journey.id, journey.featureId),
  };
}

function mergeJourneysWithFixtureProof(primaryJourneys: AdminUserJourney[]) {
  const seen = new Set(primaryJourneys.map((journey) => journey.id));
  const missingFixtureJourneys = fallbackUserJourneys.filter((journey) => !seen.has(journey.id));
  return [...primaryJourneys, ...missingFixtureJourneys]
    .map(journeyWithProof)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
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
    userJourneys: fallbackUserJourneys.map(journeyWithProof),
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
    const d1Journeys = journeyRows.map(journeyFromRow);
    const userJourneys = journeyRows.length ? mergeJourneysWithFixtureProof(d1Journeys) : fallbackUserJourneys.map(journeyWithProof);

    if (!hasAnyD1Rows) {
      return fallbackData("D1 admin tables are reachable but empty, so fixture records are shown.");
    }

    return {
      source: hasCoreD1Rows && userJourneys.length === d1Journeys.length ? "d1" : "mixed",
      loadError: null,
      roadmapItems: roadmapRows.length ? roadmapRows.map(roadmapFromRow) : fallbackRoadmapItems,
      workLogEntries: workRows.length ? workRows.map(workLogFromRow) : fallbackWorkLogEntries,
      userJourneys,
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
