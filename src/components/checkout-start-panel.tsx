"use client";

import { AlertCircle, CheckCircle2, ExternalLink, ShoppingCart } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import type { CheckoutOffer, CheckoutOfferStack } from "@/lib/checkout-offers";

type CheckoutResponse = {
  ok: boolean;
  status?: string;
  reason?: string;
  message?: string;
  checkoutIntentId?: string;
  redirect?: {
    type: string;
    url: string;
  } | null;
  lineItems?: Array<{
    id: string;
    name: string;
    priceId: string;
    unitAmountCents: number;
  }>;
  totalAmountCents?: number;
  redaction?: {
    rawStripeIdsIncluded?: boolean;
    checkoutUrlIncluded?: boolean;
    rawCheckoutUrlIncluded?: boolean;
  };
};

type CheckoutStartPanelProps = {
  stack: Pick<CheckoutOfferStack, "checkoutEndpoint" | "confirmation" | "primaryOffer" | "orderBumps" | "writeBoundary">;
  context?: {
    eyebrow?: string;
    heading?: string;
    agentClientId?: string;
    idempotencyPrefix?: string;
  };
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

function lineItemTotal(primaryOffer: CheckoutOffer, selectedBumps: CheckoutOffer[]) {
  return [primaryOffer, ...selectedBumps].reduce((total, offer) => total + offer.unitAmountCents, 0);
}

export function CheckoutStartPanel({ stack, context }: CheckoutStartPanelProps) {
  const [selectedOrderBumpPriceIds, setSelectedOrderBumpPriceIds] = useState<string[]>([]);
  const [confirmationText, setConfirmationText] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [response, setResponse] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedBumps = useMemo(
    () => stack.orderBumps.filter((offer) => selectedOrderBumpPriceIds.includes(offer.priceId)),
    [selectedOrderBumpPriceIds, stack.orderBumps],
  );
  const total = lineItemTotal(stack.primaryOffer, selectedBumps);
  const confirmationMatches = confirmationText.trim() === stack.confirmation.checkoutText;

  function toggleOrderBump(priceId: string) {
    setSelectedOrderBumpPriceIds((current) =>
      current.includes(priceId) ? current.filter((item) => item !== priceId) : [...current, priceId],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const checkoutResponse = await fetch(stack.checkoutEndpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          priceId: stack.primaryOffer.priceId,
          orderBumpPriceIds: selectedOrderBumpPriceIds,
          buyerEmail: buyerEmail.trim() || undefined,
          confirmationText,
          idempotencyKey: `${context?.idempotencyPrefix ?? "bumpgrade-offer"}-${crypto.randomUUID()}`,
          agentClientId: context?.agentClientId ?? "offer-preview-ui",
        }),
      });
      const payload = (await checkoutResponse.json()) as CheckoutResponse;

      if (!checkoutResponse.ok || !payload.ok) {
        setError(payload.message ?? "The sandbox checkout start could not be created.");
        return;
      }

      setResponse(payload);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "The sandbox checkout start failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="content-band">
      <div className="feature-section-heading">
        <div>
          <p className="eyebrow">{context?.eyebrow ?? "Sandbox checkout start"}</p>
          <h2>{context?.heading ?? "Choose the bump, confirm the checkout, keep billing sandboxed."}</h2>
        </div>
      </div>
      <div className="checkout-start-grid">
        <form className="checkout-start-panel" onSubmit={handleSubmit}>
          <div className="checkout-line-list" aria-label="Sandbox checkout line items">
            <div className="checkout-line-item selected">
              <div>
                <span>Primary offer</span>
                <strong>{stack.primaryOffer.title}</strong>
                <p>{stack.primaryOffer.customerPromise}</p>
              </div>
              <b>{stack.primaryOffer.priceLabel}</b>
            </div>
            {stack.orderBumps.map((offer) => (
              <label key={offer.id} className="checkout-line-item selectable">
                <input
                  type="checkbox"
                  checked={selectedOrderBumpPriceIds.includes(offer.priceId)}
                  onChange={() => toggleOrderBump(offer.priceId)}
                />
                <div>
                  <span>Order bump</span>
                  <strong>{offer.title}</strong>
                  <p>{offer.customerPromise}</p>
                </div>
                <b>{offer.priceLabel}</b>
              </label>
            ))}
          </div>

          <div className="checkout-total-row">
            <span>Total sandbox amount</span>
            <strong>{formatMoney(total, stack.primaryOffer.currency)}</strong>
          </div>

          <label className="checkout-field">
            Buyer email, optional
            <input
              type="email"
              value={buyerEmail}
              placeholder="sandbox-buyer@example.com"
              onChange={(event) => setBuyerEmail(event.target.value)}
            />
          </label>

          <label className="checkout-field">
            Exact confirmation text
            <textarea
              value={confirmationText}
              onChange={(event) => setConfirmationText(event.target.value)}
              rows={3}
              placeholder={stack.confirmation.checkoutText}
            />
          </label>

          <button type="submit" className="primary-action" disabled={isSubmitting || !confirmationMatches}>
            {isSubmitting ? "Starting..." : "Start sandbox checkout"}
            <ShoppingCart aria-hidden="true" />
          </button>
        </form>

        <aside className="checkout-result-panel" aria-live="polite">
          <ShoppingCart aria-hidden="true" />
          <p>Confirmation required</p>
          <strong>{confirmationMatches ? "Ready to start" : "Paste exact text"}</strong>
          <code>{stack.confirmation.checkoutText}</code>
          <span>{stack.writeBoundary}</span>
          {error ? (
            <div className="checkout-alert error">
              <AlertCircle aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}
          {response ? (
            <div className="checkout-alert success">
              <CheckCircle2 aria-hidden="true" />
              <div>
                <strong>{response.status === "preview" ? "Preview response" : "Checkout start created"}</strong>
                <span>
                  {response.status === "preview"
                    ? `Safe preview: ${response.reason ?? "sandbox preview"}`
                    : "Bumpgrade redirect is ready; raw Stripe URL stays server-private."}
                </span>
                {typeof response.totalAmountCents === "number" ? (
                  <span>{formatMoney(response.totalAmountCents, stack.primaryOffer.currency)} total</span>
                ) : null}
                {response.redirect?.url ? (
                  <a href={response.redirect.url}>
                    Open Bumpgrade redirect
                    <ExternalLink aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
