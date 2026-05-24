"use client";

import { useEffect, useMemo, useState } from "react";

import {
  analyticsAnonymousStorageKey,
  analyticsSessionValue,
  assignSeededExperimentVariant,
  shouldSkipAnalyticsBrowserWork,
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
  const [assignedVariantId, setAssignedVariantId] = useState<string | null>(null);
  const assignedVariant = useMemo(
    () => variants.find((variant) => variant.id === assignedVariantId) ?? null,
    [assignedVariantId, variants],
  );
  const isHoldout = assignedVariant?.routingRole === "holdout";

  useEffect(() => {
    if (shouldSkipAnalyticsBrowserWork()) return undefined;
    const anonymousId = analyticsSessionValue(analyticsAnonymousStorageKey, "anonymous-session");
    if (!anonymousId) return undefined;

    let cancelled = false;
    void assignSeededExperimentVariant(experimentId, sourceRoute, anonymousId).then((variantId) => {
      if (!cancelled && variantId) {
        setAssignedVariantId(variantId);
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
    >
      <h3>{isHoldout ? fallbackTitle : assignedVariant?.routedTitle ?? fallbackTitle}</h3>
      <p>{isHoldout ? fallbackBody : assignedVariant?.routedBody ?? fallbackBody}</p>
    </div>
  );
}
