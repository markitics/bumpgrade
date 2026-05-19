import { sha256Hex } from "@/lib/analytics-events";

export const analyticsExperimentAssignmentUpdatedAt = "2026-05-19";

export const analyticsExperimentAssignmentApiRoute = "/api/analytics/assignments";

export const analyticsExperimentAssignmentWriteContract = {
  id: "analytics-experiment-assignment-contract",
  status: "assignment-ready",
  issue: 107,
  parentIssue: 18,
  apiRoute: analyticsExperimentAssignmentApiRoute,
  tables: ["analytics_experiment_assignments"],
  publicSafeFields: [
    "experimentAssignmentId",
    "experimentId",
    "variantId",
    "assignmentBucket",
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
    "Issue #107 can assign seeded experiment variants deterministically with idempotency, source-route validation, hashed visitor evidence, and public-safe responses. Cookie creation, automatic page-view instrumentation, contact-level reporting, experiment traffic routing, winner decisions, and direct agent experiment writes require future confirmed-write APIs.",
};

export type ExperimentAssignmentVariant = {
  id: string;
  trafficWeight: number;
};

export type ExperimentAssignmentDefinition = {
  id: string;
  linkedRoute: string;
  variants: ExperimentAssignmentVariant[];
};

export type ExperimentAssignmentInput = {
  experimentId: string;
  sourceRoute: string;
  anonymousAssignmentKey: string;
  idempotencyKey: string;
  requestIp?: string | null;
  userAgent?: string | null;
};

type ExperimentAssignmentRow = {
  id: string;
  experiment_id: string;
  variant_id: string;
  source_route: string;
  assignment_bucket: number;
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
      privateDataIncluded: false;
      rawRequestDataIncluded: false;
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

function sourceRouteForExperiment(experiment: ExperimentAssignmentDefinition) {
  return experiment.linkedRoute.split("#")[0] ?? experiment.linkedRoute;
}

async function optionalHash(value: string | null | undefined) {
  if (!value) return null;
  return sha256Hex(value);
}

function publicResult(row: ExperimentAssignmentRow, duplicate: boolean): ExperimentAssignmentResult {
  return {
    ok: true,
    duplicate,
    status: "assigned",
    experimentAssignmentId: row.id,
    experimentId: row.experiment_id,
    variantId: row.variant_id,
    sourceRoute: row.source_route,
    assignmentBucket: row.assignment_bucket,
    privateDataIncluded: false,
    rawRequestDataIncluded: false,
  };
}

async function findAssignmentByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT id, experiment_id, variant_id, source_route, assignment_bucket
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
  const variant = variantForBucket(experiment, assignmentBucket);
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
      JSON.stringify({ issue: 107, privateDataIncluded: false, rawRequestDataIncluded: false }),
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
