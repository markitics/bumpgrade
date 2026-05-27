"use client";

import { AlertCircle, CheckCircle2, PackagePlus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  productCreationApiRoute,
  productCreationConfirmationText,
  productCreationKinds,
  type ProductCreationKind,
} from "@/lib/product-creation";

type ProductCreationResponse = {
  ok: boolean;
  status?: string;
  code?: string;
  message?: string;
  duplicate?: boolean;
  product?: {
    productId: string;
    slug: string;
    name: string;
    kind: ProductCreationKind;
    status: string;
    billingMutationEnabled: false;
    fulfillmentMutationEnabled: false;
  };
};

const kindLabels: Record<ProductCreationKind, string> = {
  digital_download: "Digital download",
  course: "Course",
  membership: "Membership",
  coaching_service: "Coaching/service",
  event_webinar: "Event/webinar",
  bundle: "Bundle",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function AdminProductCreationForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [kind, setKind] = useState<ProductCreationKind>("digital_download");
  const [description, setDescription] = useState("");
  const [response, setResponse] = useState<ProductCreationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedSlug = useMemo(() => slugify(slug || name), [name, slug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResponse(null);

    try {
      const creationResponse = await fetch(productCreationApiRoute, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          slug: resolvedSlug,
          kind,
          description,
          confirmationText: productCreationConfirmationText,
          idempotencyKey: `product-creation-${crypto.randomUUID()}`,
        }),
      });
      const payload = (await creationResponse.json()) as ProductCreationResponse;
      if (!creationResponse.ok || !payload.ok) {
        setError(payload.message ?? "The draft product could not be created.");
        return;
      }
      setName("");
      setSlug("");
      setDescription("");
      setResponse(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "The draft product could not be created.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="admin-step-editor admin-step-edit-form" aria-label="Create draft product" onSubmit={handleSubmit}>
      <div className="admin-step-editor-heading">
        <div>
          <span>Product creation</span>
          <strong>Draft product record</strong>
          <p>Non-billing catalog entry with owner confirmation, idempotency, and public redaction.</p>
        </div>
      </div>
      <label className="admin-form-field">
        <span>Name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="admin-form-field">
        <span>Slug</span>
        <input value={slug} onChange={(event) => setSlug(event.target.value)} />
      </label>
      <p className="field-hint">Leave slug blank to generate it from the product name.</p>
      <label className="admin-form-field">
        <span>Kind</span>
        <select value={kind} onChange={(event) => setKind(event.target.value as ProductCreationKind)}>
          {productCreationKinds.map((productKind) => (
            <option key={productKind} value={productKind}>
              {kindLabels[productKind]}
            </option>
          ))}
        </select>
      </label>
      <label className="admin-form-field">
        <span>Description</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
        />
      </label>
      <button type="submit" className="secondary-action" disabled={isSubmitting || !name.trim() || !resolvedSlug}>
        {isSubmitting ? "Creating..." : "Create draft product"}
        <PackagePlus aria-hidden="true" />
      </button>
      {error ? (
        <div className="checkout-alert error">
          <AlertCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}
      {response?.product ? (
        <div className="checkout-alert success">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <strong>{response.duplicate ? "Draft product replayed" : "Draft product created"}</strong>
            <span>
              {response.product.name} stays {response.product.status}; billing writes enabled:{" "}
              {String(response.product.billingMutationEnabled)}.
            </span>
          </div>
        </div>
      ) : null}
    </form>
  );
}
