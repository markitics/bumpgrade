"use client";

import { useEffect, useMemo, useState } from "react";

import {
  analyticsAnonymousStorageKey,
  analyticsRoutingContextFromLocation,
  analyticsSessionValue,
  assignSeededExperimentVariantResult,
  shouldSkipAnalyticsBrowserWork,
  type AnalyticsBrowserAssignmentResult,
} from "@/lib/analytics-browser-session";

export type FunnelExperimentRoutedVariant = {
  id: string;
  label: string;
  routingRole: "treatment" | "holdout";
  routedTitle: string;
  routedBody: string;
};

type FunnelExperimentRoutedCopyProps = {
  experimentId: string;
  sourceRoute: string;
  fallbackTitle: string;
  fallbackBody: string;
  variants: FunnelExperimentRoutedVariant[];
};

export function FunnelExperimentRoutedCopy({
  experimentId,
  sourceRoute,
  fallbackTitle,
  fallbackBody,
  variants,
}: FunnelExperimentRoutedCopyProps) {
  const [assignment, setAssignment] = useState<AnalyticsBrowserAssignmentResult | null>(null);
  const assignedVariant = useMemo(
    () => variants.find((variant) => variant.id === assignment?.variantId) ?? null,
    [assignment?.variantId, variants],
  );
  const isHoldout = assignedVariant?.routingRole === "holdout";

  useEffect(() => {
    if (shouldSkipAnalyticsBrowserWork()) return undefined;
    const anonymousId = analyticsSessionValue(analyticsAnonymousStorageKey, "anonymous-session");
    if (!anonymousId) return undefined;
    const routingContext = analyticsRoutingContextFromLocation();

    let cancelled = false;
    void assignSeededExperimentVariantResult(experimentId, sourceRoute, anonymousId, routingContext).then((result) => {
      if (!cancelled && result) {
        setAssignment(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [experimentId, sourceRoute]);

  return (
    <div
      data-experiment-id={experimentId}
      data-experiment-variant={assignedVariant?.id ?? "fallback"}
      data-experiment-holdout={isHoldout ? "true" : "false"}
      data-experiment-routing="seeded-session"
      data-experiment-custom-routing={assignment?.customRoutingRuleMatched ? "true" : "false"}
      data-experiment-custom-routing-rule={assignment?.customRoutingRuleId ?? "none"}
      data-experiment-winner-rollout={assignment?.winnerRolloutMatched ? "true" : "false"}
      data-experiment-winner-rollout-id={assignment?.winnerRolloutId ?? "none"}
    >
      <h3>{isHoldout ? fallbackTitle : assignedVariant?.routedTitle ?? fallbackTitle}</h3>
      <p>{isHoldout ? fallbackBody : assignedVariant?.routedBody ?? fallbackBody}</p>
    </div>
  );
}
