"use client";

import { AlertCircle, CheckCircle2, Link2, ShieldCheck } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import type { ProductCreationRecord } from "@/lib/product-creation";
import {
  productOfferAccessApiRoute,
  productOfferAccessConfirmationText,
  type ProductOfferAccessRecord,
} from "@/lib/product-offer-access";

type ProductOfferAccessResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: ProductOfferAccessRecord;
};

type AdminProductOfferAccessGrantFormProps = {
  products: ProductCreationRecord[];
};

function defaultOfferId(slug: string) {
  return `offer-owner-product-test-${slug}`.replace(/[^a-z0-9-]+/g, "-").slice(0, 120);
}

function defaultFunnelId(slug: string) {
  return `funnel-owner-product-test-${slug}`.replace(/[^a-z0-9-]+/g, "-").slice(0, 120);
}

export function AdminProductOfferAccessGrantForm({ products }: AdminProductOfferAccessGrantFormProps) {
  const [productId, setProductId] = useState(products[0]?.productId ?? "");
  const selectedProduct = products.find((product) => product.productId === productId) ?? products[0] ?? null;
  const [offerId, setOfferId] = useState("");
  const [funnelId, setFunnelId] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [amountCents, setAmountCents] = useState("900");
  const [response, setResponse] = useState<ProductOfferAccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedOfferId = useMemo(() => {
    if (offerId.trim()) return offerId.trim();
    return selectedProduct ? defaultOfferId(selectedProduct.slug) : "";
  }, [offerId, selectedProduct]);
  const resolvedFunnelId = useMemo(() => {
    if (funnelId.trim()) return funnelId.trim();
    return selectedProduct ? defaultFunnelId(selectedProduct.slug) : "";
  }, [funnelId, selectedProduct]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const grantResponse = await fetch(productOfferAccessApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          offerId: resolvedOfferId,
          funnelId: resolvedFunnelId,
          buyerEmail,
          amountCents,
          currency: "usd",
          confirmationText: productOfferAccessConfirmationText,
          idempotencyKey: `product-offer-access-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await grantResponse.json()) as ProductOfferAccessResponse;
      if (!grantResponse.ok || !payload.ok) {
        setError(payload.message ?? "The test access grant could not be created.");
        return;
      }
      setBuyerEmail("");
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The test access grant could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-step-editor admin-step-edit-form" aria-label="Create product offer access grant" onSubmit={handleSubmit}>
      <div className="admin-step-editor-heading">
        <div>
          <span>Test purchase path</span>
          <strong>Link product and grant access</strong>
          <p>Creates test offer/funnel evidence, a synthetic paid checkout intent, and an auditable entitlement.</p>
        </div>
      </div>
      <label className="admin-form-field">
        <span>Product</span>
        <select value={productId} onChange={(event) => setProductId(event.target.value)} disabled={!products.length}>
          {products.length ? (
            products.map((product) => (
              <option key={product.productId} value={product.productId}>
                {product.name}
              </option>
            ))
          ) : (
            <option value="">Create a draft product first</option>
          )}
        </select>
      </label>
      <label className="admin-form-field">
        <span>Offer ID</span>
        <input value={offerId} onChange={(event) => setOfferId(event.target.value)} />
      </label>
      <label className="admin-form-field">
        <span>Funnel ID</span>
        <input value={funnelId} onChange={(event) => setFunnelId(event.target.value)} />
      </label>
      <p className="field-hint">Leave offer and funnel IDs blank to use test IDs for the selected product.</p>
      <label className="admin-form-field">
        <span>Test buyer email</span>
        <input
          value={buyerEmail}
          onChange={(event) => setBuyerEmail(event.target.value)}
        />
      </label>
      <p className="field-hint">Leave buyer email blank to use a test buyer address for the selected product.</p>
      <label className="admin-form-field">
        <span>Test amount cents</span>
        <input inputMode="numeric" value={amountCents} onChange={(event) => setAmountCents(event.target.value)} />
      </label>
      <button type="submit" className="secondary-action" disabled={isSubmitting || !selectedProduct}>
        {isSubmitting ? "Creating..." : "Create test grant"}
        <Link2 aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.record ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Test grant replayed" : "Test grant created"}</strong>
            <span>
              {response.record.productName} is linked to {response.record.offerId}; entitlement{" "}
              {response.record.entitlementStatus ?? "recorded"}.
            </span>
          </div>
          <ShieldCheck aria-hidden="true" />
        </div>
      ) : null}
    </form>
  );
}
