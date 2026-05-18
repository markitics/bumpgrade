import { CheckCircle2, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sandbox checkout success | Bumpgrade",
  description: "Sandbox checkout success state for Bumpgrade's first Stripe Checkout Session path.",
};

export default function SandboxCheckoutSuccessPage() {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Sandbox checkout</p>
          <h1>The sandbox checkout returned successfully.</h1>
          <p className="lede">
            This page is the safe return target for the first Bumpgrade Stripe Checkout Session path. Fulfillment
            should still wait for the webhook to update the D1 checkout intent.
          </p>
          <Link className="text-link" href="/commerce/source-data">
            Commerce source data <ReceiptText aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <CheckCircle2 aria-hidden="true" />
          <p>Status</p>
          <strong>Returned from Checkout</strong>
          <span>Webhook-confirmed fulfillment is tracked separately in D1.</span>
        </div>
      </section>
    </main>
  );
}

