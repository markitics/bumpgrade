"use client";

import { AlertCircle, CheckCircle2, ExternalLink, ShoppingCart } from "lucide-react";
import { FormEvent, useState } from "react";

import type { ProductCreationRecord } from "@/lib/product-creation";
import {
  productTestCheckoutLinkApiRoute,
  productTestCheckoutLinkConfirmationText,
  type ProductTestCheckoutLinkRecord,
} from "@/lib/product-test-checkout-links";

type ProductTestCheckoutLinkResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  link?: ProductTestCheckoutLinkRecord;
};

type AdminProductTestCheckoutLinkFormProps = {
  products: ProductCreationRecord[];
};

function absolutePath(path: string) {
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

export function AdminProductTestCheckoutLinkForm({ products }: AdminProductTestCheckoutLinkFormProps) {
  const [productId, setProductId] = useState(products[0]?.productId ?? "");
  const selectedProduct = products.find((product) => product.productId === productId) ?? products[0] ?? null;
  const [amountCents, setAmountCents] = useState("900");
  const [response, setResponse] = useState<ProductTestCheckoutLinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProduct) return;
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const linkResponse = await fetch(productTestCheckoutLinkApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.productId,
          amountCents,
          currency: "usd",
          expectedProductUpdatedAt: selectedProduct.updatedAt,
          confirmationText: productTestCheckoutLinkConfirmationText,
          idempotencyKey: `product-test-checkout-link-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await linkResponse.json()) as ProductTestCheckoutLinkResponse;
      if (!linkResponse.ok || !payload.ok) {
        setError(payload.message ?? "The test checkout link could not be created.");
        return;
      }
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The test checkout link could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-step-editor admin-step-edit-form" aria-label="Create product test checkout link" onSubmit={handleSubmit}>
      <div className="admin-step-editor-heading">
        <div>
          <span>Buyer-facing test checkout</span>
          <strong>Create test checkout link</strong>
          <p>Creates a stable public test link with product stale-state and owner confirmation checks.</p>
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
        <span>Test amount cents</span>
        <input inputMode="numeric" value={amountCents} onChange={(event) => setAmountCents(event.target.value)} />
      </label>
      <button type="submit" className="secondary-action" disabled={isSubmitting || !selectedProduct}>
        {isSubmitting ? "Creating..." : "Create test checkout link"}
        <ShoppingCart aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.link ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Test link replayed" : "Test link created"}</strong>
            <span>
              {response.link.productName} has a {response.link.currency.toUpperCase()}{" "}
              {(response.link.amountCents / 100).toFixed(2)} test checkout link.
            </span>
            <a href={response.link.publicPath}>
              {absolutePath(response.link.publicPath)}
              <ExternalLink aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : null}
    </form>
  );
}
