"use client";

import { useEffect } from "react";

import {
  analyticsAnonymousStorageKey,
  analyticsAttributionProperties,
  analyticsRoutingContextFromLocation,
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

function stepForHash(steps: FunnelBeaconStep[]) {
  const hash = window.location.hash.replace(/^#/, "");
  if (hash) {
    const matched = steps.find((step) => step.routeAnchor === hash);
    if (matched) return matched;
  }
  return steps[0] ?? null;
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
      const routingContext = analyticsRoutingContextFromLocation();
      const variantId = await assignSeededExperimentVariant(experimentId, sourceRoute, anonymousId, routingContext);
      const attribution = analyticsAttributionProperties();

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
