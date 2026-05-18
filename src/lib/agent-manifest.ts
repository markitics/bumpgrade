import { site } from "@/lib/site";

export const agentManifestUpdatedAt = "2026-05-18";

export type AgentReadContract = {
  id: string;
  title: string;
  route: string;
  kind: "json" | "doc" | "api";
  auth: "public" | "owner-session" | "server-only";
  sourceOfTruth: string;
  stableIds: string[];
  safeForAgents: string[];
  writeBoundary: string;
};

export type AgentMcpPlan = {
  id: string;
  resourceOrTool: string;
  status: "planned" | "ready-contract";
  backedBy: string;
  purpose: string;
  safetyBoundary: string;
};

export type AgentDoc = {
  id: string;
  title: string;
  route: string;
  purpose: string;
  status: "live" | "planned";
  evidence: string[];
};

export type AgentSourceEvidenceRoute = {
  id: string;
  route: string;
  resolves: string;
  stableIds: string[];
  volatileClaims: string;
};

export type BoilerplateBaselineEvidence = {
  sourceRepo: string;
  sourceBranch: string;
  sourcePath: string;
  adoptedShape: string[];
};

export const agentDocs: AgentDoc[] = [
  {
    id: "doc-agent-index",
    title: "Agent docs index",
    route: "/agent-docs",
    purpose: "Human and agent-friendly index for Bumpgrade read contracts, source evidence, MCP direction, and safety boundaries.",
    status: "live",
    evidence: ["Issue #12", "public/llms.txt"],
  },
  {
    id: "doc-agent-surface",
    title: "Bumpgrade agent surface",
    route: "/agent-docs/bumpgrade-agent-surface",
    purpose: "Orientation for what agents can read, what is planned, and what requires owner credentials.",
    status: "live",
    evidence: ["Issue #12", "/agent-docs/source-data"],
  },
  {
    id: "doc-commerce-contract",
    title: "Bumpgrade commerce contract",
    route: "/agent-docs/bumpgrade-commerce-contract",
    purpose: "Stripe sandbox, checkout, webhook, billing, and confirmed-write safety boundaries.",
    status: "live",
    evidence: ["Issue #11", "Issue #34", "/commerce/source-data"],
  },
  {
    id: "doc-source-evidence",
    title: "Bumpgrade source evidence",
    route: "/agent-docs/bumpgrade-source-evidence",
    purpose: "How public claims resolve to source IDs, URLs, issues, PRs, work-log entries, and caveats.",
    status: "live",
    evidence: ["/compare/source-data", "/features/source-data", "/roadmap/source-data"],
  },
  {
    id: "doc-admin-surfaces",
    title: "Bumpgrade admin surfaces",
    route: "/agent-docs/bumpgrade-admin-surfaces",
    purpose: "Which admin pages require owner auth and which source-data routes are public-safe for agents.",
    status: "live",
    evidence: ["/admin/source-data", "docs/agent/admin-surfaces.md"],
  },
  {
    id: "doc-mcp-roadmap",
    title: "Bumpgrade MCP roadmap",
    route: "/agent-docs/bumpgrade-mcp",
    purpose: "First MCP resources and tools planned on top of the same public-safe contracts.",
    status: "live",
    evidence: ["Issue #12", "docs/agent/agent-ready.md"],
  },
];

export const agentReadContracts: AgentReadContract[] = [
  {
    id: "read-feature-catalog",
    title: "Feature catalog",
    route: "/features/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/feature-catalog.ts",
    stableIds: ["featureId", "issue", "status"],
    safeForAgents: ["Read feature status", "Distinguish live from pending", "Cite feature evidence"],
    writeBoundary: "Feature status changes must land through GitHub issue/PR work and admin work-log updates.",
  },
  {
    id: "read-public-roadmap",
    title: "Public roadmap",
    route: "/roadmap/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/roadmap.ts",
    stableIds: ["roadmapItemId", "featureId", "issue", "status"],
    safeForAgents: ["Read public-safe roadmap state", "Find blockers and next milestones", "Cite issue evidence"],
    writeBoundary: "Roadmap moves require an issue/PR or approved admin append path, not chat-only edits.",
  },
  {
    id: "read-comparisons",
    title: "Competitor comparisons and source evidence",
    route: "/compare/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/comparison-data.ts",
    stableIds: ["competitorId", "sourceId", "seoTargetId"],
    safeForAgents: ["Resolve competitor claims", "Read retrieved dates", "Cite official source URLs"],
    writeBoundary: "Refresh competitor claims from official sources before changing dated pricing, packaging, or feature claims.",
  },
  {
    id: "read-commerce-contract",
    title: "Commerce contract",
    route: "/commerce/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/commerce.ts and src/lib/sandbox-checkout.ts",
    stableIds: ["productId", "priceId", "checkoutIntentId", "auditCorrelationId"],
    safeForAgents: ["Read redacted commerce architecture", "Separate sandbox from live billing", "Inspect write safety rules"],
    writeBoundary: "Billing-impacting writes require exact confirmation, idempotency, stale-state checks, audit correlation, and webhook evidence.",
  },
  {
    id: "read-admin-source",
    title: "Admin source-data bundle",
    route: "/admin/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "D1 admin tables with fixture fallback in src/lib/admin-surface-data.ts",
    stableIds: ["workLogEntryId", "userJourneyId", "markAttentionId", "roadmapItemId"],
    safeForAgents: ["Read public-safe work-log entries", "Read user journeys", "Read Mark attention summaries"],
    writeBoundary: "Human admin pages require Better Auth; agent writes need approved scripts or future confirmed APIs.",
  },
  {
    id: "read-agent-manifest",
    title: "Agent manifest",
    route: "/agent-docs/source-data",
    kind: "json",
    auth: "public",
    sourceOfTruth: "src/lib/agent-manifest.ts",
    stableIds: ["readContractId", "mcpPlanId", "agentDocId"],
    safeForAgents: ["Discover read contracts", "Route to source-data APIs", "Understand write boundaries"],
    writeBoundary: "This route is read-only until confirmed-write agent APIs exist.",
  },
];

export const agentSourceEvidenceRoutes: AgentSourceEvidenceRoute[] = [
  {
    id: "evidence-features",
    route: "/features/source-data",
    resolves: "Bumpgrade feature status, audience, expected capabilities, issue ownership, and agent contract notes.",
    stableIds: ["featureId", "issue"],
    volatileClaims: "Feature records must not be described as live unless status is live and issue/PR evidence supports it.",
  },
  {
    id: "evidence-roadmap",
    route: "/roadmap/source-data",
    resolves: "Public roadmap item status, blocker notes, next milestones, issue links, and public evidence.",
    stableIds: ["roadmapItemId", "featureId", "issue"],
    volatileClaims: "Roadmap lane changes should come from merged issue work or explicit admin updates.",
  },
  {
    id: "evidence-comparisons",
    route: "/compare/source-data",
    resolves: "Competitor records, official source URLs, retrieval dates, SEO targets, and caveats.",
    stableIds: ["competitorId", "sourceId", "seoTargetId"],
    volatileClaims: "Pricing, packaging, integrations, and feature availability require a fresh source refresh before citation.",
  },
  {
    id: "evidence-admin",
    route: "/admin/source-data",
    resolves: "Public-safe admin roadmap, work-log, user-journey, and Mark-attention records.",
    stableIds: ["workLogEntryId", "userJourneyId", "markAttentionId", "roadmapItemId"],
    volatileClaims: "Private notes and owner-only decisions stay behind Better Auth or approved scripts.",
  },
  {
    id: "evidence-commerce",
    route: "/commerce/source-data",
    resolves: "Redacted commerce architecture, sandbox checkout offer, payment tables, webhook rules, and billing write safety.",
    stableIds: ["productId", "priceId", "checkoutIntentId", "auditCorrelationId"],
    volatileClaims: "Live payment capability is not enabled until a separate rollout and webhook smoke evidence prove it.",
  },
  {
    id: "evidence-agent-manifest",
    route: "/agent-docs/source-data",
    resolves: "Agent doc links, read contracts, evidence routes, MCP plan, and write-safety rules.",
    stableIds: ["agentDocId", "readContractId", "mcpPlanId", "evidenceRouteId"],
    volatileClaims: "The manifest is discovery metadata; it does not grant write permission.",
  },
];

export const agentMcpPlan: AgentMcpPlan[] = [
  {
    id: "mcp-resource-features",
    resourceOrTool: "resource bumpgrade://features",
    status: "ready-contract",
    backedBy: "/features/source-data",
    purpose: "Expose feature IDs, statuses, issues, evidence, and agent-contract notes.",
    safetyBoundary: "Read-only; feature status changes still happen through issue/PR/admin workflows.",
  },
  {
    id: "mcp-resource-roadmap",
    resourceOrTool: "resource bumpgrade://roadmap",
    status: "ready-contract",
    backedBy: "/roadmap/source-data",
    purpose: "Expose roadmap lanes, public evidence, blockers, and next milestones.",
    safetyBoundary: "Read-only until a confirmed roadmap update API exists.",
  },
  {
    id: "mcp-resource-claims",
    resourceOrTool: "tool resolve_public_claim",
    status: "planned",
    backedBy: "/compare/source-data, /features/source-data, /roadmap/source-data, /admin/work-log/source-data",
    purpose: "Resolve a public claim to source IDs, URLs, issues, PRs, and work-log evidence.",
    safetyBoundary: "Must return caveats when evidence is stale, missing, planned-only, or private.",
  },
  {
    id: "mcp-resource-commerce",
    resourceOrTool: "resource bumpgrade://commerce",
    status: "ready-contract",
    backedBy: "/commerce/source-data",
    purpose: "Expose redacted commerce architecture, sandbox checkout status, and billing write rules.",
    safetyBoundary: "No live billing or destructive action may be performed by this resource.",
  },
  {
    id: "mcp-tool-propose-update",
    resourceOrTool: "tool propose_admin_update",
    status: "planned",
    backedBy: "/admin/source-data and future confirmed-write APIs",
    purpose: "Create proposed feature, roadmap, journey, or work-log updates for owner review.",
    safetyBoundary: "Requires actor identity, confirmation text, idempotency key, stale-state check, and audit correlation before writing.",
  },
];

export const agentWriteSafetyRules = [
  "Prefer source-data routes and manifests over browser automation when a server-side contract exists.",
  "Do not invent pricing, customer, integration, roadmap, shipped-feature, testimonial, or competitor facts.",
  "Cite stable IDs, issue/PR/work-log evidence, source URLs, and retrieved dates for public claims.",
  "Keep secrets, raw provider IDs, private user data, private inbox bodies, and storage keys out of prompt-visible output.",
  "Require confirmation, idempotency, stale-state checks, audit correlation, and redaction for public, destructive, billing-impacting, moderation, source-editing, publishing, or creator-speech writes.",
  "Distinguish planned architecture, sandbox behavior, and live production capability.",
];

export const boilerplateBaselineEvidence: BoilerplateBaselineEvidence = {
  sourceRepo: "markitics/laurelharned",
  sourceBranch: "new-project-codex-boilerplate",
  sourcePath: "docs/new-project-codex-boilerplate",
  adoptedShape: [
    "AGENTS.md is adapted with Bumpgrade project constants, Cloudflare-first stack, required product surfaces, and Bumpgrade Codex email identity.",
    "docs/working-agreements.md carries the issue/branch/PR, screenshot, validation, work-log, and Mark-attention workflow.",
    "docs/agent/* carries admin-surface, agent-ready, screenshot, work-log, and user-journey rules.",
    "docs/keep-working/* carries the repo-tracked goal-runner and status-update skills.",
    "public/llms.txt points agents to current Bumpgrade feature, roadmap, comparison, commerce, admin, and agent-doc routes.",
  ],
};

export const agentManifest = {
  id: "bumpgrade-agent-manifest",
  generatedFrom: "src/lib/agent-manifest.ts",
  updatedAt: agentManifestUpdatedAt,
  site: site.url,
  caveat:
    "This manifest is public-safe. It exposes read contracts and planned MCP/tooling shape, not private admin data or permission to perform writes.",
  docs: agentDocs,
  readContracts: agentReadContracts,
  sourceEvidenceRoutes: agentSourceEvidenceRoutes,
  mcpPlan: agentMcpPlan,
  writeSafetyRules: agentWriteSafetyRules,
  boilerplateBaselineEvidence,
};
