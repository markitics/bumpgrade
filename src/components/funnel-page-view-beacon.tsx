"use client";

import { useEffect } from "react";

type FunnelBeaconStep = {
  stepId: string;
  routeAnchor: string;
};

type FunnelPageViewBeaconProps = {
  eventDefinitionId: string;
  experimentId: string;
  sourceRoute: string;
  funnelId: string;
  steps: FunnelBeaconStep[];
};

const anonymousStorageKey = "bumpgrade.analytics.anonymous-session.v1";
const beaconStoragePrefix = "bumpgrade.analytics.funnel-page-view.v1";
const assignmentStoragePrefix = "bumpgrade.analytics.assignment.v1";
const attributionParamMap = [
  ["utm_source", "utmSource"],
  ["utm_medium", "utmMedium"],
  ["utm_campaign", "utmCampaign"],
  ["utm_content", "utmContent"],
  ["utm_term", "utmTerm"],
] as const;

type AssignmentResponse = {
  ok?: boolean;
  status?: string;
  variantId?: unknown;
};

function randomId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sessionValue(key: string, prefix: string) {
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

function stepForHash(steps: FunnelBeaconStep[]) {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    const matched = steps.find((step) => step.routeAnchor === hash);
    if (matched) return matched;
  }
  return steps[0] ?? null;
}

function shouldSkipBeacon() {
  const params = new URLSearchParams(window.location.search);
  return params.get("bumpgrade_analytics") === "off" || params.get("preview") === "true";
}

function safeAttributionValue(value: string | null) {
  if (!value) return null;
  const normalized = value.trim().replace(/\s+/g, " ").slice(0, 120);
  if (!normalized || /:\/\/|[?&#=]/.test(normalized)) return null;
  return normalized;
}

function safeReferrerHost() {
  if (!document.referrer) return null;
  try {
    const referrerUrl = new URL(document.referrer);
    if (referrerUrl.hostname === window.location.hostname) return null;
    return referrerUrl.hostname.toLowerCase().slice(0, 120);
  } catch {
    return null;
  }
}

function attributionProperties() {
  const params = new URLSearchParams(window.location.search);
  const properties: Record<string, string> = {};
  for (const [paramName, propertyName] of attributionParamMap) {
    const safeValue = safeAttributionValue(params.get(paramName));
    if (safeValue) properties[propertyName] = safeValue;
  }

  const referrerHost = safeReferrerHost();
  if (referrerHost) properties.referrerHost = referrerHost;
  return properties;
}

async function assignVariant(experimentId: string, sourceRoute: string, anonymousId: string) {
  const idempotencyKey = sessionValue(`${assignmentStoragePrefix}.${experimentId}`, "experiment-assignment");
  if (!idempotencyKey) return null;

  try {
    const response = await fetch("/api/analytics/assignments", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        experimentId,
        sourceRoute,
        anonymousAssignmentKey: anonymousId,
        idempotencyKey,
      }),
    });
    if (!response.ok) return null;
    const result = (await response.json()) as AssignmentResponse;
    return result.ok && typeof result.variantId === "string" ? result.variantId : null;
  } catch {
    return null;
  }
}

export function FunnelPageViewBeacon({
  eventDefinitionId,
  experimentId,
  sourceRoute,
  funnelId,
  steps,
}: FunnelPageViewBeaconProps) {
  useEffect(() => {
    if (shouldSkipBeacon()) return undefined;

    const recordCurrentStep = async () => {
      const step = stepForHash(steps);
      if (!step) return;

      const anonymousId = sessionValue(anonymousStorageKey, "anonymous-session");
      const idempotencyKey = sessionValue(`${beaconStoragePrefix}.${funnelId}.${step.stepId}`, "funnel-page-view");
      if (!anonymousId || !idempotencyKey) return;
      const variantId = await assignVariant(experimentId, sourceRoute, anonymousId);
      const attribution = attributionProperties();

      void fetch("/api/analytics/events", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        keepalive: true,
        body: JSON.stringify({
          eventDefinitionId,
          sourceRoute,
          idempotencyKey,
          anonymousId,
          publicProperties: {
            route: sourceRoute,
            funnelId,
            stepId: step.stepId,
            ...(variantId ? { variantId } : {}),
            ...attribution,
          },
        }),
      }).catch(() => {
        // The server-rendered funnel preview remains usable if telemetry is blocked.
      });
    };

    void recordCurrentStep();
    const onHashChange = () => {
      void recordCurrentStep();
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [eventDefinitionId, experimentId, funnelId, sourceRoute, steps]);

  return null;
}
