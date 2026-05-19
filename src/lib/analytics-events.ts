export const analyticsEventCaptureUpdatedAt = "2026-05-19";

export const analyticsEventCaptureApiRoute = "/api/analytics/events";

export const analyticsFunnelPageViewBeaconIssue = 121;
export const analyticsFunnelPageViewVariantIssue = 123;

export const analyticsEventCaptureWriteContract = {
  id: "analytics-event-capture-contract",
  status: "event-capture-and-beacon-ready",
  issue: analyticsFunnelPageViewBeaconIssue,
  parentIssue: 18,
  apiRoute: analyticsEventCaptureApiRoute,
  tables: ["analytics_events", "analytics_event_ingestions"],
  publicSafeFields: [
    "analyticsEventId",
    "eventDefinitionId",
    "eventKind",
    "sourceRoute",
    "publicProperties",
    "duplicate",
    "status",
  ],
  serverPrivateFields: [
    "client_correlation_hash",
    "ip_hash",
    "user_agent_hash",
    "request_hash",
    "metadata_json",
    "raw cookies",
    "raw contact identifiers",
    "raw UTM payload",
  ],
  writeBoundary:
    "Issues #105 and #121 can capture seeded analytics events with idempotency, source-route validation, hashed request evidence, bot/preview suppression, browser-side funnel page-view beacons, and public-safe responses. Cookie assignment, contact-level reporting, arbitrary custom events, campaign attribution mutation, A/B traffic routing, automated decisions, and direct agent analytics writes require future confirmed-write APIs.",
};

export const analyticsFunnelPageViewBeaconContract = {
  id: "analytics-funnel-page-view-beacon-contract",
  status: "variant-linked-page-view-beacon-ready",
  issue: analyticsFunnelPageViewVariantIssue,
  parentIssue: 18,
  sourceRoute: "/funnels/indie-launch-sandbox",
  apiRoute: analyticsEventCaptureApiRoute,
  assignmentApiRoute: "/api/analytics/assignments",
  eventDefinitionId: "event-funnel-page-view",
  experimentId: "experiment-opt-in-hero-promise",
  storage: "sessionStorage-scoped idempotency and anonymous key only; no cookie assignment",
  suppressedTraffic: ["known bot user agents", "known crawler user agents", "explicit preview/test suppression flags"],
  publicSafeFields: [
    "route",
    "funnelId",
    "stepId",
    "variantId",
    "eventDefinitionId",
    "sourceRoute",
    "status",
    "duplicate",
  ],
  serverPrivateFields: [
    "anonymous session key before hashing",
    "raw IP address",
    "raw user agent",
    "raw referrer",
    "cookies",
    "contact identifiers",
  ],
  writeBoundary:
    "Issues #121 and #123 record a seeded funnel page-view event from the public funnel preview once per browser session and step using the existing seeded analytics event API, and attach deterministic seeded variant evidence when assignment succeeds. It does not create cookies, route A/B traffic, expose raw visitors, assign contact identity, or make automated optimization decisions.",
};

export type AnalyticsEventCaptureDefinition = {
  id: string;
  kind: string;
  sourceRoute: string;
  publicProperties: string[];
};

export type AnalyticsEventRecordInput = {
  eventDefinitionId: string;
  sourceRoute: string;
  idempotencyKey: string;
  publicProperties?: Record<string, unknown>;
  anonymousId?: string | null;
  privateCorrelationId?: string | null;
  requestIp?: string | null;
  userAgent?: string | null;
};

type AnalyticsSuppressionReason = "bot_or_crawler" | "preview_or_test";

type AnalyticsEventRow = {
  id: string;
  event_definition_id: string;
  event_kind: string;
  source_route: string;
  public_properties_json: string | null;
};

type AnalyticsEventResult =
  | {
      ok: true;
      duplicate: boolean;
      status: "recorded";
      analyticsEventId: string;
      eventDefinitionId: string;
      eventKind: string;
      sourceRoute: string;
      publicProperties: Record<string, string | number | boolean | null>;
      privateDataIncluded: false;
      rawRequestDataIncluded: false;
    }
  | {
      ok: true;
      duplicate: false;
      recorded: false;
      status: "ignored";
      ignoredReason: AnalyticsSuppressionReason;
      eventDefinitionId: string;
      eventKind: string;
      sourceRoute: string;
      publicProperties: Record<string, string | number | boolean | null>;
      privateDataIncluded: false;
      rawRequestDataIncluded: false;
    }
  | {
      ok: false;
      status: number;
      code: string;
      message: string;
    };

export async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function optionalHash(value: string | null | undefined) {
  if (!value) return null;
  return sha256Hex(value);
}

function parsePublicProperties(value: string | null) {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, string | number | boolean | null>)
      : {};
  } catch {
    return {};
  }
}

function publicResult(row: AnalyticsEventRow, duplicate: boolean): AnalyticsEventResult {
  return {
    ok: true,
    duplicate,
    status: "recorded",
    analyticsEventId: row.id,
    eventDefinitionId: row.event_definition_id,
    eventKind: row.event_kind,
    sourceRoute: row.source_route,
    publicProperties: parsePublicProperties(row.public_properties_json),
    privateDataIncluded: false,
    rawRequestDataIncluded: false,
  };
}

function ignoredResult(
  definition: AnalyticsEventCaptureDefinition,
  publicProperties: Record<string, string | number | boolean | null>,
  ignoredReason: AnalyticsSuppressionReason,
): AnalyticsEventResult {
  return {
    ok: true,
    duplicate: false,
    recorded: false,
    status: "ignored",
    ignoredReason,
    eventDefinitionId: definition.id,
    eventKind: definition.kind,
    sourceRoute: definition.sourceRoute,
    publicProperties,
    privateDataIncluded: false,
    rawRequestDataIncluded: false,
  };
}

function normalizeIdempotencyKey(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, 180);
}

function safePrimitive(value: unknown): string | number | boolean | null | undefined {
  if (value === null) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, 240) : null;
  }
  return undefined;
}

function safePublicProperties(
  definition: AnalyticsEventCaptureDefinition,
  value: Record<string, unknown> | undefined,
) {
  const source = value ?? {};
  const safe: Record<string, string | number | boolean | null> = {};
  for (const key of definition.publicProperties) {
    const primitive = safePrimitive(source[key]);
    if (primitive !== undefined) {
      safe[key] = primitive;
    }
  }
  return safe;
}

function suppressionFlagValue(value: unknown) {
  if (value === true) return true;
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "preview";
}

function explicitPreviewSuppression(value: Record<string, unknown> | undefined) {
  if (!value) return false;
  return (
    suppressionFlagValue(value.preview) ||
    suppressionFlagValue(value.previewMode) ||
    suppressionFlagValue(value.testMode) ||
    suppressionFlagValue(value.suppressAnalytics) ||
    suppressionFlagValue(value.analyticsSuppressed)
  );
}

function isKnownBotUserAgent(userAgent: string | null | undefined) {
  if (!userAgent) return false;
  const normalized = userAgent.toLowerCase();
  return [
    "bot",
    "crawler",
    "spider",
    "slurp",
    "bingpreview",
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
    "slackbot",
    "discordbot",
    "telegrambot",
    "whatsapp",
    "yandex",
    "baiduspider",
    "duckduckbot",
  ].some((needle) => normalized.includes(needle));
}

function analyticsSuppressionReason(input: AnalyticsEventRecordInput): AnalyticsSuppressionReason | null {
  if (explicitPreviewSuppression(input.publicProperties)) return "preview_or_test";
  if (isKnownBotUserAgent(input.userAgent)) return "bot_or_crawler";
  return null;
}

function stringProperty(properties: Record<string, string | number | boolean | null>, key: string) {
  const value = properties[key];
  return typeof value === "string" ? value : null;
}

function integerProperty(properties: Record<string, string | number | boolean | null>, key: string) {
  const value = properties[key];
  return Number.isInteger(value) ? value : null;
}

async function findAnalyticsEventByIdempotency(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT id, event_definition_id, event_kind, source_route, public_properties_json
       FROM analytics_events
       WHERE idempotency_key = ?`,
    )
    .bind(idempotencyKey)
    .first<AnalyticsEventRow>();
}

export async function recordAnalyticsEvent(
  db: D1Database,
  definitions: AnalyticsEventCaptureDefinition[],
  input: AnalyticsEventRecordInput,
): Promise<AnalyticsEventResult> {
  const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);
  if (!idempotencyKey) {
    return {
      ok: false,
      status: 400,
      code: "idempotency_required",
      message: "An idempotency key is required for analytics event capture.",
    };
  }

  const existing = await findAnalyticsEventByIdempotency(db, idempotencyKey);
  if (existing) {
    return publicResult(existing, true);
  }

  const definition = definitions.find((candidate) => candidate.id === input.eventDefinitionId);
  if (!definition) {
    return {
      ok: false,
      status: 400,
      code: "unsupported_event",
      message: "Only seeded analytics event definitions can be captured.",
    };
  }

  if (definition.sourceRoute !== input.sourceRoute) {
    return {
      ok: false,
      status: 400,
      code: "unsupported_source_route",
      message: "The analytics event source route does not match the seeded event definition.",
    };
  }

  const publicProperties = safePublicProperties(definition, input.publicProperties);
  const suppressionReason = analyticsSuppressionReason(input);
  if (suppressionReason) {
    return ignoredResult(definition, publicProperties, suppressionReason);
  }

  const analyticsEventId = `analytics-event-${crypto.randomUUID()}`;
  const publicPropertiesJson = JSON.stringify(publicProperties);
  const requestHash = await sha256Hex(
    JSON.stringify({
      eventDefinitionId: definition.id,
      sourceRoute: definition.sourceRoute,
      publicProperties,
      idempotencyKey,
    }),
  );
  const clientCorrelationHash = await optionalHash(input.privateCorrelationId ?? input.anonymousId ?? null);
  const ipHash = await optionalHash(input.requestIp);
  const userAgentHash = await optionalHash(input.userAgent);

  await db
    .prepare(
      `INSERT INTO analytics_events (
        id, event_definition_id, event_kind, source_route, idempotency_key,
        funnel_id, funnel_step_id, form_id, product_id, price_id, variant_id,
        amount_cents, currency, public_properties_json, client_correlation_hash,
        ip_hash, user_agent_hash, metadata_json, occurred_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      analyticsEventId,
      definition.id,
      definition.kind,
      definition.sourceRoute,
      idempotencyKey,
      stringProperty(publicProperties, "funnelId"),
      stringProperty(publicProperties, "stepId"),
      stringProperty(publicProperties, "formId"),
      stringProperty(publicProperties, "productId"),
      stringProperty(publicProperties, "priceId"),
      stringProperty(publicProperties, "variantId"),
      integerProperty(publicProperties, "amountCents"),
      stringProperty(publicProperties, "currency"),
      publicPropertiesJson,
      clientCorrelationHash,
      ipHash,
      userAgentHash,
      JSON.stringify({ issue: 105, privateDataIncluded: false, rawRequestDataIncluded: false }),
    )
    .run();

  await db
    .prepare(
      `INSERT OR IGNORE INTO analytics_event_ingestions (
        id, idempotency_key, analytics_event_id, event_definition_id, status, request_hash, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'recorded', ?, unixepoch(), unixepoch())`,
    )
    .bind(`analytics-ingestion-${crypto.randomUUID()}`, idempotencyKey, analyticsEventId, definition.id, requestHash)
    .run();

  const row = await findAnalyticsEventByIdempotency(db, idempotencyKey);
  if (!row) {
    return {
      ok: false,
      status: 500,
      code: "event_not_recorded",
      message: "The analytics event could not be recorded.",
    };
  }

  return publicResult(row, false);
}
