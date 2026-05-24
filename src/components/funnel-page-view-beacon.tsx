"use client";

import { useEffect } from "react";

import {
  analyticsAnonymousStorageKey,
  analyticsSessionValue,
  assignSeededExperimentVariant,
  shouldSkipAnalyticsBrowserWork,
} from "@/lib/analytics-browser-session";

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

const beaconStoragePrefix = "bumpgrade.analytics.funnel-page-view.v1";
const attributionParamMap = [
  ["utm_source", "utmSource"],
  ["utm_medium", "utmMedium"],
  ["utm_campaign", "utmCampaign"],
  ["utm_content", "utmContent"],
  ["utm_term", "utmTerm"],
] as const;

function stepForHash(steps: FunnelBeaconStep[]) {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    const matched = steps.find((step) => step.routeAnchor === hash);
    if (matched) return matched;
  }
  return steps[0] ?? null;
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

export function FunnelPageViewBeacon({
  eventDefinitionId,
  experimentId,
  sourceRoute,
  funnelId,
  steps,
}: FunnelPageViewBeaconProps) {
  useEffect(() => {
    if (shouldSkipAnalyticsBrowserWork()) return undefined;

    const recordCurrentStep = async () => {
      const step = stepForHash(steps);
      if (!step) return;

      const anonymousId = analyticsSessionValue(analyticsAnonymousStorageKey, "anonymous-session");
      const idempotencyKey = analyticsSessionValue(`${beaconStoragePrefix}.${funnelId}.${step.stepId}`, "funnel-page-view");
      if (!anonymousId || !idempotencyKey) return;
      const variantId = await assignSeededExperimentVariant(experimentId, sourceRoute, anonymousId);
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
