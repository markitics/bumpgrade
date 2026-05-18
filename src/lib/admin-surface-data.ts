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
  sessionName: string | null;
  sessionEmail: string | null;
  sourceAgent: string;
  sourceKind: string;
  links: AdminLink[];
  metadata: Record<string, unknown>;
  lastActivityAt: string;
  createdAt: string;
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
    id: "journey-owner-opens-protected-admin",
    title: "Owner opens protected admin surfaces",
    featureId: "feature-better-auth",
    featureStatus: "live",
    issueNumbers: [9, 10],
    primaryUser: "Mark as Bumpgrade owner",
    userGoal: "Sign in with a Bumpgrade owner account before viewing private admin roadmap, work-log, user-journey, or for-Mark pages.",
    sourceEvidence: ["https://bumpgrade.com/login", "https://bumpgrade.com/admin/roadmap", "https://github.com/markitics/bumpgrade/issues/9"],
    happyPath: ["Open /login.", "Create or sign in to a Bumpgrade account.", "Open an admin route.", "If the owner email is verified and allowlisted, view the private admin page; otherwise see a specific gate reason."],
    edgeCases: ["Production owner verification depends on email sending/routing in #10.", "Agent-readable source-data routes stay public-safe and should not carry private notes or secrets."],
    agentAccess: "Agents can read public-safe source-data routes, but browser admin pages require a Better Auth owner session and must not be scraped as a bypass.",
    validation: ["Playwright covers signed-out admin gates and owner sign-in access.", "D1 migration creates Better Auth storage tables."],
    sortOrder: 35,
    updatedAt: null,
  },
  {
    id: "journey-publisher-plans-first-checkout",
    title: "Publisher plans the first paid offer",
    featureId: "feature-stripe-commerce",
    featureStatus: "live",
    issueNumbers: [11, 33, 15, 16],
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
    id: "mark-attention-2026-05-18-codex-email-blocked",
    category: "blocked",
    state: "open",
    urgency: "high",
    title: "Configure codex@bumpgrade.com sending and reply monitoring",
    summary: "Shipped-feature emails cannot honestly be sent from codex@bumpgrade.com until Cloudflare Email Routing/sending is configured.",
    details: "Issue #10 records the Cloudflare Email REST attempt and missing MX, SPF, and DKIM setup.",
    requiredAction: "Configure Cloudflare email DNS/authentication and reply routing for codex@bumpgrade.com when ready.",
    responseInstructions: "Comment on issue #10 or reply once the project email path is configured. No action is needed to keep #8 moving.",
    sessionName: "bumpgrade-bootstrap",
    sessionEmail: "codex@bumpgrade.com",
    sourceAgent: "Codex",
    sourceKind: "codex",
    links: [
      { label: "Issue #10", url: "https://github.com/markitics/bumpgrade/issues/10", kind: "issue" },
      { label: "/admin/for-mark", url: "https://bumpgrade.com/admin/for-mark", kind: "roadmap" },
    ],
    metadata: { blocksShippedEmail: true },
    lastActivityAt: "2026-05-18T09:45:51.000Z",
    createdAt: "2026-05-18T09:45:51.000Z",
  },
];

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
    attentionItems: fallbackAttentionItems,
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
      attentionItems: attentionRows.map(attentionFromRow),
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
