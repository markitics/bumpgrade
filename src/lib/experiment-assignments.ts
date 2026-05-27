import { sha256Hex } from "@/lib/analytics-events";

export const analyticsExperimentAssignmentUpdatedAt = "2026-05-24";

export const analyticsExperimentAssignmentApiRoute = "/api/analytics/assignments";

export const analyticsExperimentAssignmentWriteContract = {
  id: "analytics-experiment-assignment-contract",
  status: "custom-routing-assignment-ready",
  issue: 107,
  parentIssue: 18,
  apiRoute: analyticsExperimentAssignmentApiRoute,
  tables: ["analytics_experiment_assignments"],
  publicSafeFields: [
    "experimentAssignmentId",
    "experimentId",
    "variantId",
    "assignmentBucket",
    "customRoutingRuleId",
    "customRoutingRuleMatched",
    "sourceRoute",
    "duplicate",
    "status",
  ],
  serverPrivateFields: [
    "visitor_key_hash",
    "assignment_hash",
    "ip_hash",
    "user_agent_hash",
    "request_hash",
    "metadata_json",
    "raw cookies",
    "raw contact identifiers",
    "raw visitor keys",
  ],
  writeBoundary:
    "Issue #107 can assign seeded experiment variants deterministically with idempotency, source-route validation, hashed visitor evidence, and public-safe responses. Issues #121 and #123 can call this assignment path from the seeded funnel page-view beacon using session-scoped storage, and issue #422 reuses the same assignment key for seeded sandbox funnel copy routing, public-safe source/campaign routing rules, and the baseline holdout. Cookie creation, contact-level reporting, automated winner decisions, raw routing exports, and direct agent experiment writes require future confirmed-write APIs.",
};

export type ExperimentAssignmentVariant = {
  id: string;
  trafficWeight: number;
};

export type ExperimentAssignmentRoutingSignal = "utmSource" | "utmCampaign" | "referrerHost";

export type ExperimentAssignmentCustomRoutingRule = {
  id: string;
  priority: number;
  signal: ExperimentAssignmentRoutingSignal;
  expectedValue: string;
  variantId: string;
};

export type ExperimentAssignmentDefinition = {
  id: string;
  linkedRoute: string;
  variants: ExperimentAssignmentVariant[];
  customRoutingRules?: ExperimentAssignmentCustomRoutingRule[];
};

export type ExperimentAssignmentRoutingContext = {
  utmSource?: string | null;
  utmCampaign?: string | null;
  referrerHost?: string | null;
};

export type ExperimentAssignmentInput = {
  experimentId: string;
  sourceRoute: string;
  anonymousAssignmentKey: string;
  idempotencyKey: string;
  routingContext?: ExperimentAssignmentRoutingContext;
  requestIp?: string | null;
  userAgent?: string | null;
};

type ExperimentAssignmentRow = {
  id: string;
  experiment_id: string;
  variant_id: string;
  source_route: string;
  assignment_bucket: number;
  metadata_json: string | null;
};

type ExperimentAssignmentResult =
  | {
      ok: true;
      duplicate: boolean;
      status: "assigned";
      experimentAssignmentId: string;
      experimentId: string;
      variantId: string;
      sourceRoute: string;
      assignmentBucket: number;
      customRoutingRuleId: string | null;
      customRoutingRuleMatched: boolean;
      privateDataIncluded: false;
      rawRequestDataIncluded: false;
      rawRoutingValuesIncluded: false;
    }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
    };

function normalizeIdempotencyKey(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, 180);
}

function normalizeAssignmentKey(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, 240);
}

function normalizeRoutingValue(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 120);
  if (!normalized || /:\/\/|[?&#=]/.test(normalized)) return null;
  return normalized;
}

function normalizeRoutingContext(input: ExperimentAssignmentRoutingContext | undefined) {
  return {
    utmSource: normalizeRoutingValue(input?.utmSource),
    utmCampaign: normalizeRoutingValue(input?.utmCampaign),
    referrerHost: normalizeRoutingValue(input?.referrerHost),
  };
}

function sourceRouteForExperiment(experiment: ExperimentAssignmentDefinition) {
  return experiment.linkedRoute.split("#")[0] ?? experiment.linkedRoute;
}

async function optionalHash(value: string | null | undefined) {
  if (!value) return null;
  return sha256Hex(value);
}

function assignmentMetadata(row: ExperimentAssignmentRow) {
  if (!row.metadata_json) return null;
  try {
    return JSON.parse(row.metadata_json) as {
      customRoutingRuleId?: unknown;
      customRoutingRuleMatched?: unknown;
    };
  } catch {
    return null;
  }
}

function publicResult(row: ExperimentAssignmentRow, duplicate: boolean): ExperimentAssignmentResult {
  const metadata = assignmentMetadata(row);
  const customRoutingRuleId =
    typeof metadata?.customRoutingRuleId === "string" && metadata.customRoutingRuleId.trim()
      ? metadata.customRoutingRuleId
      : null;
  return {
    ok: true,
    duplicate,
    status: "assigned",
    experimentAssignmentId: row.id,
    experimentId: row.experiment_id,
    variantId: row.variant_id,
    sourceRoute: row.source_route,
    assignmentBucket: row.assignment_bucket,
    customRoutingRuleId,
    customRoutingRuleMatched: Boolean(metadata?.customRoutingRuleMatched && customRoutingRuleId),
    privateDataIncluded: false,
    rawRequestDataIncluded: false,
    rawRoutingValuesIncluded: false,
  };
}

async function findAssignmentByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT id, experiment_id, variant_id, source_route, assignment_bucket, metadata_json
       FROM analytics_experiment_assignments
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<ExperimentAssignmentRow>();
}

function variantForBucket(experiment: ExperimentAssignmentDefinition, assignmentBucket: number) {
  const totalWeight = experiment.variants.reduce((total, variant) => total + Math.max(0, variant.trafficWeight), 0);
  if (totalWeight <= 0) return null;

  const scaledBucket = Math.floor((assignmentBucket / 100) * totalWeight);
  let cursor = 0;
  for (const variant of experiment.variants) {
    cursor += Math.max(0, variant.trafficWeight);
    if (scaledBucket < cursor) return variant;
  }
  return experiment.variants.at(-1) ?? null;
}

function customRoutingMatch(
  experiment: ExperimentAssignmentDefinition,
  input: ExperimentAssignmentRoutingContext | undefined,
) {
  const routingContext = normalizeRoutingContext(input);
  const rules = [...(experiment.customRoutingRules ?? [])].sort((left, right) => left.priority - right.priority);

  for (const rule of rules) {
    if (normalizeRoutingValue(rule.expectedValue) !== routingContext[rule.signal]) continue;
    const variant = experiment.variants.find((candidate) => candidate.id === rule.variantId);
    if (variant) return { rule, variant };
  }

  return null;
}

export async function experimentAssignmentBucket(experimentId: string, anonymousAssignmentKey: string) {
  const assignmentHash = await sha256Hex(`${experimentId}:${anonymousAssignmentKey}`);
  const firstBytes = Number.parseInt(assignmentHash.slice(0, 8), 16);
  return {
    assignmentHash,
    assignmentBucket: firstBytes % 100,
  };
}

export async function assignExperimentVariant(
  db: D1Database,
  experiments: ExperimentAssignmentDefinition[],
  input: ExperimentAssignmentInput,
): Promise<ExperimentAssignmentResult> {
  const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);
  if (!idempotencyKey) {
    return {
      ok: false,
      status: 400,
      code: "idempotency_required",
      message: "An idempotency key is required for experiment assignment.",
    };
  }

  const existing = await findAssignmentByIdempotency(db, idempotencyKey);
  if (existing) {
    return publicResult(existing, true);
  }

  const anonymousAssignmentKey = normalizeAssignmentKey(input.anonymousAssignmentKey);
  if (!anonymousAssignmentKey) {
    return {
      ok: false,
      status: 400,
      code: "assignment_key_required",
      message: "An anonymous assignment key is required for experiment assignment.",
    };
  }

  const experiment = experiments.find((candidate) => candidate.id === input.experimentId);
  if (!experiment) {
    return {
      ok: false,
      status: 400,
      code: "unsupported_experiment",
      message: "Only seeded experiment definitions can be assigned.",
    };
  }

  const expectedSourceRoute = sourceRouteForExperiment(experiment);
  if (expectedSourceRoute !== input.sourceRoute) {
    return {
      ok: false,
      status: 400,
      code: "unsupported_source_route",
      message: "The experiment assignment source route does not match the seeded experiment definition.",
    };
  }

  const { assignmentHash, assignmentBucket } = await experimentAssignmentBucket(experiment.id, anonymousAssignmentKey);
  const customMatch = customRoutingMatch(experiment, input.routingContext);
  const variant = customMatch?.variant ?? variantForBucket(experiment, assignmentBucket);
  if (!variant) {
    return {
      ok: false,
      status: 400,
      code: "assignment_unavailable",
      message: "The seeded experiment does not have assignable variant weights.",
    };
  }

  const experimentAssignmentId = `experiment-assignment-${crypto.randomUUID()}`;
  const visitorKeyHash = await sha256Hex(`${experiment.id}:${anonymousAssignmentKey}`);
  const ipHash = await optionalHash(input.requestIp);
  const userAgentHash = await optionalHash(input.userAgent);
  const requestHash = await sha256Hex(
    JSON.stringify({
      experimentId: experiment.id,
      sourceRoute: expectedSourceRoute,
      idempotencyKey,
      assignmentBucket,
      variantId: variant.id,
      customRoutingRuleId: customMatch?.rule.id ?? null,
      customRoutingRuleMatched: Boolean(customMatch),
    }),
  );

  await db
    .prepare(
      `INSERT INTO analytics_experiment_assignments (
        id, experiment_id, variant_id, source_route, idempotency_key,
        assignment_bucket, assignment_hash, visitor_key_hash, ip_hash,
        user_agent_hash, request_hash, metadata_json, assigned_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      experimentAssignmentId,
      experiment.id,
      variant.id,
      expectedSourceRoute,
      idempotencyKey,
      assignmentBucket,
      assignmentHash,
      visitorKeyHash,
      ipHash,
      userAgentHash,
      requestHash,
      JSON.stringify({
        issue: customMatch ? 422 : 107,
        privateDataIncluded: false,
        rawRequestDataIncluded: false,
        rawRoutingValuesIncluded: false,
        customRoutingRuleId: customMatch?.rule.id ?? null,
        customRoutingRuleMatched: Boolean(customMatch),
        routingSignalLabels: customMatch ? [customMatch.rule.signal] : [],
      }),
    )
    .run();

  const row = await findAssignmentByIdempotency(db, idempotencyKey);
  if (!row) {
    return {
      ok: false,
      status: 500,
      code: "assignment_not_recorded",
      message: "The experiment assignment could not be recorded.",
    };
  }

  return publicResult(row, false);
}
