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

export type PublicAdminWorkLogEntry = Omit<AdminWorkLogEntry, "promptFromMark"> & {
  ownerRequest: string;
};

export type PublicAdminSurfaceData = Omit<AdminSurfaceData, "workLogEntries"> & {
  workLogEntries: PublicAdminWorkLogEntry[];
};

export function toPublicAdminWorkLogEntry(entry: AdminWorkLogEntry): PublicAdminWorkLogEntry {
  const { promptFromMark, ...publicEntry } = entry;

  return {
    ...publicEntry,
    ownerRequest: ownerSafeRequestText(promptFromMark),
  };
}

export function toPublicAdminSurfaceData(data: AdminSurfaceData): PublicAdminSurfaceData {
  return {
    ...data,
    workLogEntries: data.workLogEntries.map(toPublicAdminWorkLogEntry),
  };
}

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

function normalizeRelevantUrls(value: string | null | undefined): string[] {
  return parseJson<unknown[]>(value, [])
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "url" in item && typeof item.url === "string") return item.url;
      return "";
    })
    .filter((item) => item.length > 0);
}

function ownerSafeRequestText(value: string): string {
  return value
    .replace(/\bFor-Mark\b/g, "Owner-attention")
    .replace(/\bfor-Mark\b/g, "owner-attention")
    .replace(/\bMark-attention\b/g, "owner-attention")
    .replace(/\bMark attention\b/g, "owner attention")
    .replace(/\bMark asked to\b/g, "Owner requested to")
    .replace(/\bMark asked for\b/g, "Owner requested")
    .replace(/\bMark asked\b/g, "Owner requested")
    .replace(/\bMark-facing\b/g, "Owner-facing")
    .replace(/\bMark\b/g, "the owner")
    .replace(/\b(?:m@rkmoriarty\.com|mark@awesound\.com|markmoriarty@stripe\.com)\b/gi, "a private trusted sender")
    .replace(/\b(?:codex_outbound_messages|codex_inbound_messages)\b/g, "private operational records")
    .replace(/\bbumpgrade-mail\b/g, "private mail storage")
    .replace(/\braw inbound MIME\b/gi, "raw mail content")
    .replace(/\braw MIME\b/gi, "raw mail content")
    .replace(/\bsender-authentication\b/gi, "sender authentication")
    .replace(/\bsmtp\.mailfrom=[^\s`.,;)]+/gi, "runtime sender evidence")
    .replace(/\bheader\.from=[^\s`.,;)]+/gi, "runtime domain evidence")
    .replace(/\bexplicitly allowlisted and authenticated sender addresses\b/gi, "private runtime sender rules")
    .replace(/\ballowlisted-and-authenticated\b/gi, "private runtime authenticated")
    .replace(/\ballowlisted and authenticated\b/gi, "private runtime authenticated");
}

function ownerSafeRequestTexts(values: string[]): string[] {
  return values.map(ownerSafeRequestText);
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
const issue466PrUrl = "https://github.com/markitics/bumpgrade/pull/472";
const issue467PrUrl = "https://github.com/markitics/bumpgrade/pull/483";
const issue467PreflightPrUrl = "https://github.com/markitics/bumpgrade/pull/494";
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
  "journey-prospect-imports-from-clickfunnels": {
    status: "passed",
    lastTestedAt: "2026-05-25T22:58:24.000Z",
    environment: "Local Cloudflare preview, PR screenshot artifacts, and importer source-data smoke coverage.",
    method:
      "Importer hub route smoke, dedicated importer route smoke, platform-specific source-guide smoke, importer source-data inspection, public redacted preflight review coverage, verified-publisher private import API coverage, private rollback/restart coverage, public discovery checks, and admin user-journey proof summary checks.",
    summary:
      "The importer journey has route, source-data, screenshot, issue, and API evidence for reviewing platform-specific source material, previewing an import map, saving imported material into a private Free Build draft, and archiving that draft before restarting without claiming live account transfer or buyer-facing changes.",
    ciLinks: [
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Importer center", url: "https://bumpgrade.com/pr-screenshots/issue-467-imports.png", kind: "screenshot" },
      { label: "ClickFunnels importer", url: "https://bumpgrade.com/pr-screenshots/issue-467-clickfunnels-importer.png", kind: "screenshot" },
      {
        label: "Importer preflight review",
        url: "https://bumpgrade.com/pr-screenshots/issue-467-importer-preflight-review.png",
        kind: "screenshot",
      },
    ],
    validationLinks: [
      { label: "Import center", url: "https://bumpgrade.com/imports", kind: "route" },
      { label: "ClickFunnels importer", url: "https://bumpgrade.com/imports/clickfunnels", kind: "route" },
      { label: "Importer source data", url: "https://bumpgrade.com/imports/source-data", kind: "source-data" },
      { label: "SamCart importer rollback API", url: "https://bumpgrade.com/api/imports/samcart/draft/rollback", kind: "api" },
      { label: "Comparison source data", url: "https://bumpgrade.com/compare/source-data", kind: "source-data" },
      { label: "PR #483", url: issue467PrUrl, kind: "pr" },
      { label: "PR #494", url: issue467PreflightPrUrl, kind: "pr" },
      { label: "Issue #467", url: "https://github.com/markitics/bumpgrade/issues/467", kind: "issue" },
    ],
    notes: [
      "Platform-specific source guides and public redacted preflight review maps are live on dedicated importer paths. Private draft creation is live for verified publishers; source-match duplicate review reuses matching private drafts by platform, workspace, normalized title, and source URL or export file name. Private rollback controls archive importer-created plans while preserving saved work so the same source can restart as a fresh private plan. Subscriber import, live checkout migration, payment credential migration, public publishing, domains, and fulfillment remain follow-up work.",
      "Competitor facts remain volatile; agents should refresh external competitor pages before making time-sensitive claims.",
    ],
  },
  "journey-mark-reviews-nonblocking-attention": {
    status: "passed",
    lastTestedAt: journeyProofRefreshAt,
    environment: "Production source-data routes, merged PRs #241 and #244, and deployed owner-attention screenshots.",
    method: "Owner-attention source-data smoke, admin source-data smoke, user-journey proof summary smoke, and screenshot evidence for response channels.",
    summary:
      "Owner attention is now explicit about read-only page behavior, GitHub issue response paths, project email, and durable work-log evidence.",
    ciLinks: [
      { label: "PR #241 CI run", url: issue240CiRunUrl, kind: "ci" },
      { label: "Main CI after PR #244", url: issue244MainCiRunUrl, kind: "ci" },
      { label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" },
    ],
    screenshotLinks: [
      { label: "Owner-attention response channels", url: "https://bumpgrade.com/pr-screenshots/issue-73-for-mark-response-channels.png", kind: "screenshot" },
      { label: "User-journey proof matrix", url: "https://bumpgrade.com/pr-screenshots/issue-240-user-journeys-proof-matrix.png", kind: "screenshot" },
    ],
    validationLinks: [
      { label: "Owner-attention source data", url: "https://bumpgrade.com/admin/for-mark/source-data", kind: "source-data" },
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
      { label: "Auth-aware owner-attention nav", url: "https://bumpgrade.com/pr-screenshots/issue-97-auth-aware-nav-for-mark.png", kind: "screenshot" },
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
      "Issue #316 moves pricing from launch conversation copy to self-serve Experiment and Grow subscriptions plus the White glove setup option.",
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
      "Publishers can inspect the first paid-offer stack, order bump, post-purchase options, Bumpgrade account-plan checkout, and payment boundaries with current proof.",
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
      "Live self-serve checkout is intentionally parked in issue #219 until the owner confirms product, amount, and rollout.",
    ],
  },
  "journey-prospect-explores-launch-marketing": {
    status: "passed",
    lastTestedAt: launchProofUpdatedAt,
    environment: "Local launch branch, GitHub Actions CI, merged PRs #218 and #233, deployed screenshots, and production route smoke.",
    method: "Public route smoke tests, sitemap checks, feature source-data checks, production visible-text smoke, and launch screenshots.",
    summary: "Homepage, feature index, feature detail, pricing, account setup, and source-data routes have route, CI, and screenshot proof for publishers evaluating Bumpgrade.",
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
    summary: "Pricing explains self-serve Experiment and Grow checkout, Enterprise contact, White glove setup, Bumpgrade subdomains, existing-domain setup, no domain purchase, and billing boundaries.",
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
      "Bumpgrade account-plan checkout is separate from customer-facing checkout for a publisher's own offer.",
      "Live webhook-backed renewal and cancellation automation remains a follow-up until a live Stripe webhook signing secret is configured.",
    ],
  },
  "journey-prospect-understands-free-build": {
    status: "passed",
    lastTestedAt: "2026-05-25T12:25:00.000Z",
    environment: "Local OpenNext preview, focused Playwright source-data smoke, and PR screenshot artifacts for issue #466.",
    method: "Pricing route smoke, pricing source-data inspection, content source-data inspection, agent-docs source-data inspection, public-copy scan, and screenshot review.",
    summary:
      "The Free Build journey has route and source-data proof for private build-before-payment messaging, logged-out browser playground recovery, signed-in private workspace creation, and paid go-live gates.",
    ciLinks: [{ label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" }],
    screenshotLinks: [
      { label: "Free Build pricing", url: "https://bumpgrade.com/pr-screenshots/issue-466-pricing-free-build.png", kind: "screenshot" },
      {
        label: "Pricing source data",
        url: "https://bumpgrade.com/pr-screenshots/issue-466-pricing-source-data.png",
        kind: "screenshot",
      },
    ],
    validationLinks: [
      { label: "Pricing", url: "https://bumpgrade.com/pricing", kind: "route" },
      { label: "Playground", url: "https://bumpgrade.com/playground", kind: "route" },
      { label: "Playground source data", url: "https://bumpgrade.com/playground/source-data", kind: "source-data" },
      { label: "Pricing source data", url: "https://bumpgrade.com/pricing/source-data", kind: "source-data" },
      { label: "Content source data", url: "https://bumpgrade.com/content/source-data", kind: "source-data" },
      { label: "Agent docs source data", url: "https://bumpgrade.com/agent-docs/source-data", kind: "source-data" },
      { label: "PR #472", url: issue466PrUrl, kind: "pr" },
      { label: "Issue #466", url: "https://github.com/markitics/bumpgrade/issues/466", kind: "issue" },
    ],
    notes: ["The current proof separates browser-scoped anonymous saves, signed-in Free Build, and paid go-live actions."],
  },
  "journey-prospect-saves-anonymous-playground": {
    status: "passed",
    lastTestedAt: "2026-05-25T15:40:00.000Z",
    environment: "Local OpenNext preview, browser recovery smoke, authenticated claim smoke, and PR screenshot artifacts for issue #466.",
    method:
      "Logged-out save, recovery-cookie persistence after refresh, source-data redaction, unauthenticated claim rejection, verified-account claim, cleanup contract checks, and paid go-live gate checks.",
    summary:
      "Logged-out visitors can save a structured launch playground in one browser, return later, and attach it to a verified Free Build account plus private launch draft and claim records without enabling public publishing, billing, sends, domains, or fulfillment.",
    ciLinks: [{ label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" }],
    screenshotLinks: [
      {
        label: "Anonymous playground",
        url: "https://bumpgrade.com/pr-screenshots/issue-466-anonymous-playground.png",
        kind: "screenshot",
      },
    ],
    validationLinks: [
      { label: "Playground", url: "https://bumpgrade.com/playground", kind: "route" },
      { label: "Playground source data", url: "https://bumpgrade.com/playground/source-data", kind: "source-data" },
      { label: "Funnel source data", url: "https://bumpgrade.com/funnels/source-data", kind: "source-data" },
      { label: "Pricing source data", url: "https://bumpgrade.com/pricing/source-data", kind: "source-data" },
      { label: "Account source data", url: "https://bumpgrade.com/account/source-data", kind: "source-data" },
      { label: "Issue #466", url: "https://github.com/markitics/bumpgrade/issues/466", kind: "issue" },
    ],
    notes: [
      "Anonymous recovery depends on the browser cookie remaining available.",
      "Owner cleanup can expire old anonymous recovery, clear anonymous draft fields, and preserve claimed private records without public exposure.",
      "The playground stores structured launch context and creates a private draft only after verified-account claim; buyer-facing actions remain paid-gated.",
    ],
  },
  "journey-publisher-creates-free-build-workspace": {
    status: "passed",
    lastTestedAt: "2026-05-25T12:55:00.000Z",
    environment: "Local OpenNext preview, authenticated Playwright account setup flow, source-data smoke, and PR screenshot artifacts for issue #473.",
    method:
      "Verified signed-in Free Build API creation, idempotent replay, paid subdomain/custom-domain gate checks, account setup UI smoke, and account source-data inspection.",
    summary:
      "Verified publishers can create a private Free Build workspace before payment while subdomain reservation, custom-domain onboarding, public publishing, live checkout, sends, and fulfillment remain paid-gated.",
    ciLinks: [{ label: "CI workflow", url: issue217CiWorkflowUrl, kind: "ci" }],
    screenshotLinks: [
      {
        label: "Free Build account setup",
        url: "https://bumpgrade.com/pr-screenshots/issue-473-free-build-account-setup.png",
        kind: "screenshot",
      },
    ],
    validationLinks: [
      { label: "Account setup", url: "https://bumpgrade.com/account/setup", kind: "route" },
      { label: "Account source data", url: "https://bumpgrade.com/account/source-data", kind: "source-data" },
      { label: "Issue #473", url: "https://github.com/markitics/bumpgrade/issues/473", kind: "issue" },
    ],
    notes: [
      "Logged-out anonymous browser recovery remains outside this signed-in workspace slice.",
      "Buyer-facing actions still require paid go-live state.",
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
    lastTestedAt: "2026-05-25T09:06:58.000Z",
    environment: "Production screenshot and source-data evidence from funnel feature issues.",
    method: "Route smoke, owner-gated admin preview, and screenshot evidence.",
    summary: "Funnel previews, template library, draft admin, publishing, checkout linking, resource delivery links, funnel-scoped private delivery tokens, webinar event/replay links, archived-draft purge, visual style controls, block reordering, cross-step block moves, and webinar/resource shapes have screenshot evidence.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [
      { label: "Funnel template library", url: "https://bumpgrade.com/pr-screenshots/issue-159-funnel-template-library.png", kind: "screenshot" },
      { label: "Template draft admin", url: "https://bumpgrade.com/pr-screenshots/issue-161-template-draft-admin.png", kind: "screenshot" },
      { label: "Webinar and resource funnels", url: "https://bumpgrade.com/pr-screenshots/issue-213-webinar-resource-funnels.png", kind: "screenshot" },
      { label: "Draft block editing", url: "https://bumpgrade.com/pr-screenshots/issue-430-funnel-block-editing.png", kind: "screenshot" },
      { label: "Draft block add/remove", url: "https://bumpgrade.com/pr-screenshots/issue-432-funnel-block-add-remove.png", kind: "screenshot" },
      {
        label: "Draft block visual styles",
        url: "https://bumpgrade.com/pr-screenshots/issue-417-funnel-visual-style-controls.png",
        kind: "screenshot",
      },
      {
        label: "Resource delivery links",
        url: "https://bumpgrade.com/pr-screenshots/issue-417-resource-delivery-links.png",
        kind: "screenshot",
      },
      {
        label: "Resource delivery tokens",
        url: "https://bumpgrade.com/pr-screenshots/issue-417-funnel-resource-delivery-tokens.png",
        kind: "screenshot",
      },
      {
        label: "Webinar event links",
        url: "https://bumpgrade.com/pr-screenshots/issue-417-webinar-event-links.png",
        kind: "screenshot",
      },
      {
        label: "Archived draft purge",
        url: "https://bumpgrade.com/pr-screenshots/issue-417-archived-draft-purge.png",
        kind: "screenshot",
      },
      {
        label: "Draft block reordering",
        url: "https://bumpgrade.com/pr-screenshots/issue-417-block-reordering.png",
        kind: "screenshot",
      },
      {
        label: "Cross-step block moves",
        url: "https://bumpgrade.com/pr-screenshots/issue-417-cross-step-block-moves.png",
        kind: "screenshot",
      },
      {
        label: "Drag/drop block placement",
        url: "https://bumpgrade.com/pr-screenshots/issue-417-drag-drop-block-placement.png",
        kind: "screenshot",
      },
      {
        label: "Agent draft publishing",
        url: "https://bumpgrade.com/pr-screenshots/issue-417-agent-funnel-publishing.png",
        kind: "screenshot",
      },
    ],
    validationLinks: [{ label: "Funnels source data", url: "https://bumpgrade.com/funnels/source-data", kind: "source-data" }],
    notes: [
      "Issue #14 is the shipped funnel MVP proof. Issue #417 now includes owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private delivery tokens, webinar event/replay links, owner-session visual block style controls, archived-draft purge, owner-session within-step block reordering, owner-session drag/drop block placement through existing move endpoints, owner-session cross-step block moves, and owner-session direct agent-safe draft writes including visual style presets, reusable block add/remove, checkout linking/unlinking, resource-delivery and webinar-event linking, block movement, public publishing, archive/unpublish, and archived-draft purge; live billing stays in issue #219; bulk purge policy, full absolute-position canvas editing, arbitrary uploaded private asset delivery, live fulfillment automation, full webinar integrations, direct agent-created delivery tokens, non-archived direct agent purge, and unauthenticated public agent writes stay in issue #417.",
      "Issue #215 adds owner-confirmed private draft duplication without copying checkout-link, resource-link, or webinar-link metadata; issue #341 adds owner-confirmed archive/unpublish without deleting evidence; issue #417 adds owner-confirmed checkout unlinking, resource delivery links, funnel-scoped private delivery tokens, webinar event/replay links, archived-draft purge with tombstone evidence, visual style controls, within-step block reordering, drag/drop block placement, cross-step block moves, and expanded owner-session direct agent-safe draft writes including reusable block add/remove and public publishing; issue #430 adds owner-session block title/body editing while preserving block metadata; issue #432 adds owner-session reusable block add/remove while refusing checkout-linked block removal.",
    ],
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
    lastTestedAt: "2026-05-23T14:10:00.000Z",
    environment: "Production screenshot and audience automation source-data evidence.",
    method:
      "Opt-in, suppression, CRM note, sequence Queue consumer, sequence provider-call, sequence provider-polling, sequence receipt-payload, broadcast readiness, queue, provider, and dispatch readiness route checks.",
    summary:
      "Audience capture, sequence handoff, and campaign readiness surfaces have broad screenshot proof; real provider sends remain gated.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [
      { label: "Audience opt-in", url: "https://bumpgrade.com/pr-screenshots/issue-103-audience-opt-in.png", kind: "screenshot" },
      { label: "Broadcast readiness", url: "https://bumpgrade.com/pr-screenshots/issue-171-broadcast-readiness.png", kind: "screenshot" },
      { label: "Queue consumer readiness", url: "https://bumpgrade.com/pr-screenshots/issue-211-audience-queue-consumer-readiness.png", kind: "screenshot" },
      {
        label: "Sequence Queue consumer readiness",
        url: "https://bumpgrade.com/pr-screenshots/issue-368-admin-audience-sequence-queue-consumer-readiness.png",
        kind: "screenshot",
      },
      {
        label: "Sequence provider-call readiness",
        url: "https://bumpgrade.com/pr-screenshots/issue-370-admin-audience-sequence-provider-call-readiness.png",
        kind: "screenshot",
      },
      {
        label: "Sequence delivery-attempt readiness",
        url: "https://bumpgrade.com/pr-screenshots/issue-372-admin-audience-sequence-delivery-attempt-readiness.png",
        kind: "screenshot",
      },
      {
        label: "Sequence delivery-result readiness",
        url: "https://bumpgrade.com/pr-screenshots/issue-374-admin-audience-sequence-delivery-result-readiness.png",
        kind: "screenshot",
      },
      {
        label: "Sequence delivery-status webhook readiness",
        url: "https://bumpgrade.com/pr-screenshots/issue-376-admin-audience-sequence-delivery-status-webhook-readiness.png",
        kind: "screenshot",
      },
      {
        label: "Sequence provider-polling readiness",
        url: "https://bumpgrade.com/pr-screenshots/issue-378-admin-audience-sequence-provider-polling-readiness.png",
        kind: "screenshot",
      },
      {
        label: "Sequence receipt-payload readiness",
        url: "https://bumpgrade.com/pr-screenshots/issue-380-admin-audience-sequence-receipt-payload-readiness.png",
        kind: "screenshot",
      },
    ],
    validationLinks: [{ label: "Audience source data", url: "https://bumpgrade.com/audience/source-data", kind: "source-data" }],
    notes: ["Provider sends and queue consumption are not claimed as live customer email delivery."],
  },
  "feature-analytics-testing": {
    status: "passed",
    lastTestedAt: "2026-05-24T09:00:00.000Z",
    environment: "Production screenshot and analytics source-data evidence.",
    method:
      "Analytics event, page-view beacon, source attribution, variant, time-window, report-export, staged notification readiness through provider-status reconciliation readiness, and owner decision-evidence route checks.",
    summary:
      "Analytics MVP proof is live: seeded event writes, deterministic assignments, aggregate conversion reporting, source attribution, time windows, aggregate report export metadata, owner-confirmed experiment decision evidence, owner-reviewed content/consent readiness, send-payload readiness, queue-producer and queue-consumer readiness, provider-call readiness, delivery-attempt/result/status readiness, provider-polling readiness, receipt-payload readiness, delivery-receipt readiness, and provider-status reconciliation readiness have proof surfaces while live execution remains grouped in issue #422.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [
      { label: "Analytics time windows", url: "https://bumpgrade.com/pr-screenshots/issue-129-analytics-time-windows-desktop.png", kind: "screenshot" },
      { label: "Source attribution", url: "https://bumpgrade.com/pr-screenshots/issue-127-dashboard-source-attribution-desktop.png", kind: "screenshot" },
      { label: "Experiment decisions", url: "https://bumpgrade.com/pr-screenshots/issue-261-admin-analytics-experiment-decisions.png", kind: "screenshot" },
      { label: "Content/consent readiness", url: "https://bumpgrade.com/pr-screenshots/issue-288-admin-analytics-content-consent-readiness.png", kind: "screenshot" },
      { label: "Send-payload readiness", url: "https://bumpgrade.com/pr-screenshots/issue-290-admin-analytics-send-payload-readiness.png", kind: "screenshot" },
      { label: "Queue-producer readiness", url: "https://bumpgrade.com/pr-screenshots/issue-292-admin-analytics-queue-producer-readiness.png", kind: "screenshot" },
      { label: "Queue-consumer readiness", url: "https://bumpgrade.com/pr-screenshots/issue-294-admin-analytics-queue-consumer-readiness.png", kind: "screenshot" },
      { label: "Provider-call readiness", url: "https://bumpgrade.com/pr-screenshots/issue-297-admin-analytics-provider-call-readiness.png", kind: "screenshot" },
      { label: "Delivery-attempt readiness", url: "https://bumpgrade.com/pr-screenshots/issue-299-admin-analytics-delivery-attempt-readiness.png", kind: "screenshot" },
      { label: "Delivery-result readiness", url: "https://bumpgrade.com/pr-screenshots/issue-301-admin-analytics-delivery-result-readiness.png", kind: "screenshot" },
      { label: "Delivery-status webhook readiness", url: "https://bumpgrade.com/pr-screenshots/issue-303-admin-analytics-delivery-status-webhook-readiness.png", kind: "screenshot" },
      { label: "Provider-polling readiness", url: "https://bumpgrade.com/pr-screenshots/issue-305-admin-analytics-provider-polling-readiness.png", kind: "screenshot" },
      { label: "Receipt-payload readiness", url: "https://bumpgrade.com/pr-screenshots/issue-307-admin-analytics-receipt-payload-readiness.png", kind: "screenshot" },
      { label: "Delivery-receipt readiness", url: "https://bumpgrade.com/pr-screenshots/issue-309-admin-analytics-delivery-receipt-readiness.png", kind: "screenshot" },
      { label: "Provider-status reconciliation readiness", url: "https://bumpgrade.com/pr-screenshots/issue-311-admin-analytics-provider-status-reconciliation-readiness.png", kind: "screenshot" },
      { label: "Analytics MVP roadmap closeout", url: "https://bumpgrade.com/pr-screenshots/issue-18-analytics-mvp-live-closeout-roadmap.png", kind: "screenshot" },
      { label: "Analytics MVP features closeout", url: "https://bumpgrade.com/pr-screenshots/issue-18-analytics-mvp-live-closeout-features.png", kind: "screenshot" },
    ],
    validationLinks: [{ label: "Analytics source data", url: "https://bumpgrade.com/analytics/source-data", kind: "source-data" }],
    notes: [
      "Reports, report export metadata, queue readiness, provider-call readiness, delivery-attempt readiness, delivery-result readiness, delivery-status webhook readiness, provider-polling readiness, receipt-payload readiness, delivery-receipt readiness, provider-status reconciliation readiness, and decision evidence are aggregate and public-safe; raw visitor data, queue payload bodies, message consumption, acknowledgements, retry/dead-letter rows, provider calls, delivery attempts, delivery results, delivery status webhooks, provider responses, provider message IDs, delivery receipts, receipt payloads, status webhooks, provider polling, provider status reconciliation, secrets, sender credentials, and sends are not exposed or enabled.",
    ],
  },
  "feature-affiliates-referrals": {
    status: "passed",
    lastTestedAt: "2026-05-25T05:53:00.000Z",
    environment:
      "Local owner-session smoke plus production screenshot, affiliate/referral source-data evidence, fraud enforcement record screenshot, and MVP closeout source-data checks.",
    method:
      "Referral click, checkout attribution, commission ledger, review action, partner report, payout-prep, owner payout-preparation record, owner fraud-review record, owner fraud-enforcement record, notification-readiness, send-preflight, provider-readiness, and grouped post-MVP execution-boundary route checks.",
    summary:
      "Affiliate/referral MVP proof is live: source data, partner links, privacy-safe click capture, sandbox checkout attribution, review-only commission evidence, reversible owner review actions, public-safe partner reports, payout preparation, fraud review records, fraud enforcement records, and notification readiness/preflight/provider-readiness records have proof surfaces while payout execution, partner sends, private portals, and direct agent writes remain grouped in issue #424.",
    ciLinks: [{ label: "GitHub Actions", url: "https://github.com/markitics/bumpgrade/actions", kind: "ci" }],
    screenshotLinks: [
      { label: "Affiliate payout prep", url: "https://bumpgrade.com/pr-screenshots/issue-195-affiliate-payout-prep.png", kind: "screenshot" },
      { label: "Commission review", url: "https://bumpgrade.com/pr-screenshots/issue-115-commission-review-affiliates-desktop.png", kind: "screenshot" },
      { label: "Fraud review records", url: "https://bumpgrade.com/pr-screenshots/issue-275-admin-affiliate-fraud-review-record.png", kind: "screenshot" },
      { label: "Fraud enforcement records", url: "https://bumpgrade.com/pr-screenshots/issue-424-admin-affiliate-fraud-enforcement-records.png", kind: "screenshot" },
      { label: "Notification readiness record", url: "https://bumpgrade.com/pr-screenshots/issue-277-admin-affiliate-notification-readiness-record.png", kind: "screenshot" },
      { label: "Latest notification readiness records", url: "https://bumpgrade.com/pr-screenshots/issue-277-admin-affiliate-latest-notification-records.png", kind: "screenshot" },
      { label: "Affiliate MVP roadmap closeout", url: "https://bumpgrade.com/pr-screenshots/issue-19-affiliate-mvp-live-closeout-roadmap.png", kind: "screenshot" },
      { label: "Affiliate MVP features closeout", url: "https://bumpgrade.com/pr-screenshots/issue-19-affiliate-mvp-live-closeout-features.png", kind: "screenshot" },
    ],
    validationLinks: [{ label: "Affiliates source data", url: "https://bumpgrade.com/affiliates/source-data", kind: "source-data" }],
    notes: [
      "Payable commissions, Stripe payouts, payout accounts, tax records, private fraud signals, recipient data, provider calls, queue dispatch, partner notifications, private partner portals, buyer attribution finalization, and direct agent writes remain outside the live MVP and are tracked by issue #424.",
    ],
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
    id: "work-log-2026-05-25-importer-platform-source-guides",
    title: "Added platform-specific importer source guides",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-build-heartbeat",
    promptFromMark:
      "Mark asked for easy importers from ClickFunnels and other competitors, with public copy for real prospects and their agents.",
    githubIssues: [{ number: 467, url: "https://github.com/markitics/bumpgrade/issues/467" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/imports",
      "https://bumpgrade.com/imports/source-data",
      "https://bumpgrade.com/imports/samcart",
    ],
    roadmapUpdated: ["roadmap-competitor-importers"],
    userJourneysUpdated: ["journey-prospect-imports-from-clickfunnels"],
    documentationUpdated: ["docs/features/importers.md", "docs/agent/agent-ready.md", "public/llms.txt"],
    validation: [
      "Focused importer source-data and dedicated route smoke coverage",
      "Typecheck",
      "Lint",
      "Runtime secrets",
      "Cloudflare build",
    ],
    flagsAttention: null,
    firstPromptAt: "2026-05-25T23:49:35.000Z",
    completedAt: "2026-05-25T23:59:00.000Z",
    relevantUrls: [
      "https://bumpgrade.com/imports/source-data",
      "https://bumpgrade.com/imports/samcart",
      "https://bumpgrade.com/admin/work-log",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-importer-rollback-restart-controls",
    title: "Added private importer rollback and restart controls",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-build-heartbeat",
    promptFromMark:
      "Mark asked for easy importer flows and public copy geared toward real users while keeping owner-visible progress broad and quiet unless action is needed.",
    githubIssues: [{ number: 467, url: "https://github.com/markitics/bumpgrade/issues/467" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/imports",
      "https://bumpgrade.com/imports/source-data",
      "https://bumpgrade.com/api/imports/samcart/draft/rollback",
    ],
    roadmapUpdated: ["roadmap-competitor-importers"],
    userJourneysUpdated: ["journey-prospect-imports-from-clickfunnels"],
    documentationUpdated: ["docs/features/importers.md", "docs/agent/agent-ready.md", "public/llms.txt"],
    validation: [
      "Focused importer source-data and verified-publisher create rollback restart smoke coverage",
      "Typecheck",
      "Lint",
      "Runtime secrets",
      "Cloudflare build",
    ],
    flagsAttention: null,
    firstPromptAt: "2026-05-25T20:25:57.422Z",
    completedAt: "2026-05-25T22:58:24.000Z",
    relevantUrls: [
      "https://bumpgrade.com/imports/source-data",
      "https://bumpgrade.com/api/imports/samcart/draft/rollback",
      "https://bumpgrade.com/admin/work-log",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-anonymous-playground-retention-controls",
    title: "Added anonymous playground retention controls",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-build-heartbeat",
    promptFromMark:
      "Owner asked for logged-out product play that saves progress without losing work, while keeping public copy human-facing and agent contracts honest.",
    githubIssues: [{ number: 466, url: "https://github.com/markitics/bumpgrade/issues/466" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/playground",
      "https://bumpgrade.com/playground/source-data",
      "https://bumpgrade.com/account/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: ["docs/agent/agent-ready.md", "docs/features/publisher-tenants.md", "public/llms.txt"],
    validation: [
      "typecheck",
      "lint",
      "runtime secrets",
      "local D1 migration",
      "Cloudflare build",
      "focused Playwright smoke for anonymous playground retention/source-data/admin copy",
      "live smoke after deploy",
    ],
    flagsAttention: null,
    firstPromptAt: "2026-05-25T20:25:57.422Z",
    completedAt: "2026-05-25T21:05:00.000Z",
    relevantUrls: [
      "https://bumpgrade.com/playground",
      "https://bumpgrade.com/playground/source-data",
      "https://bumpgrade.com/admin/work-log",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-anonymous-playground-claimed-drafts",
    title: "Turned claimed playgrounds into private launch drafts",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-anonymous-playground-claimed-drafts",
    promptFromMark:
      "Owner asked for users to play with Bumpgrade without paying, keep logged-out progress, and preserve that work when they later sign up.",
    githubIssues: [{ number: 466, url: "https://github.com/markitics/bumpgrade/issues/466" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/playground",
      "https://bumpgrade.com/playground/source-data",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/account/source-data",
      "https://bumpgrade.com/pricing/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: ["docs/agent/agent-ready.md", "docs/features/publisher-tenants.md", "public/llms.txt"],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run db:migrate:local",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g anonymous playground source data and API persist browser-scoped draft state|verified publisher can claim anonymous playground into Free Build draft|admin user journeys source data exposes launch proof summary|public launch pages avoid internal build language",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g publisher account source data exposes paid subdomain setup contract",
      "git diff --check",
    ],
    flagsAttention:
      "Claimed playgrounds now create private launch draft records after verified account context; public publishing, checkout, subscriber sends, domains, fulfillment, and billing mutation remain gated.",
    firstPromptAt: "2026-05-25T16:40:00.000Z",
    completedAt: "2026-05-25T16:55:00.000Z",
    relevantUrls: [
      "https://github.com/markitics/bumpgrade/issues/466",
      "https://bumpgrade.com/playground",
      "https://bumpgrade.com/playground/source-data",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/pr-screenshots/issue-466-playground-claim-draft.jpg",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-signed-in-free-build-workspace",
    title: "Added signed-in Free Build workspace creation",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-signed-in-free-build-workspace",
    promptFromMark:
      "Owner asked for users to play with Bumpgrade without paying and keep their work before going live.",
    githubIssues: [
      { number: 466, url: "https://github.com/markitics/bumpgrade/issues/466" },
      { number: 473, url: "https://github.com/markitics/bumpgrade/issues/473" },
    ],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/account/setup",
      "https://bumpgrade.com/account/source-data",
      "https://bumpgrade.com/pricing/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: ["docs/features/publisher-tenants.md", "public/llms.txt"],
    validation: [
      "Focused Playwright covers signed-in Free Build workspace creation, idempotent replay, and paid domain gate preservation.",
      "Source-data smoke covers /account/source-data Free Build policy.",
    ],
    flagsAttention:
      "Signed-in Free Build workspace creation is live in this slice; the browser-scoped playground recovery is tracked on the parent #466 journey.",
    firstPromptAt: "2026-05-25T12:40:00.000Z",
    completedAt: "2026-05-25T12:55:00.000Z",
    relevantUrls: [
      "https://github.com/markitics/bumpgrade/issues/473",
      "https://bumpgrade.com/account/setup",
      "https://bumpgrade.com/account/source-data",
      "https://bumpgrade.com/pricing/source-data",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-free-build-before-go-live",
    title: "Added Free Build pricing policy and go-live gates",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-free-build-before-go-live",
    promptFromMark:
      "Owner asked for Bumpgrade to make it clear publishers should be able to build before paying and only pay when ready to go live.",
    githubIssues: [{ number: 466, url: "https://github.com/markitics/bumpgrade/issues/466" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/pricing",
      "https://bumpgrade.com/pricing/source-data",
      "https://bumpgrade.com/content/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: ["public/llms.txt"],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run db:migrate:local",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g pricing/source-data/content/commerce/agent/public-copy focus",
      "Pricing screenshots captured under docs/pr-screenshots and public/pr-screenshots.",
      "git diff --check",
    ],
    flagsAttention:
      "This was the policy and source-data slice. Later #466 work covers browser-scoped playground recovery, and issue #473 covers signed-in Free Build workspace creation.",
    firstPromptAt: "2026-05-25T12:00:00.000Z",
    completedAt: "2026-05-25T12:35:00.000Z",
    relevantUrls: [
      "https://github.com/markitics/bumpgrade/issues/466",
      "https://bumpgrade.com/pricing",
      "https://bumpgrade.com/pricing/source-data",
      "https://bumpgrade.com/content/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-public-copy-cleanup",
    title: "Cleaned public copy and source-data note phrasing",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-public-copy-cleanup",
    promptFromMark:
      "Owner requested that public/product surfaces stop reading like private notes, placeholders, or implementation commentary while preserving honest agent-readable contracts.",
    githubIssues: [{ number: 468, url: "https://github.com/markitics/bumpgrade/issues/468" }],
    closedPrs: [{ number: 470, url: "https://github.com/markitics/bumpgrade/pull/470" }],
    featuresUpdated: [
      "https://bumpgrade.com/features/source-data",
      "https://bumpgrade.com/content/source-data",
      "https://bumpgrade.com/roadmap/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: ["docs/agent/admin-surfaces.md"],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run db:migrate:local",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"public and agent-readable source-data avoids placeholder and private-note phrasing\"",
      "GitHub Actions main CI run 26398324984 passed static checks and browser journeys",
      "Live smoke passed for /roadmap, /agent-docs/bumpgrade-admin-surfaces, public/admin source-data routes, and issue #468 screenshot assets",
      "git diff --check",
    ],
    flagsAttention: null,
    firstPromptAt: "2026-05-25T10:51:00.000Z",
    completedAt: "2026-05-25T11:41:00.000Z",
    relevantUrls: [
      "https://github.com/markitics/bumpgrade/issues/468",
      "https://github.com/markitics/bumpgrade/pull/470",
      "https://bumpgrade.com/features/source-data",
      "https://bumpgrade.com/content/source-data",
      "https://bumpgrade.com/roadmap/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
      "https://bumpgrade.com/admin/source-data",
      "https://bumpgrade.com/pr-screenshots/issue-468-roadmap-copy-cleanup.png",
      "https://bumpgrade.com/pr-screenshots/issue-468-admin-agent-docs-copy-cleanup.png",
    ],
    prCommentUrl: "https://github.com/markitics/bumpgrade/pull/470",
  },
  {
    id: "work-log-2026-05-25-agent-funnel-archived-purge",
    title: "Added owner-session agent archived draft purge",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-agent-funnel-archived-purge",
    promptFromMark:
      "The Bumpgrade goal-runner continued issue #417 and promoted the existing archived-draft purge policy into the owner-session agent draft-write contract without opening another narrow issue.",
    githubIssues: [{ number: 417, url: "https://github.com/markitics/bumpgrade/issues/417" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/features/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
      "https://bumpgrade.com/api/agent/funnels/draft-writes",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys", "https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: [
      "docs/features/funnels.md",
      "docs/agent/agent-ready.md",
      "public/llms.txt",
      "src/lib/agent-manifest.ts",
    ],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run db:migrate:local",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"agent funnel draft write endpoint records owner-session private edits|funnel source data exposes\"",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"agent docs source data exposes|agent manifest|admin source data exposes|admin user journeys source data exposes\"",
      "git diff --check",
    ],
    flagsAttention:
      "This moves direct agent archived-draft purge from planned to live for owner-session agents only. It still requires exact confirmation, idempotency, current archived revision, audit correlation, and tombstone evidence, and it does not delete audit rows, product assets, R2 objects, buyer records, billing state, non-archived drafts, or bulk rows.",
    firstPromptAt: "2026-05-25T10:18:00.000Z",
    completedAt: "2026-05-25T10:29:32.000Z",
    relevantUrls: [
      "https://github.com/markitics/bumpgrade/issues/417",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
      "https://bumpgrade.com/api/agent/funnels/draft-writes",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-agent-funnel-visual-style-writes",
    title: "Added owner-session agent funnel visual style writes",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-agent-funnel-visual-style-writes",
    promptFromMark:
      "The Bumpgrade goal-runner continued issue #417 after deploying owner UI visual styles and promoted the same curated style preset write into the owner-session agent draft-write contract while fixing a signed-out JSON auth regression found during production smoke.",
    githubIssues: [{ number: 417, url: "https://github.com/markitics/bumpgrade/issues/417" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/features/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
      "https://bumpgrade.com/api/agent/funnels/draft-writes",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys", "https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: [
      "docs/features/funnels.md",
      "docs/agent/agent-ready.md",
      "public/llms.txt",
      "src/lib/agent-manifest.ts",
    ],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel draft endpoint rejects unauthenticated JSON writes before validation|funnel draft archive endpoint rejects unauthenticated writes|agent funnel draft write endpoint records owner-session private edits|agent funnel draft write endpoint requires owner session\"",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel source data exposes|agent docs source data exposes|agent manifest|admin source data exposes|admin user journeys source data exposes\"",
      "git diff --check",
    ],
    flagsAttention:
      "This moves direct agent visual style writes from planned to live for owner-session agents only. The write stores only curated style IDs, preserves block metadata, requires exact confirmation/idempotency/current revision/audit correlation, and still excludes arbitrary CSS, public unauthenticated writes, purge, delivery-token creation, billing, and fulfillment automation.",
    firstPromptAt: "2026-05-25T09:23:56.068Z",
    completedAt: "2026-05-25T09:54:00.000Z",
    relevantUrls: [
      "https://github.com/markitics/bumpgrade/issues/417",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
      "https://bumpgrade.com/api/agent/funnels/draft-writes",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-funnel-visual-style-controls",
    title: "Added owner-session funnel block visual styles",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-funnel-visual-style-controls",
    promptFromMark:
      "The Bumpgrade goal-runner continued issue #417 and chose the next owner-visible funnel parity slice: curated visual style controls that render in private and public funnel routes.",
    githubIssues: [{ number: 417, url: "https://github.com/markitics/bumpgrade/issues/417" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/admin/funnels",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/features/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys", "https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: [
      "docs/features/funnels.md",
      "docs/agent/agent-ready.md",
      "public/llms.txt",
      "docs/pr-screenshots/issue-417-funnel-visual-style-controls.png",
    ],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run db:migrate:local",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel source data exposes|allowlisted owner can sign in and open protected admin surfaces\"",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"admin source data exposes|admin user journeys source data exposes|agent docs source data exposes|agent manifest\"",
    ],
    flagsAttention:
      "This gives verified owners curated block-level visual styling without arbitrary CSS, script injection, full absolute-position canvas editing, live billing, live fulfillment automation, direct agent purge, or unauthenticated public writes.",
    firstPromptAt: "2026-05-25T08:53:56.606Z",
    completedAt: "2026-05-25T09:06:58.000Z",
    relevantUrls: [
      "https://github.com/markitics/bumpgrade/issues/417",
      "https://bumpgrade.com/admin/funnels",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-agent-funnel-block-structure-writes",
    title: "Added owner-session agent funnel block add/remove",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-agent-funnel-block-structure-writes",
    promptFromMark:
      "The Bumpgrade goal-runner continued issue #417 and narrowed the next funnel parity slice to owner-session direct agent add/remove operations for reusable private draft blocks.",
    githubIssues: [{ number: 417, url: "https://github.com/markitics/bumpgrade/issues/417" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/admin/funnels",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/features/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys", "https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: [
      "docs/features/funnels.md",
      "docs/agent/agent-ready.md",
      "public/llms.txt",
      "docs/pr-screenshots/issue-417-agent-block-add-remove.png",
    ],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run db:migrate:local",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel source data exposes|agent funnel draft write endpoint\"",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"admin source data exposes|admin user journeys source data exposes|agent docs source data exposes|agent manifest\"",
    ],
    flagsAttention:
      "This extends the owner-session agent write contract to reusable block add/remove while keeping removals fail-closed for checkout-linked blocks and last-block-per-step cases. It still excludes unauthenticated public agent writes, direct agent purge, direct agent-created delivery tokens, signed URLs, live billing, live fulfillment automation, and provider-side webinar automation.",
    firstPromptAt: "2026-05-24T01:37:20.997Z",
    completedAt: "2026-05-25T08:25:16.000Z",
    relevantUrls: [
      "https://github.com/markitics/bumpgrade/issues/417",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-agent-funnel-public-publishing",
    title: "Added owner-session agent funnel publishing",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-agent-funnel-publishing",
    promptFromMark:
      "The Bumpgrade goal-runner continued issue #417 and narrowed the next broad funnel parity slice to owner-session direct agent public publishing with rollback notes.",
    githubIssues: [{ number: 417, url: "https://github.com/markitics/bumpgrade/issues/417" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/admin/funnels",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/features/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys", "https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: [
      "docs/features/funnels.md",
      "docs/agent/agent-ready.md",
      "public/llms.txt",
      "docs/pr-screenshots/issue-417-agent-funnel-publishing.png",
    ],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run db:migrate:local",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel source data exposes|agent funnel draft write endpoint\"",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"admin source data exposes|admin user journeys source data exposes|agent docs source data exposes|agent manifest\"",
    ],
    flagsAttention:
      "This adds owner-confirmed direct agent publishing as a public route mutation with archive-draft rollback and no billing mutation. It still excludes unauthenticated public agent writes, purge, direct block add/remove, signed URLs, live billing, live fulfillment automation, and provider-side webinar automation.",
    firstPromptAt: "2026-05-24T01:37:20.997Z",
    completedAt: "2026-05-25T08:00:34.000Z",
    relevantUrls: [
      "https://github.com/markitics/bumpgrade/issues/417",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-25-agent-funnel-editor-operations",
    title: "Expanded agent-safe funnel editor operations",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-agent-funnel-editor-operations",
    promptFromMark:
      "The Bumpgrade goal-runner continued issue #417 and narrowed the next agent-safe funnel parity slice to owner-session checkout linking/unlinking and block placement operations.",
    githubIssues: [{ number: 417, url: "https://github.com/markitics/bumpgrade/issues/417" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/admin/funnels",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/features/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys", "https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: [
      "docs/features/funnels.md",
      "docs/agent/agent-ready.md",
      "public/llms.txt",
      "docs/pr-screenshots/issue-417-agent-funnel-editor-operations.png",
    ],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"funnel source data exposes|agent funnel draft write endpoint\"",
      "npx playwright test tests/smoke.spec.ts --project=chromium -g \"admin source data exposes|admin user journeys source data exposes|agent docs source data exposes|agent manifest\"",
    ],
    flagsAttention:
      "This keeps the writes private and owner-session confirmed. It adds direct agent-safe checkout link/unlink and block movement, but still excludes direct public publishing, purge, block add/remove, signed URLs, live billing, live fulfillment automation, and unauthenticated public agent writes.",
    firstPromptAt: "2026-05-24T01:37:20.997Z",
    completedAt: "2026-05-25T06:26:00.000Z",
    relevantUrls: [
      "https://github.com/markitics/bumpgrade/issues/417",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-24-funnel-archived-draft-purge",
    title: "Added owner-confirmed archived draft purge",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-archived-draft-purge",
    promptFromMark:
      "The Bumpgrade goal-runner continued the advanced funnel parity slice and focused on a narrow owner-confirmed cleanup path for already archived draft funnels.",
    githubIssues: [{ number: 417, url: "https://github.com/markitics/bumpgrade/issues/417" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/admin/funnels",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/features/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys", "https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: [
      "docs/features/funnels.md",
      "docs/agent/agent-ready.md",
      "public/llms.txt",
      "docs/pr-screenshots/issue-417-archived-draft-purge.png",
    ],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run db:migrate:local",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium --grep \"funnel source data exposes|funnel draft archive endpoint rejects unauthenticated writes|funnel draft purge endpoint rejects unauthenticated writes|funnel webinar event link endpoint rejects unauthenticated writes|allowlisted owner can sign in and open protected admin surfaces\"",
    ],
    flagsAttention:
      "This purge is intentionally narrow: archived draft and step rows only, with a tombstone first. Direct agent purge, non-archived purge, bulk purge, audit deletion, product assets, R2 objects, buyer records, and billing state remain out of scope.",
    firstPromptAt: "2026-05-24T01:37:20.997Z",
    completedAt: "2026-05-24T21:23:15.000Z",
    relevantUrls: [
      "https://bumpgrade.com/pr-screenshots/issue-417-archived-draft-purge.png",
      "https://github.com/markitics/bumpgrade/issues/417",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-24-funnel-webinar-event-links",
    title: "Added owner-confirmed webinar event links to draft funnels",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-webinar-event-links",
    promptFromMark:
      "The Bumpgrade goal-runner continued the advanced funnel parity slice and focused on owner-confirmed webinar registration/replay links without expanding into live webinar integrations.",
    githubIssues: [{ number: 417, url: "https://github.com/markitics/bumpgrade/issues/417" }],
    closedPrs: [],
    featuresUpdated: [
      "https://bumpgrade.com/admin/funnels",
      "https://bumpgrade.com/funnels/source-data",
      "https://bumpgrade.com/features/source-data",
      "https://bumpgrade.com/agent-docs/source-data",
    ],
    roadmapUpdated: ["https://bumpgrade.com/admin/roadmap", "https://bumpgrade.com/roadmap/source-data"],
    userJourneysUpdated: ["https://bumpgrade.com/admin/user-journeys", "https://bumpgrade.com/admin/user-journeys/source-data"],
    documentationUpdated: [
      "docs/features/funnels.md",
      "docs/agent/agent-ready.md",
      "public/llms.txt",
      "docs/pr-screenshots/issue-417-webinar-event-links.png",
    ],
    validation: [
      "npm run typecheck",
      "npm run lint",
      "npm run test:runtime-secrets",
      "npm run db:migrate:local",
      "npm run cf:build",
      "npx playwright test tests/smoke.spec.ts --project=chromium --grep \"funnel source data exposes|funnel draft archive endpoint rejects unauthenticated writes|funnel webinar event link endpoint rejects unauthenticated writes|allowlisted owner can sign in and open protected admin surfaces\"",
    ],
    flagsAttention:
      "This links external webinar registration and replay URLs only; live scheduling, reminders, attendance tracking, replay hosting, provider secrets, attendee records, direct agent writes, and live billing remain blocked follow-ups.",
    firstPromptAt: "2026-05-24T01:37:20.997Z",
    completedAt: "2026-05-24T20:33:36.000Z",
    relevantUrls: [
      "https://bumpgrade.com/pr-screenshots/issue-417-webinar-event-links.png",
      "https://github.com/markitics/bumpgrade/issues/417",
    ],
    prCommentUrl: null,
  },
  {
    id: "work-log-2026-05-20-launch-marketing-readiness",
    title: "Prepared launch marketing and journey proof surfaces",
    agentName: "Codex",
    agentKind: "codex",
    sessionName: "bumpgrade-launch-readiness",
    promptFromMark:
      "Owner requested that the public homepage, features, feature detail pages, pricing, and user-journey proof feel ready before inviting people to try Bumpgrade.",
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
      "Publisher-offer checkout remains sandbox-only; Bumpgrade account-plan checkout now has a self-serve Stripe path.",
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
    promptFromMark: "Owner requested a public roadmap inspired by the main feature set and for admin surfaces to stay current.",
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
    primaryUser: "Publisher evaluating Bumpgrade",
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
      "Open /pricing to understand self-serve plans and payment options.",
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
    id: "journey-prospect-imports-from-clickfunnels",
    title: "Prospect creates a competitor import plan",
    featureId: "feature-competitor-importers",
    featureStatus: "live",
    issueNumbers: [5, 14, 15, 17, 467],
    primaryUser: "Publisher moving a launch from ClickFunnels or another familiar platform",
    userGoal:
      "Understand what Bumpgrade can bring into a private workspace before public publishing, checkout, subscriber sends, domains, or fulfillment go live.",
    sourceEvidence: [
      "https://bumpgrade.com/imports",
      "https://bumpgrade.com/imports/clickfunnels",
      "https://bumpgrade.com/imports/source-data",
      "https://bumpgrade.com/compare/source-data",
      "https://github.com/markitics/bumpgrade/issues/467",
    ],
    happyPath: [
      "Open /imports.",
      "Choose the current platform.",
      "Review the platform-specific source guide for the URLs, exports, files, and notes Bumpgrade can use.",
      "Add the strongest public URL, page copy, offer notes, and follow-up notes.",
      "Review the redacted import map before sign-in or private draft creation.",
      "Sign in or create a verified publisher account.",
      "Confirm the private importer action.",
      "Bumpgrade creates or reuses a Free Build workspace and saves a private import plan.",
      "Archive a private importer draft when the source map was wrong, then start a fresh import from the same source.",
      "Use /imports/source-data when an agent needs stable importer IDs, input kinds, platform-specific source checklists, saved private plan parts, safety gates, limitations, source IDs, private import API routes, and rollback routes.",
    ],
    edgeCases: [
      "Imported material starts in a private workspace and is not buyer-facing by default.",
      "The public review map does not create records or echo pasted source material, export file names, customer rows, private emails, payment credentials, API keys, or session cookies.",
      "Platform-specific source guides explain useful material to bring, but they are not account-to-account transfer, credential use, or permission to scrape private platform data.",
      "Private import APIs require a verified publisher session, exact confirmation, idempotency, and redacted responses.",
      "Rollback APIs require the same verified publisher, the current draft revision, exact confirmation, and idempotency; they archive only private importer plans and preserve saved plan content, steps, and audit history.",
      "The response does not echo pasted source material, raw exports, customer rows, private emails, payment credentials, API keys, or session cookies.",
      "Account-to-account transfer, customer password transfer, payment credential migration, subscriber sends, live checkout, public publishing, domains, and fulfillment remain follow-up work.",
      "Competitor source facts should still be refreshed before making volatile pricing, packaging, or feature claims.",
    ],
    agentAccess:
      "Agents can read /imports/source-data, /compare/source-data, and /features/source-data to answer importer questions with platform IDs, input kinds, platform-specific source checklists, redacted preflight review routes, duplicate-review fields, saved private plan parts, rollback routes, safety gates, source IDs, limitations, and private import API routes. Creating or archiving a private import plan requires verified publisher auth, exact confirmation, idempotency, audit evidence, and redacted responses; public or billing-impacting import writes remain unavailable.",
    validation: [
      "Issue #467 adds /imports, dedicated importer source guides, /imports/clickfunnels, /imports/source-data, public redacted preflight review, sitemap and llms discovery, feature and comparison source-data references, and importer smoke coverage.",
      "Private importer APIs create or reuse a Free Build workspace and save a private import plan with no public publishing, live checkout, subscriber sends, domains, fulfillment, account transfer, payment credential migration, or customer password migration.",
      "Private importer rollback APIs archive importer-created private plans, preserve saved plan content, steps, and audit history, and let the same source restart as a fresh private plan.",
      "Importer source-data and API responses keep raw exports, customer rows, private emails, payment credentials, API keys, session cookies, and pasted source material out of public responses.",
    ],
    proof: createJourneyProof("journey-prospect-imports-from-clickfunnels", "feature-competitor-importers"),
    sortOrder: 9,
    updatedAt: null,
  },
  {
    id: "journey-read-public-roadmap-source-data",
    title: "Read public roadmap source data",
    featureId: "feature-public-roadmap",
    featureStatus: "live",
    issueNumbers: [7, 8],
    primaryUser: "Agent resuming Bumpgrade work",
    userGoal: "Recover shipped, active, blocked, next, and planned state without reading chat history.",
    sourceEvidence: ["https://bumpgrade.com/roadmap/source-data", "https://github.com/markitics/bumpgrade/pull/27"],
    happyPath: ["Fetch /roadmap/source-data.", "Find item IDs, statuses, issue links, evidence, and owner-attention caveats.", "Continue the next issue without inventing state."],
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
    primaryUser: "Bumpgrade owner",
    userGoal: "Sign in with a Bumpgrade owner account before viewing private admin roadmap, work-log, user-journey, or owner-attention pages.",
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
      "Open /pricing to read current Experiment, Grow, Enterprise, and White glove setup options.",
      "Fetch /content/source-data to cite stable IDs, issue numbers, evidence routes, and agent boundaries.",
    ],
    edgeCases: [
      "Future limits, trials, and usage-meter rates need source-data updates before agents cite them as current.",
      "Migration guides and launch playbooks are planned until the related funnel, checkout, automation, and analytics issues ship.",
      "Agents must not treat content copy as permission to perform public, billing-impacting, or creator-speech writes.",
    ],
    agentAccess:
      "Agents can read /content/source-data for audience, resource, and pricing records. Public copy changes still need source evidence, issue links, or shipped-product proof.",
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
    issueNumbers: [20, 46, 217, 222, 223, 225, 226, 234, 466],
    primaryUser: "Publisher ready to start a Bumpgrade workspace",
    userGoal:
      "Understand Free Build, Experiment, Grow, Enterprise, White glove setup, and live payment handling before starting or upgrading the account plan.",
    sourceEvidence: [
      "https://bumpgrade.com/pricing",
      "https://bumpgrade.com/pricing/source-data",
      "https://bumpgrade.com/commerce/source-data",
      "https://github.com/markitics/bumpgrade/issues/46",
      "https://github.com/markitics/bumpgrade/issues/217",
      "https://github.com/markitics/bumpgrade/issues/466",
    ],
    happyPath: [
      "Open /pricing.",
      "Review the build-first message and paid go-live gates.",
      "Compare Experiment, Grow, Enterprise, and the optional White glove setup add-on.",
      "Submit Experiment or Grow to start Stripe Checkout for the Bumpgrade account plan.",
      "Return from Stripe to /pricing/success and continue to account setup with the same email.",
    ],
    edgeCases: [
      "Free Build supports browser-scoped playground recovery and signed-in private workspace creation before paid go-live.",
      "Enterprise is a contact path, not self-serve checkout.",
      "/pricing-v2 is an alternate usage-based draft and is not the default pricing model.",
      "Successful Checkout Sessions are verified server-side before a publisher plan entitlement is activated.",
      "Bumpgrade connects domains customers already own; it does not sell, register, renew, transfer, or price domains today.",
    ],
    agentAccess:
      "Agents can read /pricing, /pricing/source-data, and /content/source-data, but billing-impacting recommendations must cite /commerce/source-data and current Stripe proof.",
    validation: [
      "Issue #217 rewrites pricing as launch-facing copy.",
      "Issue #225 clarifies the domain purchase policy.",
      "Issue #226 refreshes launch signup and pricing copy for paid domain readiness.",
      "Issue #234 refreshes pricing user-journey proof with the latest PR #233 CI and issue #226 screenshot links.",
      "Issue #316 adds live self-serve Bumpgrade plan checkout, success verification, and seeded product/price records.",
      "Issue #466 adds the Free Build policy source data and paid go-live gate evidence.",
    ],
    proof: createJourneyProof("journey-prospect-reviews-launch-pricing", "feature-resources-use-cases-pricing"),
    sortOrder: 43,
    updatedAt: null,
  },
  {
    id: "journey-prospect-saves-anonymous-playground",
    title: "Prospect saves a logged-out launch playground",
    featureId: "feature-resources-use-cases-pricing",
    featureStatus: "live",
    issueNumbers: [466],
    primaryUser: "Publisher exploring Bumpgrade before signup",
    userGoal:
      "Try the product, save launch context in this browser, return later, and attach the work to a Free Build account without paying first.",
    sourceEvidence: [
      "https://bumpgrade.com/playground",
      "https://bumpgrade.com/playground/source-data",
      "https://bumpgrade.com/pricing/source-data",
      "https://github.com/markitics/bumpgrade/issues/466",
    ],
    happyPath: [
      "Open /playground while logged out.",
      "Enter offer, audience, product, opt-in, checkout, delivery, follow-up, and migration starting-point details.",
      "Save the playground and refresh the page.",
      "Return from the same browser and see the saved draft.",
      "Create or sign into a verified account and attach the playground to a private Free Build workspace, launch draft, and private offer/product/audience/importer-review records.",
      "Choose a paid go-live plan before public publishing, live checkout, sends, domains, or fulfillment.",
    ],
    edgeCases: [
      "Recovery depends on the browser cookie remaining available.",
      "The cookie stores a recovery token only; D1 stores its hash, not the raw cookie value.",
      "Anonymous playground rows expire after 30 days unless extended by later saves; owner cleanup marks expired recovery, clears anonymous draft fields, and replaces the recovery token hash.",
      "Playground saves do not create billing state, public domains, buyer routes, subscriber sends, or product access.",
      "Attaching to an account creates or reuses a private Free Build workspace, maps structured playground fields into an idempotent private funnel draft plus private claim records, and keeps paid go-live gates intact.",
    ],
    agentAccess:
      "Agents can read /playground/source-data for the anonymous playground contract. Saving structured playground state is browser-scoped and redacted; cleanup requires an owner session and exact confirmation; attaching it requires authenticated, email-verified publisher context, creates private draft and claim records, and still does not authorize public or billing-impacting actions.",
    validation: [
      "Playwright covers logged-out save, recovery-cookie persistence across refresh, source-data redaction, unauthenticated claim rejection, owner cleanup rejection, verified-account claim, private draft and claim-record creation, idempotent claim replay, and paid go-live gate preservation.",
      "/pricing/source-data and /account/source-data distinguish anonymous playground, signed-in Free Build, and paid go-live actions.",
    ],
    proof: createJourneyProof("journey-prospect-saves-anonymous-playground", "feature-resources-use-cases-pricing"),
    sortOrder: 41,
    updatedAt: null,
  },
  {
    id: "journey-prospect-understands-free-build",
    title: "Prospect understands Free Build before going live",
    featureId: "feature-resources-use-cases-pricing",
    featureStatus: "live",
    issueNumbers: [20, 316, 466],
    primaryUser: "Publisher who wants to start building before paying",
    userGoal:
      "See that Bumpgrade can be shaped before payment while public publishing, live checkout, subscriber sends, domains, and fulfillment stay gated until go-live.",
    sourceEvidence: [
      "https://bumpgrade.com/pricing",
      "https://bumpgrade.com/pricing/source-data",
      "https://github.com/markitics/bumpgrade/issues/466",
    ],
    happyPath: [
      "Open /pricing.",
      "Read the build-first explanation.",
      "Open /playground to save launch context before signup.",
      "Review what can be assembled privately before payment.",
      "Review which buyer-facing actions require a paid or approved go-live state.",
      "Use /pricing/source-data when an agent needs stable IDs for the same policy.",
    ],
    edgeCases: [
      "Logged-out playground recovery is browser-scoped and depends on the recovery cookie still being present.",
      "Signed-in Free Build workspace creation is covered by /account/setup and /account/source-data.",
      "Buyer-facing publishing, live checkout, email sends, domains, and fulfillment remain gated.",
      "Anonymous playground state can attach to a verified account and become a private launch draft plus private claim records, but it still does not create public buyer-facing state.",
    ],
    agentAccess:
      "Agents can read /pricing/source-data and /playground/source-data for Free Build capability IDs, anonymous playground routes, paid go-live gate IDs, and redaction boundaries.",
    validation: [
      "Pricing route smoke confirms the public copy avoids internal implementation language.",
      "/pricing/source-data exposes Free Build capability records and paid go-live gate records.",
      "/playground and /playground/source-data expose logged-out browser recovery as live.",
      "/account/source-data exposes signed-in Free Build workspace creation as live.",
      "/content/source-data and /agent-docs/source-data include the pricing policy as agent-readable evidence.",
    ],
    proof: createJourneyProof("journey-prospect-understands-free-build", "feature-resources-use-cases-pricing"),
    sortOrder: 42,
    updatedAt: null,
  },
  {
    id: "journey-publisher-creates-free-build-workspace",
    title: "Publisher creates a private Free Build workspace",
    featureId: "feature-better-auth",
    featureStatus: "live",
    issueNumbers: [9, 221, 466, 473],
    primaryUser: "Verified publisher who wants to start setup before paying",
    userGoal:
      "Create a private Bumpgrade workspace before payment and return later without unlocking public buyer-facing actions.",
    sourceEvidence: [
      "https://bumpgrade.com/account/setup",
      "https://bumpgrade.com/account/source-data",
      "https://bumpgrade.com/pricing/source-data",
      "https://github.com/markitics/bumpgrade/issues/466",
      "https://github.com/markitics/bumpgrade/issues/473",
    ],
    happyPath: [
      "Create or sign into a Bumpgrade publisher account.",
      "Confirm the account email.",
      "Open /account/setup.",
      "Create the private Free Build workspace.",
      "Return to /account/setup and see that Free Build is active.",
      "Choose a paid go-live plan before reserving domains or enabling public buyer-facing actions.",
    ],
    edgeCases: [
      "Signed-out users must sign in first.",
      "Unverified users must confirm email first.",
      "Idempotent replays return the same workspace.",
      "Free Build workspaces cannot reserve Bumpgrade subdomains or add custom domains until a paid plan is active.",
      "Logged-out anonymous browser recovery is covered by the separate playground journey.",
    ],
    agentAccess:
      "Agents can read /account/source-data for the signed-in Free Build contract, but creating workspaces requires authenticated publisher context, explicit confirmation, idempotency, and redacted audit evidence.",
    validation: [
      "Playwright covers verified signed-in Free Build creation, idempotent replay, paid subdomain gate preservation, paid custom-domain gate preservation, and /account/setup state.",
      "/account/source-data exposes signed-in Free Build and anonymous playground recovery as live with separate auth and browser boundaries.",
    ],
    proof: createJourneyProof("journey-publisher-creates-free-build-workspace", "feature-better-auth"),
    sortOrder: 43,
    updatedAt: null,
  },
  {
    id: "journey-publisher-reserves-bumpgrade-subdomain",
    title: "Publisher reserves a paid Bumpgrade subdomain",
    featureId: "feature-better-auth",
    featureStatus: "live",
    issueNumbers: [9, 221, 222],
    primaryUser: "Publisher who has activated a paid plan",
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
      "Activate a paid plan entitlement.",
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
      "Activate a paid plan entitlement.",
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
    featureStatus: "live",
    issueNumbers: [14, 79, 159, 161, 163, 165, 213, 215, 341, 409, 417],
    primaryUser: "Publisher or agent planning the first funnel",
    userGoal:
      "Inspect an ordered opt-in, sales, and thank-you funnel plus reusable templates, webinar/resource page shapes, block records, owner-session draft duplication capability, owner-session checkout-link capability, owner-session resource delivery link capability, public funnel resource delivery token capability, owner-session webinar event link capability, owner-session visual block style capability, owner-session archived-draft purge capability, owner-session block reorder capability, owner-session cross-step block move capability, owner-session direct agent public publishing capability, owner-session archive/unpublish lifecycle capability, and public linked-checkout start capability before full absolute-position canvas editing or direct agent template creation exists.",
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
      "https://github.com/markitics/bumpgrade/issues/341",
      "https://github.com/markitics/bumpgrade/issues/409",
      "https://github.com/markitics/bumpgrade/issues/417",
    ],
    happyPath: [
      "Fetch /funnels/source-data.",
      "Find the seeded draft funnel, revision ID, ordered step IDs, block IDs, preview route, private draft duplication capability, archive/unpublish capability, archived-draft purge capability, public checkout-start capability, and write boundary.",
      "Inspect reusable funnel templates and block-template records, including webinar/resource templates, owner-session draftCreation, and block write boundaries.",
      "Inspect resource delivery link capability metadata so product/access assets are distinguishable from arbitrary private delivery.",
      "Inspect public funnel resource delivery token metadata so scoped private download-token delivery is distinguishable from arbitrary uploaded asset delivery.",
      "Inspect webinar event link capability metadata so external registration/replay references are distinguishable from scheduling, reminders, attendance tracking, and replay hosting.",
      "Inspect visual block style capability metadata so curated owner-session presentation presets are distinguishable from arbitrary CSS or absolute-position canvas editing.",
      "Inspect block reorder and cross-step move capability metadata so owner-session block positioning and drag/drop placement are distinguishable from full absolute-position canvas editing.",
      "Open /funnels/indie-launch-sandbox to inspect semantic preview sections.",
      "Use the write boundary to avoid claiming live billing, non-archived purge, bulk purge, direct agent-created delivery tokens, unauthenticated public agent publishing, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, arbitrary CSS, full absolute-position canvas editing, or broad direct agent-write capability beyond the owner-session draft write API.",
    ],
    edgeCases: [
      "The seeded funnel is read-only and not an authenticated builder UI.",
      "Owner-session template-to-draft creation, private draft duplication, granular block copy editing, curated visual block styling, reusable block add/remove, within-step block reordering, drag/drop block placement through the same move endpoints, cross-step block moves, checkout-offer linking, checkout unlinking, resource delivery linking, webinar event/replay linking, archive/unpublish lifecycle actions, and archived-draft purge are available from /admin/funnels, and published linked checkout blocks can render the existing sandbox checkout start surface. Owner-session agents can also call /api/agent/funnels/draft-writes for private block copy edits, curated visual style presets, reusable block add/remove, checkout-offer linking, checkout unlinking, resource-delivery linking, webinar-event linking, block reordering, cross-step block moves, private draft duplication, public publishing, archive/unpublish, and archived-draft purge after exact confirmation, idempotency, current revision checks, and audit correlation. Published linked resource blocks can mint scoped Bumpgrade download routes only when checkout intent and entitlement scope match the linked product and file asset. Block copy edits and style updates preserve IDs, kinds, checkout-link metadata, resource-link metadata, and webinar-link metadata. Direct agent block style writes store only curated style IDs and never accept arbitrary CSS. Direct agent block add/remove uses the reusable block library, refuses checkout-linked removals, and keeps at least one block per step. Direct agent checkout, resource-delivery, webinar-event, block-style, and block-placement writes preserve existing block identity and do not create new public routes; direct agent publishing is the only owner-session agent funnel operation in this set that creates a public route binding, and it does not mutate billing. Direct agent archived-draft purge records tombstone evidence before deleting already archived draft and step rows, without deleting prior audit rows, product assets, R2 objects, buyer records, or billing state. Block reordering preserves step membership and checkout/resource/webinar metadata. Cross-step block moves preserve block metadata while changing step membership and refuse to empty the source step. Block removal refuses checkout-linked blocks until the dedicated unlink action clears checkout metadata. Duplicates stay private and strip checkout-link/resource-link/webinar-link metadata. Archived-draft purge records tombstone evidence before deleting draft and step rows, without deleting prior audit rows, product assets, R2 objects, buyer records, or billing state. Webinar/resource templates do not schedule webinars, track attendance, host replays, deliver arbitrary uploaded private files, create signed URLs, automate fulfillment, or grant entitlements. Non-archived purge, bulk purge, live billing, full absolute-position canvas editing, direct agent-created delivery tokens, unauthenticated public agent publishing, and broader direct agent edits require future confirmed-write APIs.",
      "Generated copy remains draft until a publisher confirms it.",
    ],
    agentAccess:
      "Agents can read /funnels/source-data, reusable template and block-template records, webinar/resource page-shape records, draft duplication capability metadata, granular block-edit capability metadata, visual block style capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, the seeded preview route, and published D1 funnel routes. Owner-session template-to-draft creation, private draft duplication, block copy editing, curated visual block styling, reusable block add/remove, within-step block reordering, cross-step block moves, checkout-offer linking, resource delivery linking, webinar event/replay linking, public publishing, archive/unpublish actions, and archived-draft purge require owner auth, idempotency, and stale-state checks; public funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published resource block; direct agent writes including archived-draft purge require actor identity, confirmation, idempotency, stale-state checks, audit correlation, redaction, and rollback notes.",
    validation: [
      "Playwright covers /funnels/source-data, /funnels/indie-launch-sandbox template and block library rendering, sitemap discovery, and agent manifest read-contract discovery.",
      "Issue #79 records the first funnel source-data contract and preview scaffold.",
      "Issue #159 records the first reusable template and block-template library contract.",
      "Issue #161 records owner-confirmed template-to-draft creation.",
      "Issue #163 records owner-confirmed checkout-offer linking on private draft steps.",
      "Issue #165 records public sandbox checkout start rendering on published linked checkout blocks.",
      "Issue #213 records webinar/resource template and block contracts.",
      "Issue #215 records owner-confirmed private draft duplication.",
      "Issue #341 records owner-confirmed archive/unpublish lifecycle actions.",
      "Issue #430 records owner-session granular draft block title/body editing.",
      "Issue #432 records owner-session reusable block add/remove controls with checkout-linked block protection.",
      "Issue #409 records owner-created product delivery-gate links for the seeded offer/funnel path.",
      "Issue #417 records owner-confirmed checkout unlinking, owner-confirmed resource delivery links, funnel-scoped private delivery tokens, owner-confirmed webinar event/replay links, owner-confirmed archived-draft purge, owner-session visual style controls, owner-session within-step block reordering, owner-session drag/drop block placement, owner-session cross-step block moves, owner-session direct agent public publishing, and the remaining advanced funnel parity follow-up after MVP closeout.",
    ],
    sortOrder: 46,
    updatedAt: null,
  },
  {
    id: "journey-owner-seeds-editable-draft-funnel",
    title: "Owner seeds, edits, previews, publishes, and archives a draft funnel",
    featureId: "feature-funnel-builder",
    featureStatus: "live",
    issueNumbers: [14, 79, 91, 93, 95, 135, 159, 161, 163, 165, 213, 215, 341, 409, 417, 430, 432],
    primaryUser: "Publisher or owner preparing the first launch funnel",
    userGoal: "Create, seed, template-start, or duplicate an owner-gated draft funnel, including webinar and resource page shapes, tune the ordered steps, individual block copy, and curated block visual styles, attach the seeded sandbox checkout offer to a checkout block, link resource/delivery blocks to product access assets, link webinar blocks to external registration/replay URLs, preview it privately, publish it to a public route that can start the linked sandbox checkout after exact confirmation, show entitlement-safe resource access, mint a scoped private download token for matching checkout entitlements, and show webinar access references, then archive or unpublish without deleting evidence and purge only already archived drafts after tombstone evidence exists.",
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
      "https://github.com/markitics/bumpgrade/issues/341",
      "https://github.com/markitics/bumpgrade/issues/409",
      "https://github.com/markitics/bumpgrade/issues/417",
      "https://github.com/markitics/bumpgrade/issues/430",
      "https://github.com/markitics/bumpgrade/issues/432",
    ],
    happyPath: [
      "Sign in with an allowlisted owner account.",
      "Open /admin/funnels.",
      "Seed the indie launch working draft, create a generic draft, or create a private draft from a reusable template after typing the exact template confirmation text.",
      "Create webinar registration/replay or resource-library private drafts from the reusable templates when those page shapes fit the offer.",
      "Duplicate an existing private draft after typing the exact duplicate confirmation text and using the current draft revision.",
      "Edit a step title, goal, or kind, then move a step up or down.",
      "Edit an existing block title/body with the current draft revision while preserving the block ID, kind, and any checkout-link metadata.",
      "Apply a curated visual style preset to an existing block with the current draft revision while preserving block identity, copy, and linked metadata.",
      "Drag or use the fallback controls to move an existing block within or across draft steps with the current draft revision while preserving block metadata.",
      "Attach the seeded sandbox checkout offer to a draft checkout block after typing the exact checkout-link confirmation text and using the current draft revision.",
      "Link a resource or delivery block to a product/access catalog asset after typing the exact resource-delivery confirmation text and using the current draft revision.",
      "Link a webinar block to external registration and optional replay URLs after typing the exact webinar-link confirmation text and using the current draft revision.",
      "Open the owner-gated preview route to confirm the private draft sequence reflects current D1 state.",
      "Type the exact publish confirmation text with the current revision and publish the draft.",
      "Open the public /funnels/{slug} route and confirm the published sequence is crawlable, the linked checkout block renders the sandbox checkout start panel, resource-linked blocks show entitlement-safe access references and the private delivery panel, and webinar-linked blocks show external registration/replay references.",
      "Submit a checkout intent and entitlement that match the linked resource block product/file asset, then confirm /api/funnels/resource-delivery returns a short-lived Bumpgrade download route without buyer data, R2 keys, or signed URLs.",
      "Type the exact archive confirmation text with the current revision and archive or unpublish the draft.",
      "Use /funnels/source-data to confirm archived drafts and unpublished public routes are excluded from published D1 funnel summaries.",
      "For an already archived draft that no longer needs owner workspace rows, type the exact purge confirmation text with the current archived revision and confirm a purge tombstone is recorded before draft and step rows disappear from /admin/funnels.",
    ],
    edgeCases: [
      "The admin draft builder is owner-gated and unpublished draft copy is not crawlable public content.",
      "Template-to-draft creation writes only private D1 draft rows and audit metadata; it does not publish.",
      "Draft duplication writes only a new private D1 draft, copies ordered steps and blocks, strips checkout-link, resource-link, and webinar-link metadata, and does not publish.",
      "Granular block editing changes existing block title/body copy only; it preserves block ID, kind, agent-editable flag, ordered step structure, checkout-link metadata, resource-link metadata, and webinar-link metadata.",
      "Visual style updates store only a curated style ID; they preserve block ID, kind, copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and audit evidence while rendering in private previews and public published routes.",
      "Within-step block reordering changes block order only; it preserves block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, webinar-link metadata, step membership, and audit evidence.",
      "The drag/drop UI reuses the same owner-session block reorder and cross-step move endpoint modes with fresh revision checks; it is not a separate direct-agent write surface.",
      "Cross-step block moves append an existing block to another step, refuse to empty the source step, and preserve block IDs, kinds, title/body copy, checkout-link metadata, resource-link metadata, webinar-link metadata, and audit evidence.",
      "Webinar event links store public-safe external URLs only; they do not create webinar provider state, reminder sequences, attendance tracking, replay hosting, provider secrets, private files, signed URLs, live fulfillment automation, or entitlements.",
      "Webinar/resource templates are page shapes only; they do not create webinar provider state, reminder sequences, replay hosting, private files, signed URLs, live fulfillment automation, or entitlements.",
      "Checkout-offer linking writes public-safe metadata into private draft step blocks and does not start a checkout session or enable live billing by itself.",
      "Resource delivery linking writes public-safe product, asset, entitlement-template, and safe route metadata into private draft step blocks. It does not expose private R2 keys, signed URLs, buyer records, raw checkout IDs, arbitrary uploaded asset delivery, live fulfillment automation, or direct agent writes.",
      "Published funnel resource delivery token creation requires a published linked resource block plus a matching checkout intent, entitlement, product, and file asset; mismatched entitlements are rejected and replayed download tokens are rejected by the existing product download stream.",
      "The public linked checkout start remains sandbox-only, exact-confirmed, idempotent, and constrained to the seeded offer stack.",
      "Publishing and archive/unpublish actions require exact confirmation and a fresh revision ID.",
      "Archiving changes status to archived, clears preview_route, and preserves draft, step, block, checkout-link, resource-link, webinar-link, and audit records; it does not physically delete data.",
      "Purging requires an archived draft, exact confirmation, a fresh archived revision ID, and an idempotency key; it records a purge tombstone before deleting draft and step rows and does not delete prior audit rows, product assets, R2 objects, buyer records, or billing state.",
      "Non-archived purge, bulk purge, full absolute-position canvas editing, live billing, direct agent-created delivery tokens, arbitrary uploaded private asset delivery, signed URLs, live fulfillment automation, live webinar scheduling, attendance tracking, replay hosting, unauthenticated public agent publishing, and broad direct agent writes beyond private block copy edits, visual style presets, reusable block add/remove, checkout linking/unlinking, block movement, resource-delivery linking, webinar-event linking, private duplication, public publishing, archive/unpublish, and archived-draft purge still require future confirmed-write APIs.",
      "/funnels/source-data lists published D1 funnels but does not expose raw owner session or unpublished or archived private draft data.",
    ],
    agentAccess:
      "Agents can read public /funnels/source-data, seeded funnel routes, reusable templates including webinar/resource page shapes, draft duplication capability metadata, block-edit capability metadata, block visual-style capability metadata, block add/remove capability metadata, block reorder capability metadata, cross-step block move capability metadata, checkout-link capability metadata, resource-delivery-link capability metadata, public funnel resource-delivery-token capability metadata, webinar-event-link capability metadata, archived-draft purge capability metadata, public funnel checkout-start capability metadata, archive/unpublish lifecycle metadata, direct agent public publishing metadata, and published D1 funnel routes. Owner-session UI may create from templates, duplicate, edit steps, edit existing block copy, apply curated visual style presets, add reusable blocks, remove safe unlinked blocks, reorder or drag/drop existing blocks within a step, move existing blocks across steps, link checkout offers, link resource delivery, link webinar event/replay references, preview, publish, archive, unpublish, and purge archived private draft steps with actor identity, confirmation where required, idempotency, audit correlation, stale-state checks, and redaction. Owner-session agents can use /api/agent/funnels/draft-writes for private block copy edits, curated visual style presets, reusable block add/remove, checkout linking/unlinking, block reordering, cross-step block moves, resource-delivery linking, webinar-event linking, private duplication, public publishing, archive/unpublish, and archived-draft purge with the same confirmation, stale-state, audit, and redaction boundary. Published funnel resource-token creation requires checkout intent, entitlement, product, and file asset scope to match a published linked resource block; direct agent non-archived purge and unauthenticated public agent publishing are still planned.",
    validation: [
      "Playwright covers the owner-gated /admin/funnels surface, webinar/resource template records, template-to-draft create path, draft duplicate path, granular block-edit path, block visual-style path, block add/remove path, block reorder path, drag/drop block placement UI, cross-step block move path, linked-checkout block removal refusal, checkout-link create path, resource delivery link path, funnel-scoped private delivery token path, webinar event link path, archived-draft purge path, idempotent replay, stale checkout-link/resource-link/webinar-link/purge, block-edit, block-style, block-add, block-move, and cross-step block-move rejection, seed/update/reorder/publish/archive POST paths, stale publish/archive rejection, archived draft read-only behavior, private draft preview, public D1 funnel route rendering, public linked-checkout start rendering, public visual-style rendering, public resource-link and webinar-link rendering, archive removal from /funnels/source-data, /funnels/source-data capability metadata, and agent manifest discovery.",
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
      "Issue #341 records owner-confirmed archive/unpublish lifecycle actions.",
      "Issue #409 records owner-created product delivery-gate links for the seeded offer/funnel path.",
      "Issue #417 records owner-confirmed checkout unlinking, owner-confirmed resource delivery links, funnel-scoped private delivery tokens, owner-confirmed webinar event/replay links, owner-confirmed archived-draft purge, owner-session visual style controls, owner-session within-step block reordering, owner-session cross-step block moves, owner-session direct agent public publishing, and the remaining advanced funnel parity follow-up after MVP closeout.",
      "Issue #430 records owner-session granular draft block title/body editing.",
      "Issue #432 records owner-session reusable block add/remove controls with checkout-linked block protection.",
    ],
    sortOrder: 47,
    updatedAt: null,
  },
  {
    id: "journey-publisher-checks-mobile-admin",
    title: "Publisher checks mobile admin status",
    featureId: "feature-mobile-admin",
    featureStatus: "launch-preview",
    issueNumbers: [414, 13, 67, 68, 153, 155, 157],
    primaryUser: "Publisher away from desktop",
    userGoal: "Open the future Bumpgrade mobile app to check Director workstreams, roadmap, work-log, owner attention, commerce health, owner-session boundaries, confirmed-action requirements, push readiness, and distribution readiness without separate mobile-only semantics.",
    sourceEvidence: [
      "https://bumpgrade.com/mobile-admin/source-data",
      "https://bumpgrade.com/mobile-admin/dashboard/source-data",
      "https://bumpgrade.com/admin/director/source-data",
      "https://bumpgrade.com/mobile-admin/ios/source-data",
      "https://bumpgrade.com/mobile-admin/android/source-data",
      "https://bumpgrade.com/agent-docs/bumpgrade-mobile-admin",
      "https://github.com/markitics/bumpgrade/issues/414",
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
      "Review the compact Director workstream brief for categories such as Marketing, Mobile Admin, Agent Readiness, Security / Trust, and Operations before drilling into detail.",
      "Use /api/mobile-admin/director-reviews to acknowledge a reviewed Director workstream only after owner session auth, exact confirmation, stale-state checks, idempotency, and audit correlation.",
      "Use /api/mobile-admin/commerce-reviews to acknowledge reviewed commerce-health source-data only after owner session auth, exact confirmation, stale-state checks, idempotency, and audit correlation.",
      "Review the shared owner-session panel, confirmed-action cards, push boundary, and distribution boundary before any live push sends, store distribution, or high-risk mobile mutations exist.",
      "Use the dashboard digest to resolve live /admin/source-data, /features/source-data, /roadmap/source-data, /commerce/source-data, and /agent-docs/source-data without scraping private admin pages.",
      "Use issue #414 for private mobile rows, live confirmed-write APIs, physical-device proof, APNs/FCM push execution, and eventual App Store/TestFlight or Play Store/internal-testing distribution readiness.",
      "Follow closed scaffold issues #13, #67, #68, #153, #155, and #157 for completed read-only evidence.",
    ],
    edgeCases: [
      "The iOS simulator target is not App Store/TestFlight distribution, live push notifications, physical-device private row proof, or high-risk live confirmed-write support.",
      "The Android emulator target is not Play Store/internal-testing distribution, live push notifications, physical-device private row proof, or high-risk live confirmed-write support.",
      "Private admin state requires Better Auth owner or publisher sessions.",
      "Mobile writes are limited to low-risk private-row workflow actions, Director workstream acknowledgements, and commerce-health acknowledgements until additional confirmed-write APIs exist.",
      "/mobile-admin/dashboard/source-data is public-safe and excludes private buyer rows, owner email values, raw inbox bodies, raw attention bodies, raw work-log bodies, R2 object keys, signed URLs, secret values, upload bodies, session IDs, and write tokens.",
    ],
    agentAccess:
      "Agents can read /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /admin/director/source-data, /mobile-admin/ios/source-data, and /mobile-admin/android/source-data to understand app scope, live public-safe mobile digest state, Director workstream nesting, owner-session requirements, Director review requirements, commerce review requirements, confirmed-action requirements, push/distribution readiness boundaries, and smoke evidence; they must not claim mobile app parity until live push execution, physical-device proof, installable distribution, and high-risk live confirmed writes ship.",
    validation: [
      "Issue #414 now renders the owner-session, Director review, commerce review, confirmed-action, APNs/FCM push-readiness, and distribution-readiness contract in the app scaffolds while tracking high-risk billing/publishing/fulfillment confirmed-write APIs, physical-device proof, live push execution, and eventual installable distribution after scaffold closeout.",
      "Issue #13 defines the shared contract and splits iOS and Android child issues.",
      "Issue #67 adds an Expo app scaffold, generated fixture, iOS simulator target, validation command, smoke command, and screenshot path.",
      "Issue #68 adds a native Android activity, generated fixture asset, emulator target, validation command, smoke command, and screenshot path.",
      "Issue #153 adds /mobile-admin/dashboard/source-data as the live public-safe dashboard contract.",
      "Issue #155 renders the live dashboard route and redaction boundary in the Expo, iOS, and Android scaffold surfaces.",
      "Issue #157 fetches the live dashboard route in Expo, iOS, and Android while preserving fixture fallback for deterministic smoke tests.",
      "Playwright covers /agent-docs/bumpgrade-mobile-admin, /mobile-admin/source-data, /mobile-admin/dashboard/source-data, /mobile-admin/ios/source-data, /mobile-admin/android/source-data, Director digest redaction, commerce review redaction, push-readiness redaction, and distribution-readiness blockers. Mobile validations assert the scaffold apps render and live-hydrate the dashboard and Director brief panels.",
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
    featureStatus: "live",
    issueNumbers: [16, 83, 101, 139, 141, 143, 146, 147, 151, 179, 181, 185, 187, 251, 403, 405, 407, 409],
    primaryUser: "Publisher or agent planning fulfillment",
    userGoal:
      "Inspect products, create draft product records, create buyer-facing test checkout links for owner-created products, link those test checkout links to seeded offer/funnel delivery gates, complete synthetic test checkout/access grants, inspect assets, access rules, entitlement templates, sandbox entitlement grant mappings, subscription-backed membership access, owner entitlement rows, owner-confirmed revocation intents, and protected fixture delivery checks before real private content storage is enabled.",
    sourceEvidence: [
      "https://bumpgrade.com/products/source-data",
      "https://bumpgrade.com/products/indie-launch-library",
      "https://bumpgrade.com/products/entitlements",
      "https://bumpgrade.com/api/products/entitlements",
      "https://bumpgrade.com/api/products/test-checkout",
      "https://bumpgrade.com/api/products/download-tokens",
      "https://bumpgrade.com/api/products/protected-content",
      "https://bumpgrade.com/api/admin/products/catalog",
      "https://bumpgrade.com/api/admin/products/test-checkout-links",
      "https://bumpgrade.com/api/admin/products/delivery-gates",
      "https://bumpgrade.com/api/admin/products/offer-access-grants",
      "https://bumpgrade.com/api/admin/products/assets",
      "https://bumpgrade.com/api/admin/products/revocation-intents",
      "https://bumpgrade.com/admin/products",
      "https://bumpgrade.com/offers/source-data",
      "https://bumpgrade.com/funnels/source-data",
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
      "https://github.com/markitics/bumpgrade/issues/403",
      "https://github.com/markitics/bumpgrade/issues/405",
      "https://github.com/markitics/bumpgrade/issues/407",
      "https://github.com/markitics/bumpgrade/issues/409",
    ],
    happyPath: [
      "Fetch /products/source-data.",
      "Find seeded product types, owner product creation contract, owner-created product test checkout link contract, owner product delivery-gate contract, owner-created product test grant contract, asset IDs, access rules, entitlement templates, sandbox grant mappings, subscription membership access contract, aggregate entitlement inspection counts, customer lookup contract, private R2-backed delivery contract, owner-upload intent contract, owner-confirmed revocation intent contract, protected content readiness, protected fixture delivery contract, revision ID, and write boundary.",
      "Open /products/indie-launch-library to inspect the public preview.",
      "Open /admin/products as a verified owner to create a draft product, create a buyer-facing test checkout link after a current product updatedAt check, link it to the seeded offer/funnel delivery gates after a current checkout-link revision check, link it to test offer/funnel IDs, create synthetic paid test checkout/access evidence, and inspect private buyer entitlement rows, checkout state, product/price context, and queued fulfillment evidence.",
      "Open /products/test-checkout/{linkId} to complete a public test checkout after exact confirmation, idempotency, and a current link revision check.",
      "Open /products/entitlements with a checkout intent reference to inspect customer-safe entitlement and fulfillment state.",
      "Create and consume a short-lived download token for an active file entitlement after current entitlement and trusted checkout state are revalidated, streaming the seeded private R2-backed fixture through Bumpgrade without exposing private R2 keys or signed object URLs.",
      "As a verified owner, create a small private product asset upload record only after exact confirmation, idempotency, and catalog revision checks.",
      "Record a non-destructive revocation intent in /admin/products without removing access.",
      "Use /api/products/protected-content with a known checkout intent, active matching entitlement, and protected content id to read the seeded protected fixture.",
      "Use trusted Stripe Billing subscription state to activate or pause checkout-linked membership access without exposing raw subscription/customer identifiers.",
      "Use /offers/source-data, /funnels/source-data, and /commerce/source-data to confirm checkout, funnel, delivery-gate, and webhook dependencies before assuming fulfillment exists.",
    ],
    edgeCases: [
      "The seeded product/access catalog is not a product admin.",
      "Public /products/source-data exposes aggregate entitlement, owner-created product, owner-created product test checkout, owner product delivery-gate, owner-created product test grant, owner-upload, and revocation-intent counts plus redaction flags, not buyer emails, owner emails, checkout link IDs, checkout IDs, entitlement IDs, target entitlement IDs, raw Stripe IDs, hashes, private reason notes, metadata JSON, R2 keys, signed URLs, or upload bodies.",
      "Owner product delivery-gate links do not create Stripe Checkout Sessions, live charges, published offer/funnel state, signed URLs, private R2 keys, or arbitrary customer delivery.",
      "A token is rejected without being consumed when current entitlement or trusted checkout state is no longer eligible.",
      "Owner-uploaded private assets are stored as records but are not yet wired to customer delivery.",
      "Owner-confirmed revocation intent records are non-destructive and stale-state checked, but they do not remove access, refund, change billing, or notify customers.",
      "Protected fixture delivery rejects mismatched entitlements and stale checkout state.",
      "Canceled, unpaid, incomplete_expired, or deleted subscriptions pause membership access without exposing raw subscription/customer IDs, Customer Portal URLs, member posts, private files, or progress rows.",
      "Signed object URLs, real protected media, destructive revocation, customer delivery of arbitrary uploads, Customer Portal actions, and live fulfillment automation require future APIs.",
    ],
    agentAccess:
      "Agents can read /products/source-data, /offers/source-data, /funnels/source-data, aggregate entitlement inspection counts, aggregate owner-created product/test checkout/delivery-gate/test grant counts, the preview route, the customer-safe checkout intent lookup contract, the short-lived private R2-backed download-token boundary with redemption revalidation, the owner-authenticated private asset upload intent boundary, owner-confirmed non-destructive revocation intent evidence, protected content readiness, protected fixture delivery checks, and subscription-backed membership access state. Owner sessions can create draft products, create buyer-facing test checkout links, link owner-created product test checkout links to seeded offer/funnel delivery gates, link owner-created products to test offer/funnel IDs, create synthetic paid test checkout/access grants, inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products, create small private asset upload records, and record non-destructive revocation intents only through exact-confirmed, idempotent, stale-state-checked writes. Public test checkout links can create synthetic paid access evidence only after exact confirmation, idempotency, and a current link revision check. Trusted paid sandbox webhooks can grant seeded entitlement rows and trusted Stripe Billing webhooks can sync membership access; direct customer delivery of arbitrary uploads, destructive revocation, real protected media delivery, live offer/funnel publishing, Customer Portal actions, and subscription mutations require later APIs.",
    validation: [
      "Playwright covers /products/source-data, owner draft product creation, owner-created product test checkout link creation, owner product delivery-gate creation, public test checkout completion, owner-created product test grant creation, aggregate entitlement inspection redaction, /products/indie-launch-library, customer /products/entitlements lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, protected fixture delivery, protected fixture stale-state rejection, subscription-backed membership access activation/inactivation, owner private asset upload intent creation, owner-confirmed non-destructive revocation intent creation, idempotent replay, stale-state rejection, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, sitemap discovery, and agent manifest read-contract discovery.",
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
      "Issue #403 records the first owner-confirmed draft product creation path.",
      "Issue #405 records the first owner-created product test offer/access grant path.",
      "Issue #407 records the first owner-created product buyer-facing test checkout path.",
      "Issue #409 records the first owner-created product delivery-gate link path.",
    ],
    sortOrder: 49,
    updatedAt: null,
  },
  {
    id: "journey-publisher-verifies-sandbox-entitlement-grant",
    title: "Publisher verifies sandbox entitlement grant evidence",
    featureId: "feature-products-access",
    featureStatus: "live",
    issueNumbers: [16, 83, 99, 101, 139, 141, 143, 146, 147, 151, 179, 181, 185, 187, 251, 403, 405, 407, 409],
    primaryUser: "Publisher or agent validating fulfillment readiness",
    userGoal:
      "Confirm that a paid sandbox checkout webhook can grant product entitlements, trusted Stripe Billing state can sync membership access, owner-created draft products can create buyer-facing test checkout links, delivery-gate links, and access grant evidence, queued fulfillment evidence stays public-safe, owner-confirmed revocation intent records stay non-destructive, and protected fixtures return only for active eligible checkout-linked entitlements.",
    sourceEvidence: [
      "https://bumpgrade.com/products/source-data",
      "https://bumpgrade.com/products/entitlements",
      "https://bumpgrade.com/api/products/entitlements",
      "https://bumpgrade.com/api/products/test-checkout",
      "https://bumpgrade.com/api/products/download-tokens",
      "https://bumpgrade.com/api/products/protected-content",
      "https://bumpgrade.com/api/admin/products/catalog",
      "https://bumpgrade.com/api/admin/products/test-checkout-links",
      "https://bumpgrade.com/api/admin/products/delivery-gates",
      "https://bumpgrade.com/api/admin/products/offer-access-grants",
      "https://bumpgrade.com/api/admin/products/assets",
      "https://bumpgrade.com/api/admin/products/revocation-intents",
      "https://bumpgrade.com/admin/products",
      "https://bumpgrade.com/commerce/source-data",
      "https://bumpgrade.com/offers/source-data",
      "https://bumpgrade.com/funnels/source-data",
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
      "https://github.com/markitics/bumpgrade/issues/403",
      "https://github.com/markitics/bumpgrade/issues/405",
      "https://github.com/markitics/bumpgrade/issues/407",
      "https://github.com/markitics/bumpgrade/issues/409",
    ],
    happyPath: [
      "Create a draft product record as a verified owner without billing or fulfillment mutation.",
      "Create a buyer-facing test checkout link for the owner-created product after exact confirmation, idempotency, and a current product updatedAt check.",
      "Link that checkout link to the seeded offer/funnel delivery gates after exact confirmation, idempotency, a current product updatedAt check, and a current checkout-link revision check.",
      "Complete the public test checkout after exact confirmation, idempotency, and a current link revision check.",
      "Link the owner-created draft product to test offer/funnel IDs and create a synthetic paid test checkout/access grant.",
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
      "Open /admin/products as a verified owner to inspect the entitlement rows, queued fulfillment evidence, delivery-gate links, revocation intents, and protected content readiness.",
    ],
    edgeCases: [
      "Duplicate owner-created product test grant idempotency keys replay only identical requests.",
      "Duplicate owner-created product test checkout link idempotency keys replay only identical requests.",
      "Duplicate owner product delivery-gate idempotency keys replay only identical requests.",
      "Public test checkout completion rejects stale link revisions and conflicting idempotency replays.",
      "Owner-created product delivery-gate links and test grants do not create Stripe Checkout Sessions, live charges, published offer copy, signed URLs, private R2 keys, or public buyer records.",
      "Duplicate webhook events do not create duplicate entitlements.",
      "Public /products/source-data exposes aggregate counts and redaction flags, not raw buyer rows, owner identity, checkout link IDs, checkout IDs, entitlement IDs, or idempotency keys.",
      "A token created before a checkout state change is rejected while checkout state is no longer trusted paid or completed.",
      "Owner-uploaded private assets are not yet customer-delivered.",
      "Owner-confirmed revocation intents reject stale entitlement status and idempotency conflicts but do not mutate access, billing, refunds, notifications, or fulfillment.",
      "Protected fixture delivery rejects mismatched entitlements and stale checkout state.",
      "Canceled, unpaid, incomplete_expired, or deleted subscriptions pause membership access without exposing raw subscription/customer IDs, Customer Portal URLs, member posts, private files, or progress rows.",
      "Signed downloads, arbitrary protected content delivery, customer portal, refunds, destructive revocation, live offer/funnel publishing, live charges, and direct customer delivery of arbitrary uploads require later confirmed-write APIs.",
      "Raw Stripe identifiers and buyer email remain server-private.",
    ],
    agentAccess:
      "Agents can read /products/source-data, /offers/source-data, /funnels/source-data, /api/products/entitlements, /api/products/test-checkout, /api/products/download-tokens, /api/products/protected-content, and /commerce/source-data to understand the owner product creation contract, owner-created product test checkout link contract, owner-created product delivery-gate link contract, owner-created product test offer/access grant contract, entitlement grant contract, customer-safe lookup, short-lived private R2-backed fixture delivery with redemption revalidation, owner-upload intent boundary, owner-confirmed non-destructive revocation intent boundary, protected content readiness, protected fixture delivery checks, subscription-backed membership access, and aggregate inspection counts. Owner sessions can create draft products, create owner-created product test checkout links, link owner-created product test checkout links to seeded offer/funnel delivery gates, create owner-created product test offer/access grants, inspect private buyer entitlement rows, revocation intent records, and protected content readiness in /admin/products, create small private asset upload records, and record revocation intents via exact-confirmed, idempotent, stale-state-checked writes. Public test checkout links can create synthetic paid access evidence only after exact confirmation, idempotency, and a current link revision check. Agents cannot grant live access, destructively revoke, expose private buyer data, deliver arbitrary protected bodies, deliver arbitrary uploads to customers, mutate subscriptions, publish live offer/funnel changes, create Customer Portal sessions, or issue signed object URLs without future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers source-data output, owner draft product creation, owner-created product test checkout link creation, owner product delivery-gate creation, public test checkout completion, owner-created product test grant creation, aggregate redaction, a paid test checkout webhook that creates entitlement rows, customer-safe lookup, private R2-backed token delivery, current checkout-state revalidation, replay rejection, protected fixture delivery and stale-state rejection, subscription-backed membership access activation/inactivation, owner private asset upload intent creation, owner-confirmed non-destructive revocation intent creation, idempotent replay, stale-state rejection, unauthorized rejection, owner /admin/products inspection, revocation intent readiness, protected content readiness, and duplicate webhook idempotency.",
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
      "Issue #403 records the owner-confirmed draft product creation path.",
      "Issue #405 records the owner-created product test offer/access grant path.",
      "Issue #407 records the owner-created product buyer-facing test checkout path.",
      "Issue #409 records the owner-created product delivery-gate link path.",
    ],
    sortOrder: 50,
    updatedAt: null,
  },
  {
    id: "journey-publisher-previews-audience-automation",
    title: "Publisher previews audience opt-in automation",
    featureId: "feature-email-automation-crm",
    featureStatus: "live",
    issueNumbers: [17, 85, 103, 137, 167, 169, 171, 173, 175, 177, 183, 189, 191, 197, 199, 201, 203, 205, 207, 209, 211, 253, 259, 347, 351, 354, 358, 360, 362, 364, 366, 368, 370, 372, 374, 376, 378, 380, 420],
    primaryUser: "Publisher or agent planning list growth",
    userGoal: "Inspect opt-in forms, tags, lead magnets, sequences, broadcasts, automation rules, owner subscriber rows, aggregate suppression evidence, private CRM timeline note counts, aggregate sequence delivery readiness, dry-run sequence schedule intents, dry-run sequence delivery batches, dry-run sequence queue-message evidence, dry-run sequence dispatch preflight evidence, dry-run sequence dispatch attempt receipts, sequence Queue producer readiness gates, sequence Queue consumer readiness gates, sequence provider-call readiness gates, sequence delivery-attempt readiness gates, sequence delivery-result readiness gates, sequence delivery-status webhook readiness gates, sequence provider-polling readiness gates, sequence receipt-payload readiness gates, broadcast readiness, dry-run broadcast schedule intents, preview/footer safety, queue readiness, delivery-batch dry runs, dry-run queue-message evidence, dispatch preflight evidence, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, provider-call readiness gates, delivery-attempt readiness gates, delivery-result readiness gates, delivery-status webhook readiness gates, provider-polling readiness gates, receipt-payload readiness gates, owner-confirmed import intents, owner-confirmed import preflights, aggregate export readiness, and the live consent/unsubscribe/note/import-intent/import-preflight MVP boundary while live sends and execution remain pending in issue #420.",
    sourceEvidence: [
      "https://bumpgrade.com/audience/source-data",
      "https://bumpgrade.com/audience/indie-launch-waitlist",
      "https://bumpgrade.com/api/audience/opt-in",
      "https://bumpgrade.com/api/audience/unsubscribe",
      "https://bumpgrade.com/api/admin/audience/notes",
      "https://bumpgrade.com/api/admin/audience/sequences/schedule-intents",
      "https://bumpgrade.com/api/admin/audience/sequences/delivery-batches",
      "https://bumpgrade.com/api/admin/audience/sequences/delivery-queue-messages",
      "https://bumpgrade.com/api/admin/audience/sequences/dispatch-preflights",
      "https://bumpgrade.com/api/admin/audience/sequences/dispatch-attempts",
      "https://bumpgrade.com/api/admin/audience/sequences/queue-producer-readiness",
      "https://bumpgrade.com/api/admin/audience/sequences/queue-consumer-readiness",
      "https://bumpgrade.com/api/admin/audience/sequences/provider-call-readiness",
      "https://bumpgrade.com/api/admin/audience/sequences/delivery-attempt-readiness",
      "https://bumpgrade.com/api/admin/audience/sequences/delivery-result-readiness",
      "https://bumpgrade.com/api/admin/audience/sequences/delivery-status-webhook-readiness",
      "https://bumpgrade.com/api/admin/audience/sequences/provider-polling-readiness",
      "https://bumpgrade.com/api/admin/audience/sequences/receipt-payload-readiness",
      "https://bumpgrade.com/api/admin/audience/sequences/test-sends",
      "https://bumpgrade.com/api/admin/audience/broadcasts/schedule-intents",
      "https://bumpgrade.com/api/admin/audience/broadcasts/delivery-batches",
      "https://bumpgrade.com/api/admin/audience/broadcasts/delivery-queue-messages",
      "https://bumpgrade.com/api/admin/audience/broadcasts/dispatch-preflights",
      "https://bumpgrade.com/api/admin/audience/broadcasts/dispatch-attempts",
      "https://bumpgrade.com/api/admin/audience/broadcasts/test-sends",
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
      "https://github.com/markitics/bumpgrade/issues/347",
      "https://github.com/markitics/bumpgrade/issues/351",
      "https://github.com/markitics/bumpgrade/issues/354",
      "https://github.com/markitics/bumpgrade/issues/358",
      "https://github.com/markitics/bumpgrade/issues/360",
      "https://github.com/markitics/bumpgrade/issues/362",
      "https://github.com/markitics/bumpgrade/issues/364",
      "https://github.com/markitics/bumpgrade/issues/366",
      "https://github.com/markitics/bumpgrade/issues/368",
      "https://github.com/markitics/bumpgrade/issues/370",
      "https://github.com/markitics/bumpgrade/issues/372",
      "https://github.com/markitics/bumpgrade/issues/374",
      "https://github.com/markitics/bumpgrade/issues/376",
      "https://github.com/markitics/bumpgrade/issues/378",
      "https://github.com/markitics/bumpgrade/issues/380",
      "https://github.com/markitics/bumpgrade/issues/420",
    ],
    happyPath: [
      "Fetch /audience/source-data.",
      "Find the seeded audience workspace, revision ID, opt-in form, lead magnet, tag IDs, sequence IDs, automation IDs, aggregate subscriber inspection counts, aggregate suppression counts, aggregate CRM timeline counts, sequence delivery-readiness counts, dry-run sequence schedule-intent counts, dry-run sequence delivery-batch counts, dry-run sequence queue-message counts, sequence dispatch preflight counts, sequence dispatch attempt counts, sequence Queue producer readiness counts, sequence Queue consumer readiness counts, sequence provider-call readiness counts, sequence delivery-attempt readiness counts, sequence delivery-result readiness counts, sequence delivery-status webhook readiness counts, sequence provider-polling readiness counts, sequence receipt-payload readiness counts, broadcast readiness counts, dry-run broadcast schedule-intent counts, preview/footer safety records, queue readiness records, delivery-batch dry-run counts, dry-run queue-message counts, dispatch preflight counts, dispatch attempt counts, sender-domain readiness records, provider-event readiness records, provider rate-limit readiness records, provider response readiness records, send-payload readiness records, Queue producer readiness records, Queue consumer readiness records, provider-call readiness records, delivery-attempt readiness records, delivery-result readiness records, delivery-status webhook readiness records, provider-polling readiness records, receipt-payload readiness records, import intent counts, import preflight counts, export-readiness counts, and write boundaries.",
      "Open /audience/indie-launch-waitlist to submit the seeded public opt-in form with explicit consent.",
      "Confirm the API trims and normalizes email, stores consent evidence, assigns seeded tags, and records draft sequence enrollment without sending email.",
      "Submit the unsubscribe form or POST /api/audience/unsubscribe with an email and idempotency key.",
      "Confirm the unsubscribe API records suppression evidence, marks a known subscriber unsubscribed, and does not reveal whether the submitted email was already on the list.",
      "Open /admin/audience as a verified owner to inspect private subscriber rows, active tags, consent counts, draft sequence enrollment state, suppression totals, private CRM timeline notes, aggregate sequence delivery readiness, dry-run sequence schedule intents, dry-run sequence delivery batches, dry-run sequence queue messages, dry-run sequence dispatch preflights, dry-run sequence dispatch attempt receipts, sequence Queue producer readiness gates, sequence Queue consumer readiness gates, sequence provider-call readiness gates, sequence delivery-attempt readiness gates, sequence delivery-result readiness gates, sequence delivery-status webhook readiness gates, sequence provider-polling readiness gates, sequence receipt-payload readiness gates, broadcast readiness, dry-run broadcast schedule intents, preview safety, queue readiness, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, sender-domain readiness gates, provider-event readiness gates, provider rate-limit readiness gates, provider response readiness gates, send-payload readiness gates, Queue producer readiness gates, Queue consumer readiness gates, provider-call readiness gates, delivery-attempt readiness gates, delivery-result readiness gates, delivery-status webhook readiness gates, provider-polling readiness gates, receipt-payload readiness gates, import intent records, import preflight records, and aggregate export readiness.",
      "Create a short owner CRM note with exact confirmation, idempotency, and the expected subscriber status.",
      "Record a dry-run sequence schedule intent with exact confirmation, idempotency, current workspace revision, sequence status, and expected readiness count.",
      "Record a dry-run sequence delivery batch from the current sequence schedule intent after workspace revision, sequence status, readiness, suppression, unsubscribe-footer, sender-domain, and idempotency gates are checked.",
      "Record dry-run sequence queue-message evidence from the current sequence delivery batch after workspace revision, sequence status, readiness, dry-run queue gates, suppression, unsubscribe-footer, sender-domain, and idempotency checks.",
      "Record dry-run sequence dispatch preflight evidence from the current sequence queue-message record after workspace revision, sequence status, readiness, provider-limit, suppression, unsubscribe-footer, sender-domain, audit, and idempotency gates are checked.",
      "Record dry-run sequence dispatch attempt receipts from the current sequence dispatch preflight after workspace revision, sequence status, readiness, provider-limit, suppression, unsubscribe-footer, sender-domain, Queue producer, Queue consumer, audit, and idempotency gates are checked.",
      "Record sequence Queue producer readiness from the current sequence dispatch attempt after payload, consumer, provider-limit, suppression, unsubscribe-footer, sender-domain, audit, idempotency, and stale-state gates are checked.",
      "Record sequence Queue consumer readiness from the current sequence Queue producer readiness record after payload-read, ack, retry, dead-letter, provider-handoff, backpressure, audit, idempotency, and stale-state gates are checked.",
      "Record sequence provider-call readiness from the current sequence Queue consumer readiness record after provider-response, message-ID, delivery-attempt, receipt, backpressure, audit, idempotency, and stale-state gates are checked.",
      "Record sequence delivery-result readiness from the current sequence delivery-attempt readiness record after result, webhook, receipt, backpressure, audit, idempotency, and stale-state gates are checked.",
      "Record sequence delivery-status webhook readiness from the current sequence delivery-result readiness record after webhook, polling, receipt, backpressure, audit, idempotency, and stale-state gates are checked.",
      "Record sequence provider-polling readiness from the current sequence delivery-status webhook readiness record after polling, receipt, backpressure, audit, idempotency, and stale-state gates are checked.",
      "Record sequence receipt-payload readiness from the current sequence provider-polling readiness record after receipt-payload, delivery-receipt, retention, redaction, backpressure, audit, idempotency, and stale-state gates are checked.",
      "Record an owner-only sequence test send from the current sequence step after workspace revision, sequence status, readiness, idempotency, audit, and exact-confirmation gates are checked.",
      "Record a dry-run broadcast schedule intent with exact confirmation, idempotency, current draft revision, and expected readiness count.",
      "Record a delivery-batch dry run from the current schedule intent after preview safety, queue readiness, sender-domain gate, and suppression counts are checked.",
      "Record dry-run queue-message evidence from the current delivery batch after stale-state and dry-run queue gates are checked.",
      "Record dispatch preflight evidence from the current queue-message dry run after provider-limit, sender-domain, suppression, unsubscribe, audit, and queue-dispatch gates are checked.",
      "Record a dispatch attempt receipt from the current dispatch preflight after queue-producer and provider-response gates are checked.",
      "Record an owner-only broadcast test send from the current draft after stale-state, readiness, preview/footer, idempotency, audit, and exact-confirmation gates are checked.",
      "Record an import intent with exact confirmation, idempotency, current workspace revision/status, aggregate counts, and no raw contact rows or emails.",
      "Record an import preflight with exact confirmation, idempotency, selected import-intent source checks, current workspace revision/status, aggregate eligibility counts, and no raw contact rows, subscriber writes, exports, or sends.",
      "Use sender-domain readiness records to confirm live sends remain blocked until SPF, DKIM, DMARC, reply-path, bounce, and provider evidence are aligned.",
      "Use provider-event readiness records to confirm bounces, complaints, delivery events, raw provider payloads, and provider secrets stay redacted before provider webhooks exist.",
      "Use provider rate-limit readiness records to confirm throttles, retries, backpressure, and provider-limit secrets stay redacted before provider sends exist.",
      "Use provider response readiness records to confirm accepted, transient failure, permanent failure, raw response body, and provider message ID handling stays redacted before provider sends exist.",
      "Use send-payload readiness records to confirm recipient identity, personalization, unsubscribe footer, raw payload body, and audit handling stay redacted before recipient payloads or Queue producers exist.",
      "Use Queue producer readiness records to confirm binding, producer mode, payload dependency, consumer dependency, idempotency, audit, and backpressure gates stay explicit before Cloudflare Queue producers are enabled.",
      "Use Queue consumer readiness records to confirm consumer mode, producer dependency, ack, retry, dead-letter, provider handoff, idempotency, and audit gates stay explicit before Cloudflare Queue consumers are enabled.",
      "Use sequence delivery-attempt readiness records to confirm provider-call, provider-response, message-ID, result, webhook, receipt, idempotency, audit, and backpressure gates stay explicit before delivery attempts are enabled.",
      "Use sequence delivery-result readiness records to confirm delivery-attempt, result, webhook, receipt, idempotency, audit, and backpressure gates stay explicit before delivery results are enabled.",
      "Use sequence provider-polling readiness records to confirm delivery-status webhook, polling, receipt, idempotency, audit, and backpressure gates stay explicit before provider polling is enabled.",
      "Use sequence receipt-payload readiness records to confirm provider-polling, receipt payload, delivery-receipt, idempotency, audit, redaction, and backpressure gates stay explicit before receipt payload capture is enabled.",
      "Use /funnels/source-data and /products/source-data to confirm source and fulfillment dependencies before assuming email delivery exists.",
    ],
    edgeCases: [
      "The seeded audience automation workspace can capture explicit-consent opt-ins, record unsubscribe/suppression evidence, store private owner notes, expose aggregate sequence delivery readiness, record dry-run sequence schedule intent metadata, record dry-run sequence delivery-batch metadata, record dry-run sequence queue-message evidence, record dry-run sequence dispatch preflight evidence, record dry-run sequence dispatch attempt receipts, record sequence Queue producer readiness gates, record sequence Queue consumer readiness gates, record sequence provider-call readiness gates, record sequence delivery-attempt readiness gates, record sequence delivery-result readiness gates, record sequence delivery-status webhook readiness gates, record sequence provider-polling readiness gates, record sequence receipt-payload readiness gates, record owner-only sequence test sends to the verified owner-session email, calculate broadcast readiness, record dry-run broadcast schedule intent metadata, expose preview safety metadata, expose queue readiness metadata, record delivery-batch dry runs, record aggregate dry-run queue-message evidence, record dispatch preflight evidence, record dispatch attempt receipts, record owner-only broadcast test sends to the verified owner-session email, expose sender-domain, provider-event, provider rate-limit, provider response, send-payload, Queue producer, Queue consumer, provider-call, delivery-attempt, delivery-result, delivery-status webhook, provider-polling, and receipt-payload readiness gates, record non-destructive import intents, record aggregate import preflights, and expose aggregate export readiness, but it is not a general contact import, subscriber blast sender, public agent send path, live Cloudflare Queue producer, live Cloudflare Queue consumer, Queue message consumer, provider-call path, subscriber provider-send path, provider webhook receiver, delivery-attempt executor, delivery-result processor, status-webhook processor, provider-polling processor, receipt-payload processor, receipt processor, recipient-payload creator, real sequence scheduler, private export generator, or full CRM database.",
      "Public /audience/source-data exposes aggregate counts and redaction flags, not subscriber emails, names, raw IPs, raw user agents, suppression hashes, note bodies, actor emails, actor hashes, import private notes, raw import rows, raw contact emails, private DNS credentials, raw DNS records, provider secrets, provider limit secrets, raw provider payloads, raw provider response bodies, recipient payloads, personalized bodies, raw payload bodies, provider message IDs, provider responses, Cloudflare Queue message bodies, Queue consumer ack/retry/dead-letter rows, send queue payloads, delivery payloads, body templates, unsubscribe URLs, reasons, subscriber rows from imports, sequence schedules, exports, or private metadata.",
      "The unsubscribe API returns the submitted normalized email to the submitter but does not reveal list membership.",
      "Owner-only sequence and broadcast test sends may send to the verified owner-session email only; they do not store raw recipient emails, raw email bodies, provider message IDs, subscriber payloads, Queue messages, or public agent sends.",
      "Real subscriber imports, direct agent contact writes, real sequence scheduling, subscriber email sends, body templates, unsubscribe URLs, delivery queue rows, Cloudflare Queue messages, queue payload bodies, Queue producer execution, Queue consumer execution, Queue message consumption or acknowledgements, retry/dead-letter rows, provider calls, delivery attempts, delivery results, status webhooks, webhook payload reads, provider polling, provider polling payload reads, polling results, receipt payloads, delivery receipts, private exports, export file creation, and CRM automation require future confirmed-write APIs.",
      "Codex project email in issue #10 is separate from publisher/customer email workflows.",
    ],
    agentAccess:
      "Agents can read /audience/source-data, aggregate subscriber/suppression/timeline/sequence-delivery-readiness/sequence-schedule-intent/sequence-delivery-batch/sequence-queue-message/sequence-dispatch-preflight/sequence-dispatch-attempt/sequence-Queue-producer-readiness/sequence-Queue-consumer-readiness/sequence-provider-call-readiness/sequence-delivery-attempt-readiness/sequence-delivery-result-readiness/sequence-delivery-status-webhook-readiness/sequence-provider-polling-readiness/sequence-receipt-payload-readiness/broadcast readiness/broadcast schedule-intent/preview safety/queue readiness/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/sender-domain/provider-event/provider rate-limit/provider response/send-payload/Queue producer/Queue consumer/provider-call/delivery-attempt/delivery-result/delivery-status-webhook/provider-polling/receipt-payload/import-intent/import-preflight/export-readiness counts, and the opt-in/unsubscribe/note/sequence-schedule-intent/sequence-delivery-batch/sequence-queue-message/sequence-dispatch-preflight/sequence-dispatch-attempt/sequence-Queue-producer-readiness/sequence-Queue-consumer-readiness/sequence-provider-call-readiness/sequence-delivery-attempt-readiness/sequence-delivery-result-readiness/sequence-delivery-status-webhook-readiness/sequence-provider-polling-readiness/sequence-receipt-payload-readiness/broadcast-schedule-intent/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/import-intent/import-preflight write boundaries. Owner sessions can inspect private rows, create private notes, view aggregate sequence delivery readiness, record dry-run sequence schedule intents, record dry-run sequence delivery batches, record dry-run sequence queue-message evidence, record dry-run sequence dispatch preflight evidence, record dry-run sequence dispatch attempt receipts, record sequence Queue producer readiness gates, record sequence Queue consumer readiness gates, record sequence provider-call readiness gates, record sequence delivery-attempt readiness gates, record sequence delivery-result readiness gates, record sequence delivery-status webhook readiness gates, record sequence provider-polling readiness gates, record sequence receipt-payload readiness gates, view broadcast readiness, inspect preview safety, queue readiness, sender-domain readiness, provider-event readiness, provider rate-limit readiness, provider response readiness, send-payload readiness, Queue producer readiness, Queue consumer readiness, provider-call readiness, delivery-attempt readiness, delivery-result readiness, delivery-status webhook readiness, provider-polling readiness, receipt-payload readiness, import intent records, import preflight records, and aggregate export readiness, and record dry-run broadcast schedule intents, delivery-batch dry runs, queue-message dry runs, dispatch preflight dry runs, dispatch attempt receipts, non-destructive import intents, and aggregate import preflights in /admin/audience. Direct agent subscriber writes, real imports, real sequence scheduling, real sends, private exports, export file creation, provider setup, provider webhooks, Queue producer execution, Queue consumer execution, Queue message consumption or acknowledgements, retry/dead-letter rows, provider calls, delivery attempts, delivery results, status webhooks, webhook payloads, provider polling, provider polling payloads, polling results, receipt payloads, receipts, or CRM automation require future authenticated confirmed-write APIs with consent, suppression, sender-domain safety, provider-event safety, provider rate-limit safety, provider response safety, send-payload safety, Queue producer safety, Queue consumer safety, provider-call safety, delivery-attempt safety, delivery-result safety, delivery-status webhook safety, provider-polling safety, receipt-payload safety, queue safety, and audit correlation.",
    validation: [
      "Playwright covers /audience/source-data, aggregate subscriber/suppression/timeline/sequence-delivery-readiness/sequence-schedule-intent/sequence-delivery-batch/sequence-queue-message/sequence-dispatch-preflight/sequence-dispatch-attempt/sequence-Queue-producer-readiness/sequence-Queue-consumer-readiness/sequence-provider-call-readiness/sequence-delivery-attempt-readiness/sequence-delivery-result-readiness/sequence-delivery-status-webhook-readiness/sequence-provider-polling-readiness/sequence-receipt-payload-readiness/broadcast readiness/broadcast schedule-intent/preview safety/queue readiness/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/sender-domain/provider-event/provider rate-limit/provider response/send-payload/Queue producer/Queue consumer/provider-call/delivery-attempt/delivery-result/delivery-status-webhook/provider-polling/receipt-payload/import-intent/import-preflight/export-readiness redaction, /audience/indie-launch-waitlist, valid opt-in, unsubscribe, unknown-email suppression, owner /admin/audience inspection, owner CRM note creation, owner sequence schedule-intent creation, owner sequence delivery-batch creation, owner sequence queue-message creation, owner sequence dispatch-preflight creation, owner sequence dispatch-attempt creation, owner sequence Queue producer readiness creation, owner sequence Queue consumer readiness creation, owner sequence provider-call readiness creation, owner sequence delivery-attempt readiness creation, owner sequence delivery-result readiness creation, owner sequence delivery-status webhook readiness creation, owner sequence provider-polling readiness creation, owner sequence receipt-payload readiness creation, owner broadcast schedule-intent creation, owner delivery-batch creation, owner queue-message creation, owner dispatch-preflight creation, owner dispatch-attempt creation, owner import-intent creation, owner import-preflight creation, unauthorized note/schedule-intent/sequence-delivery-batch/sequence-queue-message/sequence-dispatch-preflight/sequence-dispatch-attempt/sequence-Queue-producer-readiness/sequence-Queue-consumer-readiness/sequence-provider-call-readiness/sequence-delivery-attempt-readiness/sequence-delivery-result-readiness/sequence-delivery-status-webhook-readiness/sequence-provider-polling-readiness/sequence-receipt-payload-readiness/delivery-batch/queue-message/dispatch-preflight/dispatch-attempt/import-intent/import-preflight rejection, validation failures, duplicate idempotency, sitemap discovery, and agent manifest discovery.",
      "Issues #85, #103, #137, #167, #169, #171, #173, #175, #177, #183, #189, #191, #197, #199, #201, #203, #205, #207, #209, #211, #253, #259, #347, #351, #354, #358, #360, #362, #364, #366, #368, #370, #372, #374, #376, #378, and #380 record the audience automation source-data contract, first live opt-in capture path, owner subscriber inspection path, unsubscribe/suppression path, owner CRM timeline note path, broadcast readiness path, dry-run broadcast schedule intent path, broadcast preview safety path, queue readiness path, delivery-batch dry-run path, queue-message dry-run path, dispatch-preflight dry-run path, dispatch-attempt receipt path, sender-domain readiness path, provider-event readiness path, provider rate-limit readiness path, provider response readiness path, send-payload readiness path, Queue producer readiness path, Queue consumer readiness path, owner import-intent path, owner import-preflight path, aggregate export-readiness path, aggregate sequence-delivery-readiness path, dry-run sequence schedule-intent path, dry-run sequence delivery-batch path, dry-run sequence queue-message path, dry-run sequence dispatch-preflight path, dry-run sequence dispatch-attempt path, sequence Queue producer readiness path, sequence Queue consumer readiness path, sequence provider-call readiness path, sequence delivery-attempt readiness path, sequence delivery-result readiness path, sequence delivery-status webhook readiness path, sequence provider-polling readiness path, and sequence receipt-payload readiness path.",
      "Issue #420 tracks live email delivery, automation execution, and agent-safe write parity after the issue #17 MVP closeout.",
    ],
    sortOrder: 50,
    updatedAt: null,
  },
  {
    id: "journey-visitor-joins-indie-launch-waitlist",
    title: "Visitor joins the indie launch waitlist",
    featureId: "feature-email-automation-crm",
    featureStatus: "live",
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
    featureStatus: "live",
    issueNumbers: [18, 87, 105, 107, 119, 121, 123, 125, 127, 129, 261, 263, 265, 267, 269, 271, 284, 286, 288, 290, 292, 294, 297, 299, 301, 303, 305, 307, 309, 311, 422],
    primaryUser: "Publisher or agent optimizing a launch funnel",
    userGoal:
      "Inspect seeded analytics definitions, capture privacy-safe test events, record browser-side funnel page views with deterministic variant and source attribution evidence, route the seeded sandbox opt-in copy through the same session assignment with a baseline holdout, read dashboard-visible fixed-window aggregate source rows, assign deterministic variants, read aggregate conversion report rows, read aggregate report export metadata, read owner-reviewed cohort comparison evidence, read owner-reviewed alert threshold/anomaly-review evidence, read owner-reviewed notification delivery readiness evidence, record owner-confirmed notification inbox records, record owner-confirmed dispatch preflights, record owner-reviewed provider/domain readiness evidence, record owner-reviewed content/consent readiness evidence, record owner-reviewed send-payload readiness evidence, record owner-reviewed queue-producer readiness evidence, record owner-reviewed queue-consumer readiness evidence, record owner-reviewed provider-call readiness evidence, record owner-reviewed delivery-attempt readiness evidence, record owner-reviewed delivery-result readiness evidence, record owner-reviewed delivery-status webhook readiness evidence, record owner-reviewed provider-polling readiness evidence, record owner-reviewed receipt-payload readiness evidence, record owner-reviewed delivery-receipt readiness evidence, record owner-reviewed provider-status reconciliation readiness evidence, and record owner-reviewed experiment decision evidence before cookies, contact-level reporting, automated alerts, owner email sends, Queue producer execution, Queue consumer execution, queue dispatch, queue messages, queue message consumption, queue acknowledgements, retry/dead-letter rows, queue payload body reads, queue payload bodies, recipient payloads, personalized bodies, raw payload bodies, provider sends, provider calls, delivery attempts, delivery results, delivery status webhooks, provider responses, provider message IDs, delivery receipts, receipt payloads, status webhooks, provider polling, provider status reconciliation, provider configuration, provider secrets, sender credentials, private DNS credentials, body templates, unsubscribe URLs, customer alerts, custom routing rules, automated winners, or revenue claims exist.",
    sourceEvidence: [
      "https://bumpgrade.com/analytics/source-data",
      "https://bumpgrade.com/analytics/indie-launch-dashboard",
      "https://bumpgrade.com/api/analytics/events",
      "https://bumpgrade.com/api/analytics/assignments",
      "https://bumpgrade.com/api/admin/analytics/experiment-decisions",
      "https://bumpgrade.com/api/admin/analytics/notification-inbox-records",
      "https://bumpgrade.com/api/admin/analytics/notification-dispatch-preflights",
      "https://bumpgrade.com/api/admin/analytics/notification-provider-domain-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-content-consent-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-send-payload-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-queue-producer-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-queue-consumer-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-provider-call-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-delivery-attempt-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-delivery-result-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-delivery-status-webhook-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-provider-polling-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-receipt-payload-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-delivery-receipt-readiness",
      "https://bumpgrade.com/api/admin/analytics/notification-provider-status-reconciliation-readiness",
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
      "https://github.com/markitics/bumpgrade/issues/263",
      "https://github.com/markitics/bumpgrade/issues/265",
      "https://github.com/markitics/bumpgrade/issues/267",
      "https://github.com/markitics/bumpgrade/issues/269",
      "https://github.com/markitics/bumpgrade/issues/271",
      "https://github.com/markitics/bumpgrade/issues/284",
      "https://github.com/markitics/bumpgrade/issues/286",
      "https://github.com/markitics/bumpgrade/issues/288",
      "https://github.com/markitics/bumpgrade/issues/290",
      "https://github.com/markitics/bumpgrade/issues/292",
      "https://github.com/markitics/bumpgrade/issues/294",
      "https://github.com/markitics/bumpgrade/issues/297",
      "https://github.com/markitics/bumpgrade/issues/299",
      "https://github.com/markitics/bumpgrade/issues/301",
      "https://github.com/markitics/bumpgrade/issues/303",
      "https://github.com/markitics/bumpgrade/issues/305",
      "https://github.com/markitics/bumpgrade/issues/307",
      "https://github.com/markitics/bumpgrade/issues/309",
      "https://github.com/markitics/bumpgrade/issues/311",
      "https://github.com/markitics/bumpgrade/issues/422",
    ],
    happyPath: [
      "Fetch /analytics/source-data.",
      "Find event IDs, page-view beacon boundary, aggregate source attribution counts, aggregate variant event counts, fixed time windows, metric IDs, aggregate event counts, aggregate conversion report rows, experiment IDs, variant IDs, assignment rule, assignment API, dashboard source section, and write boundary.",
      "Fetch /analytics/source-data?window=24h to inspect public-safe aggregate source and conversion rows for one supported fixed window.",
      "Open /funnels/indie-launch-sandbox with safe UTM parameters and let the session-idempotent assignment route the opt-in hero copy, then let the page-view beacon record a seeded event with that same variant ID and normalized source attribution.",
      "POST a seeded event to /api/analytics/events with an idempotency key and source route.",
      "POST a seeded experiment assignment to /api/analytics/assignments with an anonymous assignment key, idempotency key, and source route.",
      "Read reportExports from /analytics/source-data to inspect aggregate report sections, selected fixed window, sample-size caveats, fixture cohort definitions, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, and owner-reviewed notification delivery readiness evidence.",
      "Read notificationInboxRecords from /analytics/source-data to inspect owner-confirmed inbox record counts, current readiness evidence, and redaction flags.",
      "Read notificationDispatchPreflights from /analytics/source-data to inspect owner-confirmed dispatch preflight counts, current inbox evidence, and redaction flags.",
      "Read notificationProviderDomainReadiness from /analytics/source-data to inspect owner-reviewed provider/domain readiness counts, current dispatch-preflight evidence, and redaction flags.",
      "Read notificationContentConsentReadiness from /analytics/source-data to inspect owner-reviewed content/consent readiness counts, current provider/domain evidence, and redaction flags.",
      "Read notificationSendPayloadReadiness from /analytics/source-data to inspect owner-reviewed send-payload readiness counts, current content/consent evidence, and redaction flags.",
      "Read notificationQueueProducerReadiness from /analytics/source-data to inspect owner-reviewed queue-producer readiness counts, current send-payload evidence, and redaction flags.",
      "Read notificationQueueConsumerReadiness from /analytics/source-data to inspect owner-reviewed queue-consumer readiness counts, current queue-producer evidence, and redaction flags.",
      "Read notificationProviderCallReadiness from /analytics/source-data to inspect owner-reviewed provider-call readiness counts, current queue-consumer evidence, and redaction flags.",
      "Read notificationDeliveryAttemptReadiness from /analytics/source-data to inspect owner-reviewed delivery-attempt readiness counts, current provider-call evidence, and redaction flags.",
      "Read notificationDeliveryResultReadiness from /analytics/source-data to inspect owner-reviewed delivery-result readiness counts, current delivery-attempt evidence, and redaction flags.",
      "Read notificationDeliveryStatusWebhookReadiness from /analytics/source-data to inspect owner-reviewed delivery-status webhook readiness counts, current delivery-result evidence, and redaction flags.",
      "Read notificationProviderPollingReadiness from /analytics/source-data to inspect owner-reviewed provider-polling readiness counts, current delivery-status webhook evidence, and redaction flags.",
      "Read notificationReceiptPayloadReadiness from /analytics/source-data to inspect owner-reviewed receipt-payload readiness counts, current provider-polling evidence, and redaction flags.",
      "Read notificationDeliveryReceiptReadiness from /analytics/source-data to inspect owner-reviewed delivery-receipt readiness counts, current receipt-payload evidence, and redaction flags.",
      "Read notificationProviderStatusReconciliationReadiness from /analytics/source-data to inspect owner-reviewed provider-status reconciliation readiness counts, current delivery-receipt evidence, and redaction flags.",
      "Open /admin/analytics as a verified owner and record a redacted notification inbox record with the current readiness status, selected fixed-window sample size, threshold count, and sample-size caveat acknowledgement.",
      "Open /admin/analytics as a verified owner and record a redacted dispatch preflight only after a current inbox record exists.",
      "Open /admin/analytics as a verified owner and record redacted provider/domain readiness only after a current dispatch preflight exists.",
      "Open /admin/analytics as a verified owner and record redacted content/consent readiness only after a current provider/domain readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted send-payload readiness only after a current content/consent readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted queue-producer readiness only after a current send-payload readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted queue-consumer readiness only after a current queue-producer readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted provider-call readiness only after a current queue-consumer readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted delivery-attempt readiness only after a current provider-call readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted delivery-result readiness only after a current delivery-attempt readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted delivery-status webhook readiness only after a current delivery-result readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted provider-polling readiness only after a current delivery-status webhook readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted receipt-payload readiness only after a current provider-polling readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted delivery-receipt readiness only after a current receipt-payload readiness record exists.",
      "Open /admin/analytics as a verified owner and record redacted provider-status reconciliation readiness only after a current delivery-receipt readiness record exists.",
      "Open /admin/analytics as a verified owner and record a redacted experiment decision with the current aggregate assignment counts, fixed-window conversion sample size, and sample-size caveat acknowledgement.",
      "Confirm duplicate idempotency returns the same public-safe event or assignment without duplicating rows.",
      "Open /analytics/indie-launch-dashboard to inspect the public preview, aggregate source rows, fixed-window controls, and caveats.",
    ],
    edgeCases: [
      "Public source-data exposes aggregate counts, aggregate source attribution counts, aggregate variant counts, fixed-window metadata, report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox aggregate evidence, owner-confirmed dispatch preflight aggregate evidence, owner-reviewed provider/domain readiness aggregate evidence, owner-reviewed content/consent readiness aggregate evidence, owner-reviewed send-payload readiness aggregate evidence, owner-reviewed queue-producer readiness aggregate evidence, owner-reviewed queue-consumer readiness aggregate evidence, owner-reviewed provider-call readiness aggregate evidence, owner-reviewed delivery-attempt readiness aggregate evidence, owner-reviewed delivery-result readiness aggregate evidence, owner-reviewed delivery-status webhook readiness aggregate evidence, owner-reviewed provider-polling readiness aggregate evidence, owner-reviewed receipt-payload readiness aggregate evidence, owner-reviewed delivery-receipt readiness aggregate evidence, owner-reviewed provider-status reconciliation readiness aggregate evidence, and conversion rows only, not raw event or assignment rows.",
      "Unsupported event IDs, experiment IDs, source routes, missing idempotency keys, and missing assignment keys return public-safe validation errors.",
      "Bot, crawler, and preview/test-suppressed page-view traffic is ignored before analytics event rows are created.",
      "Cookie assignment, contact-level analytics, raw referrer/query reporting, automated alert sends, owner email sends, Queue producer execution, Queue consumer execution, queue dispatch, queue messages, queue message consumption, acknowledgements, retry/dead-letter rows, queue payload body reads, queue payload bodies, recipient payloads, personalized bodies, raw payload bodies, provider sends, provider calls, delivery attempts, delivery results, delivery status webhooks, provider responses, provider message IDs, delivery receipts, receipt payloads, status webhooks, provider polling, provider status reconciliation, provider configuration, provider secrets, sender credentials, private DNS credentials, body templates, unsubscribe URLs, customer alerts, experiment traffic changes beyond the seeded sandbox copy path, automated winners, and revenue claims remain disabled even after owner decision, cohort comparison evidence, threshold review evidence, notification readiness evidence, notification inbox records, dispatch preflights, provider/domain readiness records, content/consent readiness records, send-payload readiness records, queue-producer readiness records, queue-consumer readiness records, provider-call readiness records, delivery-attempt readiness records, delivery-result readiness records, delivery-status webhook readiness records, provider-polling readiness records, receipt-payload readiness records, delivery-receipt readiness records, and provider-status reconciliation readiness records are recorded.",
      "Agents must include sample-size caveats and must not call sparse test events or assignments statistically meaningful.",
    ],
    agentAccess:
      "Agents can read /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard, event capture boundaries, page-view beacon boundaries, seeded sandbox routing and baseline holdout metadata, dashboard-visible fixed-window aggregate source attribution evidence, aggregate variant evidence, assignment boundaries, aggregate conversion report rows, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox aggregate evidence, owner-confirmed dispatch preflight aggregate evidence, owner-reviewed provider/domain readiness aggregate evidence, owner-reviewed content/consent readiness aggregate evidence, owner-reviewed send-payload readiness aggregate evidence, owner-reviewed queue-producer readiness aggregate evidence, owner-reviewed queue-consumer readiness aggregate evidence, owner-reviewed provider-call readiness aggregate evidence, owner-reviewed delivery-attempt readiness aggregate evidence, owner-reviewed delivery-result readiness aggregate evidence, owner-reviewed delivery-status webhook readiness aggregate evidence, owner-reviewed provider-polling readiness aggregate evidence, owner-reviewed receipt-payload readiness aggregate evidence, owner-reviewed delivery-receipt readiness aggregate evidence, owner-reviewed provider-status reconciliation readiness aggregate evidence, and redacted experiment decision evidence. Owner sessions can record notification inbox records through /api/admin/analytics/notification-inbox-records, dispatch preflight records through /api/admin/analytics/notification-dispatch-preflights, provider/domain readiness records through /api/admin/analytics/notification-provider-domain-readiness, content/consent readiness records through /api/admin/analytics/notification-content-consent-readiness, send-payload readiness records through /api/admin/analytics/notification-send-payload-readiness, queue-producer readiness records through /api/admin/analytics/notification-queue-producer-readiness, queue-consumer readiness records through /api/admin/analytics/notification-queue-consumer-readiness, provider-call readiness records through /api/admin/analytics/notification-provider-call-readiness, delivery-attempt readiness records through /api/admin/analytics/notification-delivery-attempt-readiness, delivery-result readiness records through /api/admin/analytics/notification-delivery-result-readiness, delivery-status webhook readiness records through /api/admin/analytics/notification-delivery-status-webhook-readiness, provider-polling readiness records through /api/admin/analytics/notification-provider-polling-readiness, receipt-payload readiness records through /api/admin/analytics/notification-receipt-payload-readiness, delivery-receipt readiness records through /api/admin/analytics/notification-delivery-receipt-readiness, provider-status reconciliation readiness records through /api/admin/analytics/notification-provider-status-reconciliation-readiness, and decision evidence through /api/admin/analytics/experiment-decisions. Issue #422 owns direct public agent analytics writes, custom events beyond the current seeded boundary, raw campaign/referrer reporting, raw analytics exports, automated alert sends, owner email sends, provider sends, provider calls, delivery attempts, delivery results, delivery status webhooks, provider responses, provider message IDs, delivery receipts, receipt payloads, status webhooks, provider polling, provider status reconciliation execution, provider configuration, provider secrets, sender credentials, private DNS credentials, Queue producer execution, Queue consumer execution, queue dispatch, queue-message creation, queue message consumption, queue acknowledgements, retry/dead-letter rows, queue payload body reads, queue payload body creation, recipient-payload creation, personalized body creation, raw payload body storage, body-template exposure, unsubscribe-URL exposure, customer alerts, custom routing rules, automated winners, and revenue claims behind future authenticated confirmed-write APIs with privacy review, idempotency, stale-state checks, audit correlation, redaction, retention limits, and sample-size caveats.",
    validation: [
      "Playwright covers /analytics/source-data, /analytics/source-data?window=24h, /analytics/indie-launch-dashboard fixed-window source attribution UI, /admin/analytics owner decision, notification inbox, dispatch preflight, provider/domain readiness, content/consent readiness, send-payload readiness, queue-producer readiness, queue-consumer readiness, provider-call readiness, delivery-attempt readiness evidence, delivery-result readiness evidence, delivery-status webhook readiness evidence, provider-polling readiness evidence, receipt-payload readiness evidence, delivery-receipt readiness evidence, and provider-status reconciliation readiness evidence, aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox evidence, owner-confirmed dispatch preflight evidence, owner-reviewed provider/domain readiness evidence, owner-reviewed content/consent readiness evidence, owner-reviewed send-payload readiness evidence, owner-reviewed queue-producer readiness evidence, owner-reviewed queue-consumer readiness evidence, owner-reviewed provider-call readiness evidence, owner-reviewed delivery-attempt readiness evidence, owner-reviewed delivery-result readiness evidence, owner-reviewed delivery-status webhook readiness evidence, owner-reviewed provider-polling readiness evidence, owner-reviewed receipt-payload readiness evidence, owner-reviewed delivery-receipt readiness evidence, owner-reviewed provider-status reconciliation readiness evidence, event ingestion, page-view beacon capture with variant and source attribution evidence, bot suppression, assignment ingestion, conversion reporting from captured events, duplicate idempotency, deterministic assignment, validation failures, opt-in event recording, sitemap discovery, and agent manifest discovery.",
      "Issues #87, #105, #107, #119, #121, #123, #125, #127, #129, #261, #263, #265, #267, #269, #271, #284, #286, #288, #290, #292, #294, #297, #299, #301, #303, #305, #307, #309, and #311 record the analytics source-data scaffold, first privacy-safe event capture path, first deterministic assignment path, first aggregate conversion report, first browser-side funnel page-view beacon, first variant-linked page-view evidence, first aggregate source attribution evidence, first dashboard-visible source breakdown, first fixed-window aggregate filters, first owner-confirmed experiment decision evidence, first aggregate report export metadata, owner-reviewed cohort comparison evidence, owner-reviewed alert threshold/anomaly-review evidence, owner-reviewed notification delivery readiness evidence, owner-confirmed notification inbox records, owner-confirmed dispatch preflights, owner-reviewed provider/domain readiness, owner-reviewed content/consent readiness, owner-reviewed send-payload readiness, owner-reviewed queue-producer readiness, owner-reviewed queue-consumer readiness, owner-reviewed provider-call readiness, owner-reviewed delivery-attempt readiness, owner-reviewed delivery-result readiness, owner-reviewed delivery-status webhook readiness, owner-reviewed provider-polling readiness, owner-reviewed receipt-payload readiness, owner-reviewed delivery-receipt readiness, and owner-reviewed provider-status reconciliation readiness. Issue #422 routes seeded sandbox funnel copy with baseline holdout and tracks the remaining custom analytics schemas, custom routing rules, winner selection, notification execution, and agent-safe write parity after the issue #18 MVP closeout.",
    ],
    sortOrder: 51,
    updatedAt: null,
  },
  {
    id: "journey-publisher-reads-funnel-conversion-report",
    title: "Publisher reads a funnel conversion report",
    featureId: "feature-analytics-testing",
    featureStatus: "live",
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
      "Agents can read aggregate funnel conversion rows by fixed window and cite metric IDs, event IDs, dashboard-visible aggregate source attribution evidence, aggregate variant evidence, owner decision evidence, report export metadata, and issues #119/#121/#123/#125/#127/#129/#261/#263 evidence. Direct analytics writes, raw referrer/query reporting, raw analytics exports, traffic routing, and automated experiment decisions require future confirmed-write APIs.",
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
    featureStatus: "live",
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
    featureStatus: "live",
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
    featureStatus: "live",
    issueNumbers: [19, 89, 109, 111, 113, 115, 193, 195, 273, 275, 277, 279, 281, 424],
    primaryUser: "Publisher or agent planning partner growth",
    userGoal:
      "Inspect affiliate programs, partner records, referral links, attribution windows, commission rules, public-safe partner reports, read-only payout preparation, review-only ledger evidence, owner review/reversal state, payout review states, fraud flags, partner notification readiness evidence, send preflight evidence, provider readiness evidence, aggregate click counts, and checkout attribution evidence before payouts exist.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/source-data",
      "https://bumpgrade.com/affiliates/indie-launch-partners",
      "https://bumpgrade.com/api/affiliates/clicks",
      "https://bumpgrade.com/api/affiliates/commission-ledger",
      "https://bumpgrade.com/api/admin/affiliates/commission-ledger/actions",
      "https://bumpgrade.com/api/admin/affiliates/payout-preparation-records",
      "https://bumpgrade.com/api/admin/affiliates/fraud-review-records",
      "https://bumpgrade.com/api/admin/affiliates/notification-readiness-records",
      "https://bumpgrade.com/api/admin/affiliates/notification-send-preflights",
      "https://bumpgrade.com/api/admin/affiliates/notification-provider-readiness",
      "https://bumpgrade.com/admin/affiliates",
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
      "https://github.com/markitics/bumpgrade/issues/273",
      "https://github.com/markitics/bumpgrade/issues/275",
      "https://github.com/markitics/bumpgrade/issues/277",
      "https://github.com/markitics/bumpgrade/issues/279",
      "https://github.com/markitics/bumpgrade/issues/281",
      "https://github.com/markitics/bumpgrade/issues/424",
    ],
    happyPath: [
      "Fetch /affiliates/source-data.",
      "Find the seeded affiliate program, revision ID, partner IDs, partner report IDs, payout preparation IDs, payout preparation record IDs, fraud review record IDs, fraud enforcement record IDs, partner notification readiness record IDs, partner notification send preflight record IDs, partner notification provider readiness record IDs, referral link IDs, attribution rule IDs, commission rule IDs, fixture ledger IDs, payout batch ID, review flags, click capture API, checkout attribution contract, review-only commission ledger contract, owner review action contract, partner report contract, payout preparation contract, owner payout preparation record contract, owner fraud review record contract, owner fraud enforcement record contract, owner notification readiness record contract, owner notification send preflight record contract, owner notification provider readiness record contract, and write boundary.",
      "Read partnerReportSummary to compare aggregate click, attributed checkout, review-only ledger, review action, and commission evidence totals by partner without exposing raw rows.",
      "Read payoutPreparationSummary to inspect eligible, blocked, and reversed fixture ledgers plus readiness checklist items without treating them as payable.",
      "Read fraudReviewRecords, fraudEnforcementRecords, partnerNotificationReadinessRecords, partnerNotificationSendPreflightRecords, and partnerNotificationProviderReadinessRecords to inspect aggregate owner-reviewed fraud review, owner-confirmed fraud enforcement, partner notification readiness, send preflight, and provider readiness evidence without private fraud signals, recipient data, message bodies, send payloads, provider configuration, provider secrets, sender credentials, provider IDs, queue rows, or raw rows.",
      "POST a seeded referral click to /api/affiliates/clicks with referral link ID or code, destination route, and idempotency key.",
      "Start a sandbox checkout intent through /api/commerce/checkout with the referral click ID and checkout idempotency key.",
      "Create review-only commission evidence through /api/affiliates/commission-ledger with checkout intent ID, exact confirmation, and idempotency key.",
      "As an owner, POST a review, hold, or reversal action to /api/admin/affiliates/commission-ledger/actions with exact confirmation, idempotency, expected updatedAt, and reason.",
      "As an owner, POST payout preparation, fraud review, fraud enforcement, notification readiness, notification send preflight, and notification provider readiness records through /admin/affiliates with exact confirmation, idempotency, current revision checks, payout batch status checks, partner report checks, fraud review checks, notification readiness checks, send preflight checks, provider-configuration-disabled checks, provider-secret-redaction checks, provider-send-disabled checks, and public-safe redaction.",
      "Confirm duplicate idempotency returns the same ledger row and does not duplicate commission evidence.",
      "Open /affiliates/indie-launch-partners to inspect the public preview.",
      "Use /commerce/source-data and /offers/source-data to distinguish checkout attribution evidence, review-only ledger evidence, public-safe partner reports, and owner review/reversal actions from payable commissions.",
    ],
    edgeCases: [
      "Public source-data exposes aggregate click, checkout attribution, commission ledger, owner action, partner report, payout preparation, payout preparation record, fraud review record, fraud enforcement record, notification readiness record, notification send preflight record, and notification provider readiness record counts only, not raw click, checkout, buyer, actor, recipient, message, send payload, provider configuration, provider secret, sender credential, provider, queue, reason, private fraud signal, tax, payout, partner notification, or Stripe rows.",
      "Unsupported referral link IDs, codes, destination routes, referral click IDs, checkout intent IDs, commission ledger IDs, action kinds, stale expected updatedAt values, and missing idempotency keys return public-safe validation errors.",
      "Cookie assignment, buyer attribution finalization, payable commission writes, payout accounts, tax forms, Stripe payouts, private partner portals, partner notifications, provider execution, and direct agent writes remain grouped in issue #424 and require future confirmed-write APIs.",
      "Agents must not call review-only commission evidence, partner report totals, payout preparation rows, payout preparation records, fraud review records, fraud enforcement records, notification readiness records, notification send preflight records, or notification provider readiness records payable, send-ready partner statements, payout-ready state, provider-send configuration, provider secret storage, or published affiliate terms.",
    ],
    agentAccess:
      "Agents can read /affiliates/source-data, /commerce/source-data, preview routes, click capture boundaries, checkout attribution boundaries, review-only commission ledger boundaries, owner review action boundaries, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, and owner-reviewed notification provider readiness records. Issue #424 owns payout execution, tax, partner notification sends, provider-send enablement, provider configuration, provider secret storage, provider calls, send payload creation, queue dispatch, private partner portal access, partner payout account storage, buyer attribution finalization, and direct agent affiliate writes behind future authenticated confirmed-write APIs with actor identity, explicit confirmation, idempotency, stale-state checks, audit correlation, redaction, refund-window checks, payout review, private fraud review, notification send preflight checks, provider readiness checks, provider/payment safety, rollback/dispute paths, and private payout data boundaries.",
    validation: [
      "Playwright covers /affiliates/source-data, /affiliates/indie-launch-partners, click ingestion, checkout attribution, review-only commission ledger creation, owner review/reversal actions, public-safe partner reports, read-only payout preparation, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, owner-reviewed notification provider readiness records, duplicate idempotency, stale-state validation, validation failures, aggregate-only source-data, sitemap discovery, and agent manifest discovery.",
      "Issues #89, #109, #111, #113, #115, #193, #195, #273, #275, #277, #279, #281, and #424 record the affiliate/referral source-data scaffold, privacy-safe click capture, checkout attribution evidence, first review-only ledger evidence path, owner review/reversal action boundary, public-safe partner report contract, read-only payout preparation contract, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, and owner-reviewed notification provider readiness records.",
      "Issue #424 tracks live affiliate payout execution, partner notifications, private partner portals, and agent-safe write parity after the issue #19 MVP closeout.",
    ],
    sortOrder: 52,
    updatedAt: null,
  },
  {
    id: "journey-partner-checks-affiliate-status-portal",
    title: "Partner checks affiliate status portal",
    featureId: "feature-affiliates-referrals",
    featureStatus: "live",
    issueNumbers: [19, 193, 195, 273, 275, 277, 279, 281, 424],
    primaryUser: "Affiliate partner checking public-safe status before payouts exist",
    userGoal:
      "Inspect referral link, aggregate performance, payout-readiness blockers, fraud status, and notification readiness without exposing buyer data, payout accounts, tax forms, Stripe identifiers, provider secrets, message bodies, queue rows, raw rows, or private fraud signals.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/indie-launch-partners/partners/launch-circle",
      "https://bumpgrade.com/affiliates/source-data",
      "https://github.com/markitics/bumpgrade/issues/424",
      "https://github.com/markitics/bumpgrade/issues/193",
      "https://github.com/markitics/bumpgrade/issues/195",
    ],
    happyPath: [
      "Open /affiliates/indie-launch-partners/partners/launch-circle.",
      "Confirm the partner portal ID, referral link, report, commission evidence, payout readiness, fraud/review status, and notification readiness sections.",
      "Use /affiliates/source-data.partnerPortalSummary to read the same public-safe portal route, stable IDs, aggregate totals, blocker counts, redaction flags, and non-live execution boundaries.",
      "Follow the program overview or source-data links when a partner or agent needs broader context.",
    ],
    edgeCases: [
      "The portal does not authenticate a partner or expose private partner rows.",
      "The portal does not expose partner email, buyer data, raw click rows, raw checkout rows, raw ledger rows, private fraud signals, payout accounts, tax data, Stripe payout IDs, notification recipient emails, message bodies, send payloads, provider secrets, provider message IDs, or queue rows.",
      "Payable commission state, Stripe transfers, payout receipts, payout account collection, tax collection, partner notification sends, provider configuration, provider calls, queue dispatch, and direct public agent writes remain grouped in issue #424.",
    ],
    agentAccess:
      "Agents can read the partner portal page and /affiliates/source-data.partnerPortalSummary as public-safe status. Authenticated private partner access, payout execution, provider sends, and direct agent affiliate writes require future confirmed-write APIs and private auth boundaries.",
    validation: [
      "Playwright covers the partner portal route, heading, source-data partnerPortalSummary, sitemap entry, agent manifest stable IDs, and redaction boundaries.",
      "Issue #424 records this as a partner-facing status slice, not private partner auth or payout execution.",
    ],
    sortOrder: 54,
    updatedAt: null,
  },
  {
    id: "journey-agent-records-privacy-safe-referral-click",
    title: "Agent records a privacy-safe referral click",
    featureId: "feature-affiliates-referrals",
    featureStatus: "live",
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
    featureStatus: "live",
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
    featureStatus: "live",
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
    featureStatus: "live",
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
    featureStatus: "live",
    issueNumbers: [19, 113, 115, 193, 195, 273, 275, 277, 279, 281, 424],
    primaryUser: "Publisher reviewing affiliate payout readiness before payable state exists",
    userGoal:
      "Inspect read-only payout preparation rows, checklist blockers, partner-report links, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, and owner-reviewed notification provider readiness records before any Stripe payout, tax, payout account, partner send, provider-send configuration, provider secret storage, or direct agent write capability exists.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/source-data",
      "https://bumpgrade.com/affiliates/indie-launch-partners",
      "https://bumpgrade.com/api/admin/affiliates/payout-preparation-records",
      "https://bumpgrade.com/api/admin/affiliates/fraud-review-records",
      "https://bumpgrade.com/api/admin/affiliates/fraud-enforcement-records",
      "https://bumpgrade.com/api/admin/affiliates/notification-readiness-records",
      "https://bumpgrade.com/api/admin/affiliates/notification-send-preflights",
      "https://bumpgrade.com/api/admin/affiliates/notification-provider-readiness",
      "https://bumpgrade.com/admin/affiliates",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/113",
      "https://github.com/markitics/bumpgrade/issues/115",
      "https://github.com/markitics/bumpgrade/issues/193",
      "https://github.com/markitics/bumpgrade/issues/195",
      "https://github.com/markitics/bumpgrade/issues/273",
      "https://github.com/markitics/bumpgrade/issues/275",
      "https://github.com/markitics/bumpgrade/issues/277",
      "https://github.com/markitics/bumpgrade/issues/279",
      "https://github.com/markitics/bumpgrade/issues/281",
      "https://github.com/markitics/bumpgrade/issues/424",
    ],
    happyPath: [
      "Fetch /affiliates/source-data.",
      "Find payoutPreparationContract, payoutPreparationSummary, payoutPreparationRecords, fraudReviewRecords, fraudEnforcementRecords, partnerNotificationReadinessRecords, partnerNotificationSendPreflightRecords, and partnerNotificationProviderReadinessRecords.",
      "Inspect each payoutPreparationId, linked payoutBatchId, partnerReportIds, eligible ledger IDs, blocked ledger IDs, reversed ledger IDs, readiness checklist, fraud review flag, notification readiness checklist, notification send preflight checklist, provider-readiness checklist, provider-configuration-disabled state, provider-secret-redaction state, provider-send-disabled state, and public-safe aggregate totals.",
      "Open /admin/affiliates as a verified owner and record redacted payout preparation evidence with exact confirmation, idempotency, current program revision, payout batch status, ledger counts, and total commission cents.",
      "Record redacted fraud review evidence with exact confirmation, idempotency, current program revision, payout batch status, review flag severity, and linked ledger count.",
      "Record redacted fraud enforcement evidence with exact confirmation, idempotency, current program revision, payout batch status, fraud review record status, review flag severity, and linked ledger count.",
      "Record redacted partner notification readiness evidence with exact confirmation, idempotency, current program revision, partner report status, payout batch status, payout preparation record status, fraud review record status, review flag severity, and linked ledger count.",
      "Record redacted partner notification send preflight evidence with exact confirmation, idempotency, current program revision, partner report status, payout batch status, payout preparation record status, fraud review record status, notification readiness record status, review flag severity, linked ledger count, and provider-send-disabled evidence.",
      "Record redacted notification provider readiness evidence with exact confirmation, idempotency, current program revision, partner report status, payout batch status, payout preparation record status, fraud review record status, notification readiness record status, send preflight record status, review flag severity, linked ledger count, and provider-configuration-disabled evidence.",
      "Open /affiliates/indie-launch-partners and inspect the read-only payout preparation card.",
      "Treat the preparation, fraud review, fraud enforcement, notification readiness, notification send preflight, and notification provider readiness rows as evidence only; do not call them payable commission state, partner statements, notification sends, provider-send configuration, provider secret storage, or Stripe payout execution.",
    ],
    edgeCases: [
      "Refund-window, owner-hold, self-referral evidence, missing recipient review, disabled provider send paths, absent provider configuration, absent provider secrets, absent sender credentials, and absent send payloads keep notification readiness, send preflight, and provider readiness from becoming a send workflow.",
      "Public preparation rows, owner-confirmed payout records, owner-reviewed fraud records, owner-confirmed fraud enforcement records, notification readiness records, notification send preflight records, and notification provider readiness records never expose recipient emails, message bodies, send payloads, provider configuration, provider secrets, sender credentials, provider message IDs, queue rows, buyer data, raw ledger rows, raw click rows, raw checkout rows, raw actor identity, private fraud signals, partner payout accounts, tax forms, or Stripe payout identifiers.",
      "Stripe payouts, transfer creation, private partner portals, payout account storage, tax collection, payable commission finalization, partner notification sends, provider-send enablement, provider configuration, provider secret storage, provider calls, queue dispatch, and direct agent writes require future confirmed-write APIs.",
    ],
    agentAccess:
      "Agents can read public-safe payout preparation, fraud review, fraud enforcement, notification readiness, notification send preflight, and notification provider readiness evidence from /affiliates/source-data and cite payoutPreparationId, payoutPreparationRecordId, reviewFlagId, fraudReviewRecordId, fraudEnforcementRecordId, partnerNotificationReadinessRecordId, partnerNotificationSendPreflightRecordId, and partnerNotificationProviderReadinessRecordId values. Owner sessions can record fraud enforcement evidence through /api/admin/affiliates/fraud-enforcement-records and notification provider readiness evidence through /api/admin/affiliates/notification-provider-readiness. Payout execution, tax handling, payout accounts, partner sends, provider-send enablement, provider configuration, provider secret storage, send payload creation, private portals, and direct agent affiliate writes require future authenticated confirmed-write APIs.",
    validation: [
      "Playwright covers payoutPreparationContract, payoutPreparationSummary, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-confirmed fraud enforcement records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, owner-reviewed notification provider readiness records, preview rendering, admin journey exposure, agent manifest stable IDs, and redaction boundaries.",
      "Issues #195, #273, #275, #277, #279, #281, and #424 record the read-only payout preparation slice, owner-confirmed payout preparation records, owner-reviewed fraud review records, owner-reviewed partner notification readiness records, owner-reviewed partner notification send preflight records, owner-reviewed notification provider readiness records, and owner-confirmed fraud enforcement records.",
    ],
    sortOrder: 59,
    updatedAt: null,
  },
  {
    id: "journey-owner-reviews-affiliate-fraud-flag",
    title: "Owner records affiliate fraud review evidence",
    featureId: "feature-affiliates-referrals",
    featureStatus: "live",
    issueNumbers: [19, 113, 115, 193, 195, 273, 275],
    primaryUser: "Owner reviewing affiliate fraud evidence before payout exists",
    userGoal:
      "Record redacted fraud review evidence for a seeded affiliate review flag without enforcing a fraud decision or creating payout state.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/source-data",
      "https://bumpgrade.com/api/admin/affiliates/fraud-review-records",
      "https://bumpgrade.com/admin/affiliates",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/275",
    ],
    happyPath: [
      "Fetch /affiliates/source-data and inspect fraudReviewRecords.currentEvidence.",
      "Open /admin/affiliates as a verified owner.",
      "Record a fraud review disposition with exact confirmation, idempotency key, current program revision, payout batch status, review flag severity, and linked ledger count.",
      "Replay the idempotency key and confirm the same redacted record is returned.",
      "Read /affiliates/source-data again and confirm aggregate fraud review counts and latest redacted metadata update.",
    ],
    edgeCases: [
      "Signed-out requests are rejected.",
      "Missing confirmation, unsupported review flags, unsupported dispositions, unsupported payout preparation IDs, unsupported payout batch IDs, stale program revisions, stale payout batch statuses, stale review flag evidence, and conflicting idempotency keys fail safely.",
      "The record does not enforce fraud decisions, create payable commission state, trigger Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, expose buyer data, expose raw ledger/click/checkout rows, expose actor identity, or expose private fraud signals.",
    ],
    agentAccess:
      "Agents can read the public-safe fraud review contract and aggregate evidence, but only owner sessions can create fraud review records. Direct public agent writes, fraud enforcement, payable commission mutation, payout execution, tax handling, partner notification, and private fraud signal exposure require future confirmed-write APIs.",
    validation: [
      "Playwright covers unauthenticated rejection, owner contract read, exact confirmation, idempotency replay/conflict, stale-state rejection, unsupported review flags and dispositions, public source-data redaction, and admin UI rendering for fraud review records.",
      "Issue #275 records the owner-reviewed affiliate fraud review evidence slice.",
    ],
    sortOrder: 60,
    updatedAt: null,
  },
  {
    id: "journey-owner-records-affiliate-fraud-enforcement",
    title: "Owner records affiliate fraud enforcement evidence",
    featureId: "feature-affiliates-referrals",
    featureStatus: "live",
    issueNumbers: [19, 113, 115, 193, 195, 273, 275, 424],
    primaryUser: "Owner enforcing affiliate fraud review before payout execution exists",
    userGoal:
      "Record a redacted affiliate fraud enforcement decision for a seeded review flag without creating payable commission state, Stripe payouts, partner notifications, payout accounts, tax data, buyer data, raw rows, or direct public agent writes.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/source-data",
      "https://bumpgrade.com/api/admin/affiliates/fraud-enforcement-records",
      "https://bumpgrade.com/admin/affiliates",
      "https://github.com/markitics/bumpgrade/issues/424",
    ],
    happyPath: [
      "Fetch /affiliates/source-data and inspect fraudEnforcementRecords.currentEvidence.",
      "Open /admin/affiliates as a verified owner.",
      "Record a fraud enforcement disposition with exact confirmation, idempotency key, current program revision, payout batch status, fraud review record status, review flag severity, and linked ledger count.",
      "Replay the idempotency key and confirm the same redacted record is returned.",
      "Read /affiliates/source-data again and confirm aggregate fraud enforcement counts and latest redacted metadata update.",
    ],
    edgeCases: [
      "Signed-out requests are rejected.",
      "Missing confirmation, unsupported review flags, unsupported dispositions, unsupported payout preparation IDs, unsupported payout batch IDs, stale program revisions, stale payout batch statuses, stale fraud review contract status, stale review flag evidence, and conflicting idempotency keys fail safely.",
      "The record does not create payable commission state, trigger Stripe payouts or transfers, store payout accounts, collect tax data, notify partners, expose buyer data, expose raw ledger/click/checkout rows, expose actor identity, or expose private fraud signals.",
    ],
    agentAccess:
      "Agents can read the public-safe fraud enforcement contract and aggregate evidence, but only owner sessions can create fraud enforcement records. Direct public agent writes, payable commission mutation, payout execution, tax handling, partner notification, private portal access, and private fraud signal exposure require future confirmed-write APIs.",
    validation: [
      "Playwright covers unauthenticated rejection, owner contract read, exact confirmation, idempotency replay/conflict, stale-state rejection, unsupported review flags and dispositions, public source-data redaction, and admin UI rendering for fraud enforcement records.",
      "Issue #424 records the owner-confirmed affiliate fraud enforcement evidence slice.",
    ],
    sortOrder: 61,
    updatedAt: null,
  },
  {
    id: "journey-owner-prepares-affiliate-partner-notification-readiness",
    title: "Owner records affiliate partner notification readiness evidence",
    featureId: "feature-affiliates-referrals",
    featureStatus: "live",
    issueNumbers: [19, 193, 195, 273, 275, 277],
    primaryUser: "Owner reviewing affiliate partner notification readiness before sends exist",
    userGoal:
      "Record redacted partner notification readiness evidence for a seeded affiliate partner report without sending partner notifications, calling providers, creating queue rows, or creating payout state.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/source-data",
      "https://bumpgrade.com/api/admin/affiliates/notification-readiness-records",
      "https://bumpgrade.com/admin/affiliates",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/277",
    ],
    happyPath: [
      "Fetch /affiliates/source-data and inspect partnerNotificationReadinessRecords.currentEvidence.",
      "Open /admin/affiliates as a verified owner.",
      "Record a notification readiness disposition with exact confirmation, idempotency key, current program revision, partner report status, payout batch status, payout preparation record status, fraud review record status, review flag severity, and linked ledger count.",
      "Replay the idempotency key and confirm the same redacted record is returned.",
      "Read /affiliates/source-data again and confirm aggregate notification readiness counts and latest redacted metadata update.",
    ],
    edgeCases: [
      "Signed-out requests are rejected.",
      "Missing confirmation, unsupported partner reports, unsupported partners, unsupported payout preparation IDs, unsupported payout batch IDs, unsupported review flag IDs, unsupported dispositions, stale program revisions, stale partner report statuses, stale payout batch statuses, stale payout preparation contract statuses, stale fraud review contract statuses, stale fraud evidence, and conflicting idempotency keys fail safely.",
      "The record does not send partner notifications, call providers, create queues, include recipient emails or message bodies, enforce fraud decisions, create payable commission state, trigger Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose actor identity, or expose private fraud signals.",
    ],
    agentAccess:
      "Agents can read the public-safe notification readiness contract and aggregate evidence, but only owner sessions can create notification readiness records. Direct public agent writes, partner notification sends, provider calls, queue dispatch, fraud enforcement, payable commission mutation, payout execution, tax handling, recipient exposure, and private fraud signal exposure require future confirmed-write APIs.",
    validation: [
      "Playwright covers unauthenticated rejection, owner contract read, exact confirmation, idempotency replay/conflict, stale-state rejection, unsupported report/partner/flag/disposition validation, public source-data redaction, and admin UI rendering for notification readiness records.",
      "Issue #277 records the owner-reviewed affiliate partner notification readiness evidence slice.",
    ],
    sortOrder: 62,
    updatedAt: null,
  },
  {
    id: "journey-owner-prepares-affiliate-partner-notification-send-preflight",
    title: "Owner records affiliate partner notification send preflight evidence",
    featureId: "feature-affiliates-referrals",
    featureStatus: "live",
    issueNumbers: [19, 193, 195, 273, 275, 277, 279],
    primaryUser: "Owner reviewing affiliate partner notification send preflight before sends exist",
    userGoal:
      "Record redacted partner notification send preflight evidence for a seeded affiliate partner report without sending partner notifications, enabling provider sends, calling providers, creating send payloads, creating queue rows, or creating payout state.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/source-data",
      "https://bumpgrade.com/api/admin/affiliates/notification-readiness-records",
      "https://bumpgrade.com/api/admin/affiliates/notification-send-preflights",
      "https://bumpgrade.com/admin/affiliates",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/279",
    ],
    happyPath: [
      "Fetch /affiliates/source-data and inspect partnerNotificationSendPreflightRecords.currentEvidence.",
      "Open /admin/affiliates as a verified owner.",
      "Record a notification send preflight disposition with exact confirmation, idempotency key, current program revision, partner report status, payout batch status, payout preparation record status, fraud review record status, notification readiness record status, review flag severity, and linked ledger count.",
      "Replay the idempotency key and confirm the same redacted record is returned.",
      "Read /affiliates/source-data again and confirm aggregate notification send preflight counts and latest redacted metadata update.",
    ],
    edgeCases: [
      "Signed-out requests are rejected.",
      "Missing confirmation, unsupported partner reports, unsupported partners, unsupported payout preparation IDs, unsupported payout batch IDs, unsupported review flag IDs, unsupported dispositions, stale program revisions, stale partner report statuses, stale payout batch statuses, stale payout preparation contract statuses, stale fraud review contract statuses, stale notification readiness contract statuses, stale fraud evidence, and conflicting idempotency keys fail safely.",
      "The record does not send partner notifications, enable provider sends, call providers, create send payloads, create queues, include recipient emails or message bodies, enforce fraud decisions, create payable commission state, trigger Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose actor identity, or expose private fraud signals.",
    ],
    agentAccess:
      "Agents can read the public-safe notification send preflight contract and aggregate evidence, but only owner sessions can create notification send preflight records. Direct public agent writes, partner notification sends, provider-send enablement, provider calls, queue dispatch, send payload creation, fraud enforcement, payable commission mutation, payout execution, tax handling, recipient exposure, and private fraud signal exposure require future confirmed-write APIs.",
    validation: [
      "Playwright covers unauthenticated rejection, owner contract read, exact confirmation, idempotency replay/conflict, stale-state rejection, unsupported report/partner/flag/disposition validation, notification readiness stale-state validation, public source-data redaction, and admin UI rendering for notification send preflight records.",
      "Issue #279 records the owner-reviewed affiliate partner notification send preflight evidence slice.",
    ],
    sortOrder: 63,
    updatedAt: null,
  },
  {
    id: "journey-owner-prepares-affiliate-partner-notification-provider-readiness",
    title: "Owner records affiliate partner notification provider readiness evidence",
    featureId: "feature-affiliates-referrals",
    featureStatus: "live",
    issueNumbers: [19, 193, 195, 273, 275, 277, 279, 281],
    primaryUser: "Owner reviewing affiliate partner notification provider readiness before sends exist",
    userGoal:
      "Record redacted partner notification provider readiness evidence for a seeded affiliate partner report without configuring providers, storing provider secrets, storing sender credentials, sending partner notifications, enabling provider sends, calling providers, creating send payloads, creating queue rows, or creating payout state.",
    sourceEvidence: [
      "https://bumpgrade.com/affiliates/source-data",
      "https://bumpgrade.com/api/admin/affiliates/notification-readiness-records",
      "https://bumpgrade.com/api/admin/affiliates/notification-send-preflights",
      "https://bumpgrade.com/api/admin/affiliates/notification-provider-readiness",
      "https://bumpgrade.com/admin/affiliates",
      "https://github.com/markitics/bumpgrade/issues/19",
      "https://github.com/markitics/bumpgrade/issues/277",
      "https://github.com/markitics/bumpgrade/issues/279",
      "https://github.com/markitics/bumpgrade/issues/281",
    ],
    happyPath: [
      "Fetch /affiliates/source-data and inspect partnerNotificationProviderReadinessRecords.currentEvidence.",
      "Open /admin/affiliates as a verified owner.",
      "Record a notification provider readiness disposition with exact confirmation, idempotency key, current program revision, partner report status, payout batch status, payout preparation record status, fraud review record status, notification readiness record status, send preflight record status, review flag severity, and linked ledger count.",
      "Replay the idempotency key and confirm the same redacted record is returned.",
      "Read /affiliates/source-data again and confirm aggregate notification provider readiness counts and latest redacted metadata update.",
    ],
    edgeCases: [
      "Signed-out requests are rejected.",
      "Missing confirmation, unsupported partner reports, unsupported partners, unsupported payout preparation IDs, unsupported payout batch IDs, unsupported review flag IDs, unsupported dispositions, stale program revisions, stale partner report statuses, stale payout batch statuses, stale payout preparation contract statuses, stale fraud review contract statuses, stale notification readiness contract statuses, stale send preflight contract statuses, stale fraud evidence, and conflicting idempotency keys fail safely.",
      "The record does not configure notification providers, store provider secrets, store sender credentials, send partner notifications, enable provider sends, call providers, create send payloads, create queues, include recipient emails or message bodies, enforce fraud decisions, create payable commission state, trigger Stripe payouts or transfers, store payout accounts, collect tax data, expose buyer data, expose raw ledger/click/checkout rows, expose actor identity, or expose private fraud signals.",
    ],
    agentAccess:
      "Agents can read the public-safe notification provider readiness contract and aggregate evidence, but only owner sessions can create notification provider readiness records. Direct public agent writes, partner notification sends, provider-send enablement, provider configuration, provider secret storage, sender credential storage, provider calls, queue dispatch, send payload creation, fraud enforcement, payable commission mutation, payout execution, tax handling, recipient exposure, and private fraud signal exposure require future confirmed-write APIs.",
    validation: [
      "Playwright covers unauthenticated rejection, owner contract read, exact confirmation, idempotency replay/conflict, stale-state rejection, unsupported report/partner/flag/disposition validation, send preflight stale-state validation, public source-data redaction, and admin UI rendering for notification provider readiness records.",
      "Issues #279 and #281 record the owner-reviewed affiliate partner notification provider readiness evidence slice.",
    ],
    sortOrder: 64,
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
    title: ownerSafeRequestText(row.title),
    status: row.status,
    issueNumber: row.issue_number,
    featureId: row.feature_id,
    groupName: ownerSafeRequestText(row.group_name),
    summary: ownerSafeRequestText(row.summary),
    publicEvidence: ownerSafeRequestTexts(parseJson<string[]>(row.public_evidence_json, [])),
    nextMilestone: ownerSafeRequestText(row.next_milestone),
    markAttention: row.mark_attention ? ownerSafeRequestText(row.mark_attention) : null,
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
    promptFromMark: ownerSafeRequestText(row.prompt_from_mark),
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
    relevantUrls: normalizeRelevantUrls(row.relevant_urls_json),
    prCommentUrl: row.pr_comment_url,
  };
}

function journeyFromRow(row: D1JourneyRow): AdminUserJourney {
  return {
    id: row.id,
    title: ownerSafeRequestText(row.title),
    featureId: row.feature_id,
    featureStatus: row.feature_status,
    issueNumbers: parseJson<number[]>(row.issue_numbers_json, []),
    primaryUser: ownerSafeRequestText(row.primary_user),
    userGoal: ownerSafeRequestText(row.user_goal),
    sourceEvidence: ownerSafeRequestTexts(parseJson<string[]>(row.source_evidence_json, [])),
    happyPath: ownerSafeRequestTexts(parseJson<string[]>(row.happy_path_json, [])),
    edgeCases: ownerSafeRequestTexts(parseJson<string[]>(row.edge_cases_json, [])),
    agentAccess: ownerSafeRequestText(row.agent_access),
    validation: ownerSafeRequestTexts(parseJson<string[]>(row.validation_json, [])),
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
    title: ownerSafeRequestText(row.title),
    summary: ownerSafeRequestText(row.summary),
    details: row.details ? ownerSafeRequestText(row.details) : null,
    requiredAction: row.required_action ? ownerSafeRequestText(row.required_action) : null,
    responseInstructions: row.response_instructions ? ownerSafeRequestText(row.response_instructions) : null,
    sessionName: row.session_name,
    sessionEmail: row.session_email,
    sourceAgent: row.source_agent,
    sourceKind: row.source_kind,
    links: parseJson<AdminLink[]>(row.links_json, []).map((link) => ({
      ...link,
      label: link.label ? ownerSafeRequestText(link.label) : link.label,
      title: link.title ? ownerSafeRequestText(link.title) : link.title,
    })),
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
