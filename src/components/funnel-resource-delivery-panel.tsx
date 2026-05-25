"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

const funnelResourceDeliveryApiRoute = "/api/funnels/resource-delivery";

type DeliveryState =
  | { status: "idle"; message: string; downloadUrl: null }
  | { status: "loading"; message: string; downloadUrl: null }
  | { status: "ready"; message: string; downloadUrl: string }
  | { status: "error"; message: string; downloadUrl: null };

type DeliveryResponse = {
  ok?: boolean;
  downloadUrl?: string;
  expiresAt?: string;
  message?: string;
};

export function FunnelResourceDeliveryPanel({
  funnelSlug,
  blockId,
  productTitle,
  assetTitle,
}: {
  funnelSlug: string;
  blockId: string;
  productTitle: string;
  assetTitle: string;
}) {
  const [checkoutIntentId, setCheckoutIntentId] = useState("");
  const [entitlementId, setEntitlementId] = useState("");
  const [state, setState] = useState<DeliveryState>({
    status: "idle",
    message: "Use the checkout access details from your purchase confirmation.",
    downloadUrl: null,
  });

  async function requestDelivery() {
    setState({ status: "loading", message: "Checking access...", downloadUrl: null });
    try {
      const response = await fetch(funnelResourceDeliveryApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ funnelSlug, blockId, checkoutIntentId, entitlementId }),
      });
      const payload = (await response.json()) as DeliveryResponse;
      if (!response.ok || !payload.ok || !payload.downloadUrl) {
        setState({ status: "error", message: payload.message ?? "Resource delivery is not available.", downloadUrl: null });
        return;
      }
      setState({
        status: "ready",
        message: payload.expiresAt ? `Private access link expires at ${payload.expiresAt}.` : "Private access link is ready.",
        downloadUrl: payload.downloadUrl,
      });
    } catch {
      setState({ status: "error", message: "Resource delivery is not available.", downloadUrl: null });
    }
  }

  return (
    <div className="download-token-panel">
      <div className="feature-detail">
        <strong>Private delivery</strong>
        <span>
          {productTitle} / {assetTitle}
        </span>
      </div>
      <label htmlFor={`checkout-intent-${blockId}`}>Checkout intent ID</label>
      <input
        id={`checkout-intent-${blockId}`}
        type="text"
        value={checkoutIntentId}
        onChange={(event) => setCheckoutIntentId(event.target.value)}
        placeholder="checkout-intent-..."
        autoComplete="off"
      />
      <label htmlFor={`entitlement-${blockId}`}>Entitlement ID</label>
      <input
        id={`entitlement-${blockId}`}
        type="text"
        value={entitlementId}
        onChange={(event) => setEntitlementId(event.target.value)}
        placeholder="entitlement-..."
        autoComplete="off"
      />
      {state.downloadUrl ? (
        <a className="secondary-action" href={state.downloadUrl}>
          Download private resource <Download aria-hidden="true" />
        </a>
      ) : (
        <button
          className="secondary-action"
          type="button"
          onClick={() => void requestDelivery()}
          disabled={state.status === "loading"}
        >
          {state.status === "loading" ? "Checking..." : "Get private resource"}
          {state.status === "loading" ? <Loader2 aria-hidden="true" /> : <Download aria-hidden="true" />}
        </button>
      )}
      <p>{state.message}</p>
    </div>
  );
}
