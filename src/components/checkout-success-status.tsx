"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, PackageCheck, ReceiptText, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { postPurchaseDecisionRoutePrefix } from "@/lib/post-purchase-decisions";

type CheckoutStatusPayload = {
  ok?: boolean;
  checkout?: {
    checkoutIntentId: string;
    status: string;
    eligible: boolean;
    updatedAt: number;
    privateDataIncluded: false;
    rawStripeIdsIncluded: false;
  } | null;
};

type StatusState =
  | { status: "missing"; message: string; payload: null }
  | { status: "loading"; message: string; payload: null }
  | { status: "waiting"; message: string; payload: CheckoutStatusPayload }
  | { status: "ready"; message: string; payload: CheckoutStatusPayload }
  | { status: "error"; message: string; payload: CheckoutStatusPayload | null };

const pollDelayMs = 2000;

export function CheckoutSuccessStatus({ checkoutIntentId }: { checkoutIntentId?: string }) {
  const [state, setState] = useState<StatusState>(() =>
    checkoutIntentId
      ? { status: "loading", message: "Checking trusted checkout evidence...", payload: null }
      : { status: "missing", message: "No checkout intent was returned with this success page.", payload: null },
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const postPurchasePath = checkoutIntentId ? `${postPurchaseDecisionRoutePrefix}/${checkoutIntentId}` : null;
  const productAccessPath = checkoutIntentId ? `/products/entitlements/${encodeURIComponent(checkoutIntentId)}` : null;

  const statusUrl = useMemo(() => {
    if (!checkoutIntentId) return null;
    const params = new URLSearchParams({ checkoutIntentId });
    return `/api/commerce/post-purchase-decisions?${params.toString()}`;
  }, [checkoutIntentId]);

  const refreshStatus = useCallback(async () => {
    if (!statusUrl) {
      setState({
        status: "missing",
        message: "No checkout intent was returned with this success page.",
        payload: null,
      });
      return null;
    }

    setIsRefreshing(true);
    try {
      const response = await fetch(statusUrl, { cache: "no-store" });
      const payload = (await response.json()) as CheckoutStatusPayload;
      const checkout = payload.checkout;

      if (!response.ok || !payload.ok) {
        setState({ status: "error", message: "Checkout evidence could not be checked.", payload });
        return payload;
      }

      if (checkout?.eligible) {
        setState({
          status: "ready",
          message: "Trusted checkout evidence is ready for the post-purchase path.",
          payload,
        });
        return payload;
      }

      setState({
        status: "waiting",
        message: checkout
          ? `Waiting for webhook confirmation. Current checkout status: ${checkout.status}.`
          : "Waiting for a recorded checkout intent before opening the post-purchase path.",
        payload,
      });
      return payload;
    } catch {
      setState({
        status: "error",
        message: "Checkout evidence could not be checked.",
        payload: null,
      });
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [statusUrl]);

  useEffect(() => {
    if (!statusUrl) {
      return undefined;
    }

    let timeout: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    async function tick() {
      const payload = await refreshStatus();
      if (!cancelled && !payload?.checkout?.eligible) {
        timeout = setTimeout(() => void tick(), pollDelayMs);
      }
    }

    void tick();

    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [refreshStatus, statusUrl]);

  const checkout = state.payload?.checkout ?? null;
  const isReady = state.status === "ready" && Boolean(postPurchasePath);
  const statusLabel = state.status === "ready" ? "Webhook confirmed" : state.status === "missing" ? "Intent missing" : "Checking checkout";

  return (
    <>
      <div>
        <p className="eyebrow">Sandbox checkout</p>
        <h1>The sandbox checkout returned successfully.</h1>
        <p className="lede">
          This page is the safe return target for the first Bumpgrade Stripe Checkout Session path. Fulfillment
          should still wait for the webhook to update the D1 checkout intent.
        </p>
        <div className="hero-actions">
          {isReady ? (
            <Link className="primary-action" href={postPurchasePath ?? "#"}>
              Continue offer path <CheckCircle2 aria-hidden="true" />
            </Link>
          ) : null}
          {checkoutIntentId ? (
            <button
              className={isReady ? "secondary-action" : "primary-action"}
              type="button"
              onClick={() => void refreshStatus()}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Checking..." : "Refresh status"}
              <RefreshCw aria-hidden="true" />
            </button>
          ) : null}
          {productAccessPath ? (
            <Link className="secondary-action" href={productAccessPath}>
              View product access <PackageCheck aria-hidden="true" />
            </Link>
          ) : null}
          <Link className={isReady || checkoutIntentId ? "secondary-action" : "text-link"} href="/commerce/source-data">
            Commerce source data <ReceiptText aria-hidden="true" />
          </Link>
        </div>
      </div>

      <aside className={`route-status-panel checkout-success-status ${state.status}`} aria-live="polite">
        {isReady ? <CheckCircle2 aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
        <p>Status</p>
        <strong>{statusLabel}</strong>
        <span>{state.message}</span>
        {checkout ? <code>{checkout.checkoutIntentId}</code> : null}
      </aside>
    </>
  );
}
