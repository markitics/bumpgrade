import type {
  AdminLink,
  AdminRoadmapRecord,
  AdminRoadmapStatus,
  AdminSurfaceData,
  AdminWorkLogEntry,
  MarkAttentionItem,
} from "@/lib/admin-surface-data";

export type DirectorWindowId = "past-1-day" | "past-7-days";
export type DirectorQueueLaneId = "due-now" | "in-flight" | "pending-next" | "watchlist";
export type DirectorQueuePriority = "high" | "medium" | "normal";
export type DirectorWorkstreamId =
  | "marketing"
  | "product-commerce"
  | "audience-email"
  | "analytics-growth"
  | "mobile-admin"
  | "agent-readiness"
  | "security-trust"
  | "infrastructure"
  | "operations-control";
export type DirectorStatus = "on_track" | "at_risk" | "blocked" | "done" | "quiet";

export type DirectorWindow = {
  id: DirectorWindowId;
  label: string;
  hours: number;
  since: string;
  workLogEntries: number;
  shippedPrs: number;
  changedWorkstreams: number;
  needsMark: number;
  recentChanges: DirectorWindowChange[];
};

export type DirectorEvidenceLink = AdminLink & {
  source: "roadmap" | "work-log" | "attention" | "route" | "issue" | "pr";
};

export type DirectorInitiative = {
  id: string;
  title: string;
  status: AdminRoadmapStatus | "needs_mark" | "shipped_change";
  summary: string;
  updatedAt: string | null;
  evidence: DirectorEvidenceLink[];
};

export type DirectorWindowChange = DirectorInitiative & {
  workstreamId: DirectorWorkstreamId;
  workstreamTitle: string;
  completedAt: string;
};

export type DirectorQueueItem = DirectorInitiative & {
  workstreamId: DirectorWorkstreamId;
  workstreamTitle: string;
  priority: DirectorQueuePriority;
  queueLabel: string;
  reason: string;
};

export type DirectorQueueLane = {
  id: DirectorQueueLaneId;
  label: string;
  summary: string;
  items: DirectorQueueItem[];
};

export type DirectorWorkstream = {
  id: DirectorWorkstreamId;
  title: string;
  executiveOwner: string;
  description: string;
  status: DirectorStatus;
  currentFocus: string;
  counts: {
    total: number;
    active: number;
    pending: number;
    shipped: number;
    blocked: number;
    changedPastDay: number;
    changedPastWeek: number;
    needsMark: number;
  };
  recentlyChanged: DirectorInitiative[];
  inFlight: DirectorInitiative[];
  pending: DirectorInitiative[];
  shipped: DirectorInitiative[];
  blocked: DirectorInitiative[];
  needsMark: DirectorInitiative[];
  watchlist: DirectorInitiative[];
  sourceRecordIds: {
    roadmap: string[];
    workLog: string[];
    attention: string[];
  };
};

export type DirectorStatusData = {
  id: "bumpgrade-director-status";
  generatedAt: string;
  source: AdminSurfaceData["source"];
  loadError: string | null;
  windows: DirectorWindow[];
  totals: {
    workstreams: number;
    onTrack: number;
    atRisk: number;
    blocked: number;
    done: number;
    quiet: number;
    changedPastDay: number;
    changedPastWeek: number;
    needsMark: number;
  };
  executiveQueue: DirectorQueueLane[];
  workstreams: DirectorWorkstream[];
  sourceRoutes: string[];
  emailPolicy: {
    mode: "digest-first";
    summary: string;
    immediateEmailOnlyFor: string[];
    quietPath: string[];
  };
};

export function shouldOpenDirectorWorkstreamByDefault(
  workstream: Pick<DirectorWorkstream, "status" | "counts">,
) {
  return workstream.status === "blocked" || workstream.counts.needsMark > 0;
}

const workstreamConfig: Record<
  DirectorWorkstreamId,
  { title: string; executiveOwner: string; description: string; groupNames: string[] }
> = {
  marketing: {
    title: "Marketing",
    executiveOwner: "CMO brief",
    description: "Homepage, positioning, feature catalog, comparison pages, SEO, resources, and public launch copy.",
    groupNames: ["SEO and agent discovery", "Marketing surfaces"],
  },
  "product-commerce": {
    title: "Product / Commerce",
    executiveOwner: "Product and revenue brief",
    description: "Funnels, checkout, offers, payments, products, entitlements, subscriptions, and access flows.",
    groupNames: ["Funnels and pages", "Checkout and offers", "Products and access", "Payments"],
  },
  "audience-email": {
    title: "Audience / Email",
    executiveOwner: "Lifecycle brief",
    description: "Subscribers, opt-ins, imports, broadcasts, sequences, email readiness, consent, and suppression.",
    groupNames: ["Growth system"],
  },
  "analytics-growth": {
    title: "Analytics / Growth",
    executiveOwner: "Growth brief",
    description: "Analytics, experiments, attribution, referrals, affiliates, reporting, and growth evidence.",
    groupNames: ["Optimization"],
  },
  "mobile-admin": {
    title: "Mobile Admin",
    executiveOwner: "Mobile product brief",
    description: "iOS, Android, mobile dashboard source-data, simulator/emulator proof, and mobile auth boundaries.",
    groupNames: ["Mobile"],
  },
  "agent-readiness": {
    title: "Agent Readiness",
    executiveOwner: "Agent platform brief",
    description: "Agent docs, manifests, source-data contracts, MCP roadmap, stable IDs, and write-safety boundaries.",
    groupNames: ["Developers and agents"],
  },
  "security-trust": {
    title: "Security / Trust",
    executiveOwner: "Security brief",
    description: "Auth, account setup, domains, tenant boundaries, trusted senders, and permission gates.",
    groupNames: ["Accounts", "Accounts and domains"],
  },
  infrastructure: {
    title: "Infrastructure",
    executiveOwner: "Platform brief",
    description: "Cloudflare, D1, deploys, CI, runtime boundaries, migrations, and production operations.",
    groupNames: ["Platform"],
  },
  "operations-control": {
    title: "Operations / Project Control",
    executiveOwner: "COO brief",
    description: "Roadmap, work-log, For-Mark queue, director dashboard, decisions, blockers, and project hygiene.",
    groupNames: ["Roadmap", "Operations", "Admin and operations"],
  },
};

const workstreamOrder = Object.keys(workstreamConfig) as DirectorWorkstreamId[];

const groupToWorkstream = new Map<string, DirectorWorkstreamId>(
  workstreamOrder.flatMap((id) => workstreamConfig[id].groupNames.map((group) => [group.toLowerCase(), id])),
);

const directorWindows: Array<{ id: DirectorWindowId; label: string; hours: number }> = [
  { id: "past-1-day", label: "Past 1 day", hours: 24 },
  { id: "past-7-days", label: "Past 7 days", hours: 24 * 7 },
];

function parseTime(value: string | null | undefined) {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value: string) {
  return value.toLowerCase();
}

function workstreamFromText(value: string): DirectorWorkstreamId {
  const text = normalizeText(value);
  if (/\b(director|status dashboard|project control|project status|work-log|work log|for-mark|attention queue)\b/.test(text)) {
    return "operations-control";
  }
  if (/\b(marketing|homepage|compare|comparison|competitor|seo|resource|content|feature catalog|pricing|users)\b/.test(text)) {
    return "marketing";
  }
  if (/\b(auth|account|tenant|domain|subdomain|security|trust|permission|verified|sender)\b/.test(text)) {
    return "security-trust";
  }
  if (/\b(ios|android|mobile|simulator|emulator)\b/.test(text)) return "mobile-admin";
  if (/\b(audience|email|subscriber|sequence|broadcast|import|export|consent|suppression|crm|sender)\b/.test(text)) {
    return "audience-email";
  }
  if (/\b(analytics|experiment|affiliate|referral|attribution|conversion|cohort|growth|notification)\b/.test(text)) {
    return "analytics-growth";
  }
  if (/\b(funnel|checkout|offer|order bump|upsell|downsell|product|entitlement|commerce|payment|stripe|billing|subscription)\b/.test(text)) {
    return "product-commerce";
  }
  if (/\b(agent|mcp|manifest|llms|source-data|source data|contract|chatgpt|claude)\b/.test(text)) {
    return "agent-readiness";
  }
  if (/\b(cloudflare|d1|deploy|ci|migration|runtime|worker|infrastructure|platform)\b/.test(text)) {
    return "infrastructure";
  }
  return "operations-control";
}

function workstreamForRoadmap(item: AdminRoadmapRecord): DirectorWorkstreamId {
  const roadmapText = normalizeText(`${item.title} ${item.summary} ${item.nextMilestone}`);
  if (/\b(analytics|experiment|affiliate|referral|attribution|conversion|cohort)\b/.test(roadmapText)) {
    return "analytics-growth";
  }
  const mapped = groupToWorkstream.get(item.groupName.toLowerCase());
  if (mapped) return mapped;
  return workstreamFromText(`${item.title} ${item.summary} ${item.nextMilestone} ${item.groupName}`);
}

function workstreamForWorkLog(entry: AdminWorkLogEntry): DirectorWorkstreamId {
  return workstreamFromText(
    [
      entry.title,
      entry.promptFromMark,
      entry.featuresUpdated.join(" "),
      entry.roadmapUpdated.join(" "),
      entry.userJourneysUpdated.join(" "),
      entry.documentationUpdated.join(" "),
      entry.relevantUrls.join(" "),
      entry.githubIssues.map((issue) => issue.title ?? issue.label ?? issue.url).join(" "),
      entry.closedPrs.map((pr) => pr.title ?? pr.label ?? pr.url).join(" "),
    ].join(" "),
  );
}

function workstreamForAttention(item: MarkAttentionItem): DirectorWorkstreamId {
  return workstreamFromText(
    [
      item.title,
      item.summary,
      item.details ?? "",
      item.requiredAction ?? "",
      item.links.map((link) => link.title ?? link.label ?? link.url).join(" "),
    ].join(" "),
  );
}

function issueLink(number: number | null): DirectorEvidenceLink[] {
  return number
    ? [{ source: "issue", number, label: `Issue #${number}`, url: `https://github.com/markitics/bumpgrade/issues/${number}`, kind: "issue" }]
    : [];
}

function prLinks(entry: AdminWorkLogEntry): DirectorEvidenceLink[] {
  return entry.closedPrs.map((pr) => ({ ...pr, source: "pr" as const, kind: pr.kind ?? "pr" }));
}

function roadmapInitiative(item: AdminRoadmapRecord): DirectorInitiative {
  return {
    id: item.id,
    title: item.title,
    status: item.status,
    summary: item.summary,
    updatedAt: item.updatedAt,
    evidence: [
      ...issueLink(item.issueNumber),
      ...item.publicEvidence.slice(0, 3).map((evidence, index) => ({
        source: "roadmap" as const,
        label: `Evidence ${index + 1}`,
        url: evidence.startsWith("http") ? evidence : `/admin/roadmap/source-data#${item.id}`,
        kind: evidence.startsWith("http") ? "route" : "note",
      })),
    ],
  };
}

function roadmapAttentionInitiative(item: AdminRoadmapRecord, status: DirectorInitiative["status"]): DirectorInitiative {
  return {
    ...roadmapInitiative(item),
    status,
    summary: item.markAttention ?? item.summary,
  };
}

function workLogInitiative(entry: AdminWorkLogEntry): DirectorInitiative {
  const primaryIssue = entry.githubIssues[0];
  return {
    id: entry.id,
    title: entry.title,
    status: "shipped_change",
    summary: entry.promptFromMark,
    updatedAt: entry.completedAt,
    evidence: [
      ...(primaryIssue ? [{ ...primaryIssue, source: "issue" as const, kind: primaryIssue.kind ?? "issue" }] : []),
      ...prLinks(entry).slice(0, 3),
      ...entry.relevantUrls.slice(0, 3).map((url) => ({
        source: "work-log" as const,
        label: url.replace("https://bumpgrade.com", "") || "bumpgrade.com",
        url,
        kind: "route",
      })),
    ],
  };
}

function attentionInitiative(item: MarkAttentionItem): DirectorInitiative {
  return {
    id: item.id,
    title: item.title,
    status: "needs_mark",
    summary: item.requiredAction ?? item.summary,
    updatedAt: item.lastActivityAt,
    evidence: item.links.map((link) => ({ ...link, source: "attention" as const, kind: link.kind ?? "attention" })),
  };
}

function dedupeInitiatives<T extends DirectorInitiative>(items: T[], limit: number): T[] {
  const seen = new Set<string>();
  return items
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, limit);
}

function windowChange(entry: AdminWorkLogEntry): DirectorWindowChange {
  const workstreamId = workstreamForWorkLog(entry);
  return {
    ...workLogInitiative(entry),
    workstreamId,
    workstreamTitle: workstreamConfig[workstreamId].title,
    completedAt: entry.completedAt,
  };
}

function queueItem(
  workstream: DirectorWorkstream,
  item: DirectorInitiative,
  priority: DirectorQueuePriority,
  queueLabel: string,
  reason: string,
): DirectorQueueItem {
  return {
    ...item,
    workstreamId: workstream.id,
    workstreamTitle: workstream.title,
    priority,
    queueLabel,
    reason,
  };
}

function dedupeQueueItems(items: DirectorQueueItem[], limit: number) {
  const seen = new Set<string>();
  return items
    .filter((item) => {
      const key = `${item.workstreamId}:${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

function statusForCounts(counts: DirectorWorkstream["counts"]): DirectorStatus {
  if (counts.blocked > 0) return "blocked";
  if (counts.needsMark > 0 || counts.changedPastWeek > 8 || counts.active > 4) return "at_risk";
  if (counts.active > 0 || counts.pending > 0) return "on_track";
  if (counts.shipped > 0) return "done";
  return "quiet";
}

function focusForWorkstream(
  config: (typeof workstreamConfig)[DirectorWorkstreamId],
  active: DirectorInitiative[],
  pending: DirectorInitiative[],
  needsMark: DirectorInitiative[],
) {
  if (needsMark.length) return `Decision needed: ${needsMark[0].title}`;
  if (active.length) return active[0].title;
  if (pending.length) return pending[0].title;
  return config.description;
}

function buildExecutiveQueue(workstreams: DirectorWorkstream[]): DirectorQueueLane[] {
  const dueNow = dedupeQueueItems(
    workstreams.flatMap((workstream) => [
      ...workstream.needsMark.map((item) =>
        queueItem(workstream, item, "high", "Needs Mark", "Open decision or attention item."),
      ),
      ...workstream.blocked.map((item) => queueItem(workstream, item, "high", "Blocked", "Blocked roadmap item.")),
    ]),
    12,
  );
  const inFlight = dedupeQueueItems(
    workstreams.flatMap((workstream) =>
      workstream.inFlight.map((item) => queueItem(workstream, item, "medium", "In flight", "Active roadmap item.")),
    ),
    12,
  );
  const pendingNext = dedupeQueueItems(
    workstreams.flatMap((workstream) =>
      workstream.pending.map((item) => queueItem(workstream, item, "normal", "Pending next", "Committed or proposed roadmap item.")),
    ),
    12,
  );
  const watchlist = dedupeQueueItems(
    workstreams.flatMap((workstream) =>
      workstream.watchlist.map((item) => queueItem(workstream, item, "normal", "Watch", "Live roadmap caveat; not current due-now work.")),
    ),
    12,
  );

  return [
    {
      id: "due-now",
      label: "Due now",
      summary: "Current For-Mark decisions, roadmap blockers, and roadmap attention items to handle before more feature throughput.",
      items: dueNow,
    },
    {
      id: "in-flight",
      label: "In flight",
      summary: "Active roadmap work grouped by the executive workstream that owns the next brief.",
      items: inFlight,
    },
    {
      id: "pending-next",
      label: "Pending next",
      summary: "Committed or proposed roadmap work waiting behind active slices.",
      items: pendingNext,
    },
    {
      id: "watchlist",
      label: "Watchlist",
      summary: "Informational caveats on live roadmap items that should remain visible without becoming due today.",
      items: watchlist,
    },
  ];
}

export function buildDirectorStatusData(data: AdminSurfaceData, now = new Date()): DirectorStatusData {
  const nowTime = now.getTime();
  const windowCutoffs = new Map<DirectorWindowId, number>(
    directorWindows.map((window) => [window.id, nowTime - window.hours * 60 * 60 * 1000]),
  );
  const byWorkstream = new Map<
    DirectorWorkstreamId,
    {
      roadmap: AdminRoadmapRecord[];
      workLog: AdminWorkLogEntry[];
      attention: MarkAttentionItem[];
    }
  >(
    workstreamOrder.map((id) => [
      id,
      {
        roadmap: [],
        workLog: [],
        attention: [],
      },
    ]),
  );

  data.roadmapItems.forEach((item) => byWorkstream.get(workstreamForRoadmap(item))?.roadmap.push(item));
  data.workLogEntries.forEach((entry) => byWorkstream.get(workstreamForWorkLog(entry))?.workLog.push(entry));
  data.attentionItems.forEach((item) => byWorkstream.get(workstreamForAttention(item))?.attention.push(item));

  const workstreams = workstreamOrder.map<DirectorWorkstream>((id) => {
    const config = workstreamConfig[id];
    const bucket = byWorkstream.get(id) ?? { roadmap: [], workLog: [], attention: [] };
    const active = bucket.roadmap.filter((item) => item.status === "active").map(roadmapInitiative);
    const pending = bucket.roadmap.filter((item) => item.status === "pending" || item.status === "idea").map(roadmapInitiative);
    const shipped = bucket.roadmap.filter((item) => item.status === "live").map(roadmapInitiative);
    const blocked = bucket.roadmap.filter((item) => item.status === "blocked").map(roadmapInitiative);
    const roadmapAttentionItems = bucket.roadmap.filter((item) => Boolean(item.markAttention));
    const needsMark = [
      ...bucket.attention.filter((item) => item.state === "open" || item.state === "read").map(attentionInitiative),
      ...roadmapAttentionItems
        .filter((item) => item.status !== "live")
        .map((item) => roadmapAttentionInitiative(item, "needs_mark")),
    ];
    const watchlist = roadmapAttentionItems
      .filter((item) => item.status === "live")
      .map((item) => roadmapAttentionInitiative(item, item.status));
    const recentlyChanged = bucket.workLog
      .filter((entry) => parseTime(entry.completedAt) >= (windowCutoffs.get("past-7-days") ?? 0))
      .sort((a, b) => parseTime(b.completedAt) - parseTime(a.completedAt))
      .map(workLogInitiative);
    const changedPastDay = bucket.workLog.filter(
      (entry) => parseTime(entry.completedAt) >= (windowCutoffs.get("past-1-day") ?? 0),
    ).length;
    const changedPastWeek = bucket.workLog.filter(
      (entry) => parseTime(entry.completedAt) >= (windowCutoffs.get("past-7-days") ?? 0),
    ).length;
    const counts = {
      total: bucket.roadmap.length,
      active: active.length,
      pending: pending.length,
      shipped: shipped.length,
      blocked: blocked.length,
      changedPastDay,
      changedPastWeek,
      needsMark: needsMark.length,
    };

    return {
      id,
      title: config.title,
      executiveOwner: config.executiveOwner,
      description: config.description,
      status: statusForCounts(counts),
      currentFocus: focusForWorkstream(config, active, pending, needsMark),
      counts,
      recentlyChanged: dedupeInitiatives(recentlyChanged, 6),
      inFlight: dedupeInitiatives(active, 6),
      pending: dedupeInitiatives(pending, 6),
      shipped: dedupeInitiatives(shipped, 4),
      blocked: dedupeInitiatives(blocked, 4),
      needsMark: dedupeInitiatives(needsMark, 6),
      watchlist: dedupeInitiatives(watchlist, 4),
      sourceRecordIds: {
        roadmap: bucket.roadmap.map((item) => item.id),
        workLog: bucket.workLog.map((entry) => entry.id),
        attention: bucket.attention.map((item) => item.id),
      },
    };
  });

  const windows = directorWindows.map<DirectorWindow>((window) => {
    const cutoff = windowCutoffs.get(window.id) ?? 0;
    const entries = data.workLogEntries.filter((entry) => parseTime(entry.completedAt) >= cutoff);
    const changedWorkstreams = new Set(entries.map(workstreamForWorkLog)).size;
    const needsMark = entries.filter((entry) => Boolean(entry.flagsAttention)).length;
    const recentChanges = dedupeInitiatives(
      entries.sort((a, b) => parseTime(b.completedAt) - parseTime(a.completedAt)).map(windowChange),
      5,
    );
    return {
      id: window.id,
      label: window.label,
      hours: window.hours,
      since: new Date(cutoff).toISOString(),
      workLogEntries: entries.length,
      shippedPrs: entries.reduce((total, entry) => total + entry.closedPrs.length, 0),
      changedWorkstreams,
      needsMark,
      recentChanges,
    };
  });

  const statusCounts = workstreams.reduce(
    (acc, workstream) => {
      acc[workstream.status] += 1;
      return acc;
    },
    { on_track: 0, at_risk: 0, blocked: 0, done: 0, quiet: 0 },
  );

  return {
    id: "bumpgrade-director-status",
    generatedAt: now.toISOString(),
    source: data.source,
    loadError: data.loadError,
    windows,
    totals: {
      workstreams: workstreams.length,
      onTrack: statusCounts.on_track,
      atRisk: statusCounts.at_risk,
      blocked: statusCounts.blocked,
      done: statusCounts.done,
      quiet: statusCounts.quiet,
      changedPastDay: windows.find((window) => window.id === "past-1-day")?.workLogEntries ?? 0,
      changedPastWeek: windows.find((window) => window.id === "past-7-days")?.workLogEntries ?? 0,
      needsMark: workstreams.reduce((total, workstream) => total + workstream.counts.needsMark, 0),
    },
    executiveQueue: buildExecutiveQueue(workstreams),
    workstreams,
    sourceRoutes: [
      "/admin/director/source-data",
      "/admin/source-data",
      "/admin/work-log/source-data",
      "/admin/roadmap/source-data",
      "/admin/for-mark/source-data",
      "/admin/user-journeys/source-data",
    ],
    emailPolicy: {
      mode: "digest-first",
      summary:
        "Niche technical ships should roll into director status, source-data, PR comments, and work-log evidence unless Mark-visible action is needed.",
      immediateEmailOnlyFor: [
        "User-visible launches or production incidents",
        "Blocked work requiring Mark action",
        "Security, billing, auth, deploy, or data-risk changes",
        "Explicitly requested shipped notices",
      ],
      quietPath: [
        "PR comment",
        "/admin/work-log evidence",
        "/admin/director weekly summary",
        "Issue status update",
      ],
    },
  };
}
