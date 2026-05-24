"use client";

export const analyticsAnonymousStorageKey = "bumpgrade.analytics.anonymous-session.v1";
export const analyticsAssignmentStoragePrefix = "bumpgrade.analytics.assignment.v1";

type AssignmentResponse = {
  ok?: boolean;
  status?: string;
  variantId?: unknown;
};

const assignmentRequests = new Map<string, Promise<string | null>>();

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

export async function assignSeededExperimentVariant(
  experimentId: string,
  sourceRoute: string,
  anonymousAssignmentKey: string,
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
    }),
  })
    .then(async (response) => {
      if (!response.ok) return null;
      const result = (await response.json()) as AssignmentResponse;
      return result.ok && typeof result.variantId === "string" ? result.variantId : null;
    })
    .catch(() => null);

  assignmentRequests.set(requestKey, request);
  return request;
}
