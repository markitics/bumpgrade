"use client";

import { AlertCircle, CheckCircle2, ExternalLink, ShoppingCart } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  productTestCheckoutApiRoute,
  productTestCheckoutConfirmationText,
  type ProductTestCheckoutLinkRecord,
  type ProductTestCheckoutPurchaseRecord,
} from "@/lib/product-test-checkout-links";

type ProductTestCheckoutResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  checkout?: ProductTestCheckoutPurchaseRecord & {
    entitlementLookupUrl: string;
  };
};

type ProductTestCheckoutPanelProps = {
  link: ProductTestCheckoutLinkRecord;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function ProductTestCheckoutPanel({ link }: ProductTestCheckoutPanelProps) {
  const [buyerEmail, setBuyerEmail] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [response, setResponse] = useState<ProductTestCheckoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirmationMatches = confirmationText.trim() === productTestCheckoutConfirmationText;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);
    const normalizedBuyerEmail = buyerEmail.trim();
    setBuyerEmail(normalizedBuyerEmail);

    try {
      const checkoutResponse = await fetch(productTestCheckoutApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          linkId: link.id,
          buyerEmail: normalizedBuyerEmail,
          expectedLinkRevisionId: link.revisionId,
          confirmationText,
          idempotencyKey: `product-test-checkout-${crypto.randomUUID()}`,
          agentClientId: "product-test-checkout-ui",
        }),
      });
      const payload = (await checkoutResponse.json()) as ProductTestCheckoutResponse;
      if (!checkoutResponse.ok || !payload.ok) {
        setError(payload.message ?? "The product test checkout could not be completed.");
        return;
      }
      setResponse(payload);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "The product test checkout failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="content-band">
      <div className="feature-section-heading">
        <div>
          <p className="eyebrow">Product test checkout</p>
          <h2>Complete the test checkout and unlock test access.</h2>
        </div>
      </div>
      <div className="checkout-start-grid">
        <form className="checkout-start-panel" onSubmit={handleSubmit} noValidate>
          <div className="checkout-line-list" aria-label="Product test checkout line items">
            <div className="checkout-line-item selected">
              <div>
                <span>Owner-created product</span>
                <strong>{link.productName}</strong>
                <p>
                  {link.productKind.replaceAll("_", " ")} test purchase with queued{" "}
                  {link.fulfillmentKind.replaceAll("_", " ")} fulfillment evidence.
                </p>
              </div>
              <b>{formatMoney(link.amountCents, link.currency)}</b>
            </div>
          </div>

          <label className="checkout-field">
            Buyer email
            <input
              type="email"
              required
              value={buyerEmail}
              onChange={(event) => setBuyerEmail(event.target.value)}
              onBlur={(event) => setBuyerEmail(event.currentTarget.value.trim())}
            />
          </label>

          <label className="checkout-field">
            Exact confirmation text
            <textarea
              value={confirmationText}
              onChange={(event) => setConfirmationText(event.target.value)}
              rows={3}
            />
          </label>

          <button type="submit" className="primary-action" disabled={isSubmitting || !confirmationMatches || !buyerEmail.trim()}>
            {isSubmitting ? "Completing..." : "Complete test checkout"}
            <ShoppingCart aria-hidden="true" />
          </button>
        </form>

        <aside className="checkout-result-panel" aria-live="polite">
          <ShoppingCart aria-hidden="true" />
          <p>Test mode only</p>
          <strong>{confirmationMatches ? "Ready to complete" : "Paste exact text"}</strong>
          <code>{productTestCheckoutConfirmationText}</code>
          <span>
            This creates a synthetic paid checkout intent and entitlement evidence only. No Stripe Checkout Session,
            live charge, signed URL, or arbitrary fulfillment delivery is created.
          </span>
          {error ? (
            <div className="checkout-alert error">
              <AlertCircle aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}
          {response?.checkout ? (
            <div className="checkout-alert success">
              <CheckCircle2 aria-hidden="true" />
              <div>
                <strong>{response.duplicate ? "Test checkout replayed" : "Test checkout complete"}</strong>
                <span>
                  Checkout {response.checkout.checkoutStatus ?? response.checkout.status}; entitlement{" "}
                  {response.checkout.entitlementStatus ?? "recorded"}.
                </span>
                <a href={response.checkout.entitlementLookupUrl}>
                  View test access
                  <ExternalLink aria-hidden="true" />
                </a>
              </div>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
