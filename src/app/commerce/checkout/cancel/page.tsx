import { CircleAlert, ReceiptText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sandbox checkout canceled | Bumpgrade",
  description: "Sandbox checkout cancel state for Bumpgrade's first Stripe Checkout Session path.",
};

export default function SandboxCheckoutCancelPage() {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Sandbox checkout</p>
          <h1>The sandbox checkout was canceled.</h1>
          <p className="lede">
            Bumpgrade keeps the checkout intent for audit and recovery work, but no fulfillment should happen unless
            Stripe sends a confirming webhook.
          </p>
          <Link className="text-link" href="/commerce/source-data">
            Commerce source data <ReceiptText aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <CircleAlert aria-hidden="true" />
          <p>Status</p>
          <strong>Checkout canceled</strong>
          <span>Use the checkout intent audit trail to inspect what happened.</span>
        </div>
      </section>
    </main>
  );
}
