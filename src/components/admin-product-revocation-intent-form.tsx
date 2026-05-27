"use client";

import { AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";

import {
  productEntitlementRevocationConfirmationText,
  productEntitlementRevocationIntentApiRoute,
  productEntitlementRevocationReasonCodes,
  type ProductEntitlementRevocationReasonCode,
} from "@/lib/product-entitlement-inspection";

type AdminProductRevocationIntentFormProps = {
  entitlementId: string;
  productTitle: string;
  currentStatus: string;
};

type RevocationIntentResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  intent?: {
    id: string;
    productTitle: string;
    reasonCode: string | null;
    privateReasonRecorded: boolean;
    targetEntitlementStatus: string;
    destructiveActionEnabled: false;
    entitlementMutationEnabled: false;
  };
};

const reasonLabels: Record<ProductEntitlementRevocationReasonCode, string> = {
  manual_review: "Manual review",
  refund_or_chargeback: "Refund or chargeback",
  customer_request: "Customer request",
  test_cleanup: "Test cleanup",
};

export function AdminProductRevocationIntentForm({
  entitlementId,
  productTitle,
  currentStatus,
}: AdminProductRevocationIntentFormProps) {
  const [reasonCode, setReasonCode] = useState<ProductEntitlementRevocationReasonCode>("manual_review");
  const [privateReason, setPrivateReason] = useState("");
  const [response, setResponse] = useState<RevocationIntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const revocationResponse = await fetch(productEntitlementRevocationIntentApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          entitlementId,
          expectedEntitlementStatus: currentStatus,
          reasonCode,
          privateReason,
          confirmationText: productEntitlementRevocationConfirmationText,
          idempotencyKey: `product-revocation-intent-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await revocationResponse.json()) as RevocationIntentResponse;
      if (!revocationResponse.ok || !payload.ok) {
        setError(payload.message ?? "The product access-removal intent could not be recorded.");
        return;
      }
      setPrivateReason("");
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The product access-removal intent could not be recorded.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="admin-step-editor admin-step-edit-form admin-revocation-intent-form"
      aria-label={`Record non-destructive access-removal intent for ${productTitle}`}
      onSubmit={handleSubmit}
    >
      <div className="admin-step-editor-heading">
        <div>
          <span>Access removal intent</span>
          <strong>No entitlement mutation</strong>
          <p>
            Records owner intent with confirmation, idempotency, and a current status check while access, billing, and
            fulfillment stay unchanged.
          </p>
        </div>
      </div>
      <label className="admin-form-field">
        <span>Reason</span>
        <select value={reasonCode} onChange={(event) => setReasonCode(event.target.value as ProductEntitlementRevocationReasonCode)}>
          {productEntitlementRevocationReasonCodes.map((code) => (
            <option key={code} value={code}>
              {reasonLabels[code]}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-form-field">
        <span>Private note</span>
        <textarea
          value={privateReason}
          onChange={(event) => setPrivateReason(event.target.value)}
          rows={3}
        />
      </label>
      <button type="submit" className="secondary-action" disabled={isSubmitting}>
        {isSubmitting ? "Recording..." : "Record access-removal intent"}
        <ShieldCheck aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.intent ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Access-removal intent replayed" : "Access-removal intent recorded"}</strong>
            <span>
              {response.intent.productTitle} stays {response.intent.targetEntitlementStatus}; destructive actions enabled:{" "}
              {String(response.intent.destructiveActionEnabled)}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
