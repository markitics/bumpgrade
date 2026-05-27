"use client";

export const analyticsAnonymousStorageKey = "bumpgrade.analytics.anonymous-session.v1";
export const analyticsAssignmentStoragePrefix = "bumpgrade.analytics.assignment.v1";

type AssignmentResponse = {
  ok?: boolean;
  status?: string;
  variantId?: unknown;
  customRoutingRuleId?: unknown;
  customRoutingRuleMatched?: unknown;
  winnerRolloutId?: unknown;
  winnerRolloutMatched?: unknown;
};

export type AnalyticsBrowserRoutingContext = {
  utmSource?: string | null;
  utmCampaign?: string | null;
  referrerHost?: string | null;
};

export type AnalyticsBrowserAssignmentResult = {
  variantId: string;
  customRoutingRuleId: string | null;
  customRoutingRuleMatched: boolean;
  winnerRolloutId: string | null;
  winnerRolloutMatched: boolean;
};

const assignmentRequests = new Map<string, Promise<AnalyticsBrowserAssignmentResult | null>>();
const attributionParamMap = [
  ["utm_source", "utmSource"],
  ["utm_medium", "utmMedium"],
  ["utm_campaign", "utmCampaign"],
  ["utm_content", "utmContent"],
  ["utm_term", "utmTerm"],
] as const;

function randomId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function analyticsSessionValue(key: string, prefix: string) {
  try {
    const existing = window.sessionStorage.getItem(key);
    if (existing) return existing;
    const next = randomId(prefix);
    window.sessionStorage.setItem(key, next);
    return next;
  } catch {
    return null;
  }
}

export function shouldSkipAnalyticsBrowserWork() {
  const params = new URLSearchParams(window.location.search);
  return params.get("bumpgrade_analytics") === "off" || params.get("preview") === "true";
}

export function safeAnalyticsAttributionValue(value: string | null) {
  if (!value) return null;
  const normalized = value.trim().replace(/\s+/g, " ").slice(0, 120);
  if (!normalized || /:\/\/|[?&#=]/.test(normalized)) return null;
  return normalized;
}

export function safeAnalyticsReferrerHost() {
  if (!document.referrer) return null;
  try {
    const referrerUrl = new URL(document.referrer);
    if (referrerUrl.hostname === window.location.hostname) return null;
    return referrerUrl.hostname.toLowerCase().slice(0, 120);
  } catch {
    return null;
  }
}

export function analyticsAttributionProperties() {
  const params = new URLSearchParams(window.location.search);
  const properties: Record<string, string> = {};
  for (const [paramName, propertyName] of attributionParamMap) {
    const safeValue = safeAnalyticsAttributionValue(params.get(paramName));
    if (safeValue) properties[propertyName] = safeValue;
  }

  const referrerHost = safeAnalyticsReferrerHost();
  if (referrerHost) properties.referrerHost = referrerHost;
  return properties;
}

export function analyticsRoutingContextFromLocation(): AnalyticsBrowserRoutingContext {
  const attribution = analyticsAttributionProperties();
  return {
    utmSource: attribution.utmSource ?? null,
    utmCampaign: attribution.utmCampaign ?? null,
    referrerHost: attribution.referrerHost ?? null,
  };
}

export async function assignSeededExperimentVariantResult(
  experimentId: string,
  sourceRoute: string,
  anonymousAssignmentKey: string,
  routingContext?: AnalyticsBrowserRoutingContext,
) {
  const idempotencyKey = analyticsSessionValue(
    `${analyticsAssignmentStoragePrefix}.${experimentId}`,
    "experiment-assignment",
  );
  if (!idempotencyKey) return null;

  const requestKey = `${experimentId}:${sourceRoute}:${idempotencyKey}`;
  const existingRequest = assignmentRequests.get(requestKey);
  if (existingRequest) return existingRequest;

  const request = fetch("/api/analytics/assignments", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
    },
    keepalive: true,
    body: JSON.stringify({
      experimentId,
      sourceRoute,
      anonymousAssignmentKey,
      idempotencyKey,
      ...(routingContext ? { routingContext } : {}),
    }),
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const result = (await response.json()) as AssignmentResponse;
      if (!result.ok || typeof result.variantId !== "string") return null;
      return {
        variantId: result.variantId,
        customRoutingRuleId: typeof result.customRoutingRuleId === "string" ? result.customRoutingRuleId : null,
        customRoutingRuleMatched: result.customRoutingRuleMatched === true,
        winnerRolloutId: typeof result.winnerRolloutId === "string" ? result.winnerRolloutId : null,
        winnerRolloutMatched: result.winnerRolloutMatched === true,
      };
    })
    .catch(() => null);

  assignmentRequests.set(requestKey, request);
  return request;
}

export async function assignSeededExperimentVariant(
  experimentId: string,
  sourceRoute: string,
  anonymousAssignmentKey: string,
  routingContext?: AnalyticsBrowserRoutingContext,
) {
  const result = await assignSeededExperimentVariantResult(
    experimentId,
    sourceRoute,
    anonymousAssignmentKey,
    routingContext,
  );
  return result?.variantId ?? null;
}
