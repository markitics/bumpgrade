"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, TimerReset, XCircle } from "lucide-react";

import type { CheckoutOfferStack } from "@/lib/checkout-offers";
import {
  postPurchaseDecisionApiRoute,
  postPurchaseDecisionConfirmationText,
  type PublicPostPurchaseCheckout,
} from "@/lib/post-purchase-decisions";

type DecisionState =
  | { status: "idle"; message: string }
  | { status: "pending"; message: string }
  | { status: "recorded"; message: string; decisionId: string }
  | { status: "error"; message: string };

type PostPurchaseDecisionPanelProps = {
  checkout: PublicPostPurchaseCheckout;
  stack: CheckoutOfferStack;
};

const decisionLabels = {
  accept_upsell_follow_up: "Accept accelerator follow-up",
  decline_upsell: "No thanks",
  accept_downsell_follow_up: "Choose review follow-up",
  decline_downsell: "Skip follow-up",
};

export function PostPurchaseDecisionPanel({ checkout, stack }: PostPurchaseDecisionPanelProps) {
  const [decisionState, setDecisionState] = useState<DecisionState>({
    status: "idle",
    message: "Post-purchase decision evidence is ready.",
  });
  const [activeDecision, setActiveDecision] = useState<string | null>(null);
  const [upsell, downsell] = stack.postPurchasePath.offers;
  const idempotencyPrefix = useMemo(() => crypto.randomUUID(), []);

  async function recordDecision(decisionKind: keyof typeof decisionLabels) {
    setActiveDecision(decisionKind);
    setDecisionState({ status: "pending", message: "Recording decision evidence..." });

    const response = await fetch(postPurchaseDecisionApiRoute, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        checkoutIntentId: checkout.checkoutIntentId,
        decisionKind,
        confirmationText: postPurchaseDecisionConfirmationText,
        idempotencyKey: `${idempotencyPrefix}-${decisionKind}`,
        expectedCheckoutUpdatedAt: checkout.updatedAt,
      }),
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      code?: string;
      message?: string;
      decision?: { decisionId?: string };
    };

    setActiveDecision(null);
    if (!response.ok || !payload.ok || !payload.decision?.decisionId) {
      setDecisionState({
        status: "error",
        message: payload.message ?? payload.code ?? "Decision evidence could not be recorded.",
      });
      return;
    }

    setDecisionState({
      status: "recorded",
      message: "Decision evidence recorded for owner follow-up.",
      decisionId: payload.decision.decisionId,
    });
  }

  return (
    <div className="post-purchase-layout">
      <article className="feature-card post-purchase-offer-card">
        <div className="feature-card-top">
          <span className="status-badge planned">Limited window</span>
          <span className="admin-pill">{upsell.priceLabel}</span>
        </div>
        <TimerReset aria-hidden="true" />
        <h2>{upsell.title}</h2>
        <p>{upsell.customerPromise}</p>
        <div className="offer-decision-actions">
          <button
            className="primary-action"
            type="button"
            disabled={activeDecision !== null}
            onClick={() => void recordDecision("accept_upsell_follow_up")}
          >
            {activeDecision === "accept_upsell_follow_up" ? "Recording..." : decisionLabels.accept_upsell_follow_up}
            <ArrowRight aria-hidden="true" />
          </button>
          <button
            className="secondary-action"
            type="button"
            disabled={activeDecision !== null}
            onClick={() => void recordDecision("decline_upsell")}
          >
            {decisionLabels.decline_upsell}
            <XCircle aria-hidden="true" />
          </button>
        </div>
      </article>

      <article className="feature-card post-purchase-offer-card">
        <div className="feature-card-top">
          <span className="status-badge pending">Fallback</span>
          <span className="admin-pill">{downsell.priceLabel}</span>
        </div>
        <CheckCircle2 aria-hidden="true" />
        <h2>{downsell.title}</h2>
        <p>{downsell.customerPromise}</p>
        <div className="offer-decision-actions">
          <button
            className="primary-action"
            type="button"
            disabled={activeDecision !== null}
            onClick={() => void recordDecision("accept_downsell_follow_up")}
          >
            {activeDecision === "accept_downsell_follow_up" ? "Recording..." : decisionLabels.accept_downsell_follow_up}
            <ArrowRight aria-hidden="true" />
          </button>
          <button
            className="secondary-action"
            type="button"
            disabled={activeDecision !== null}
            onClick={() => void recordDecision("decline_downsell")}
          >
            {decisionLabels.decline_downsell}
            <XCircle aria-hidden="true" />
          </button>
        </div>
      </article>

      <aside className={`route-status-panel decision-status ${decisionState.status}`} aria-live="polite">
        {decisionState.status === "error" ? <XCircle aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
        <p>Status</p>
        <strong>{decisionState.status === "recorded" ? "Decision recorded" : "Follow-up evidence"}</strong>
        <span>{decisionState.message}</span>
        {decisionState.status === "recorded" ? <code>{decisionState.decisionId}</code> : null}
      </aside>
    </div>
  );
}
