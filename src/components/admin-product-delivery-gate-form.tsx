"use client";

import { AlertCircle, CheckCircle2, Link2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import type { ProductCreationRecord } from "@/lib/product-creation";
import {
  productDeliveryGateApiRoute,
  productDeliveryGateConfirmationText,
  productDeliveryGateFunnelId,
  productDeliveryGateOfferId,
  productDeliveryGateOfferStackId,
  type ProductDeliveryGateRecord,
} from "@/lib/product-delivery-gates";
import type { ProductTestCheckoutLinkRecord } from "@/lib/product-test-checkout-links";

type ProductDeliveryGateResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  record?: ProductDeliveryGateRecord;
};

type AdminProductDeliveryGateFormProps = {
  products: ProductCreationRecord[];
  checkoutLinks: ProductTestCheckoutLinkRecord[];
};

export function AdminProductDeliveryGateForm({ products, checkoutLinks }: AdminProductDeliveryGateFormProps) {
  const eligibleLinks = useMemo(
    () =>
      checkoutLinks
        .filter((link) => link.status === "test_checkout_link_active")
        .filter((link) => products.some((product) => product.productId === link.productId)),
    [checkoutLinks, products],
  );
  const [checkoutLinkId, setCheckoutLinkId] = useState(eligibleLinks[0]?.id ?? "");
  const selectedLink = eligibleLinks.find((link) => link.id === checkoutLinkId) ?? eligibleLinks[0] ?? null;
  const selectedProduct = products.find((product) => product.productId === selectedLink?.productId) ?? null;
  const [response, setResponse] = useState<ProductDeliveryGateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLink || !selectedProduct) return;
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const deliveryGateResponse = await fetch(productDeliveryGateApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          checkoutLinkId: selectedLink.id,
          offerStackId: productDeliveryGateOfferStackId,
          offerId: productDeliveryGateOfferId,
          funnelId: productDeliveryGateFunnelId,
          expectedProductUpdatedAt: selectedProduct.updatedAt,
          expectedLinkRevisionId: selectedLink.revisionId,
          confirmationText: productDeliveryGateConfirmationText,
          idempotencyKey: `product-delivery-gate-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await deliveryGateResponse.json()) as ProductDeliveryGateResponse;
      if (!deliveryGateResponse.ok || !payload.ok) {
        setError(payload.message ?? "The product delivery gate could not be linked.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The product delivery gate could not be linked.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-step-editor admin-step-edit-form" aria-label="Link owner product delivery gate" onSubmit={handleSubmit}>
      <div className="admin-step-editor-heading">
        <div>
          <span>Offer and funnel delivery gates</span>
          <strong>Link owner product gates</strong>
          <p>Connects a test checkout link to the seeded offer/funnel path with product and link stale-state checks.</p>
        </div>
      </div>
      <label className="admin-form-field">
        <span>Test checkout link</span>
        <select value={checkoutLinkId} onChange={(event) => setCheckoutLinkId(event.target.value)} disabled={!eligibleLinks.length}>
          {eligibleLinks.length ? (
            eligibleLinks.map((link) => (
              <option key={link.id} value={link.id}>
                {link.productName}
              </option>
            ))
          ) : (
            <option value="">Create a product test checkout link first</option>
          )}
        </select>
      </label>
      <div className="roadmap-detail">
        <strong>Offer</strong>
        <span>{productDeliveryGateOfferId}</span>
      </div>
      <div className="roadmap-detail">
        <strong>Funnel</strong>
        <span>{productDeliveryGateFunnelId}</span>
      </div>
      <button type="submit" className="secondary-action" disabled={isSubmitting || !selectedLink || !selectedProduct}>
        {isSubmitting ? "Linking..." : "Link delivery gates"}
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
            <strong>{response.duplicate ? "Delivery gate replayed" : "Delivery gate linked"}</strong>
            <span>
              {response.record.productName} is linked to {response.record.offerId} and {response.record.funnelId}.
            </span>
            <a href={response.record.checkoutPublicPath}>{response.record.checkoutPublicPath}</a>
          </div>
        </div>
      ) : null}
    </form>
  );
}
