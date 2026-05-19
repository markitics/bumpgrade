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
