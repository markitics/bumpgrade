import type { Metadata } from "next";

import { CheckoutSuccessStatus } from "@/components/checkout-success-status";

export const metadata: Metadata = {
  title: "Checkout success | Bumpgrade",
  description: "Checkout success state for Bumpgrade's first Stripe Checkout Session path.",
};

type SandboxCheckoutSuccessPageProps = {
  searchParams: Promise<{
    checkout_intent_id?: string;
  }>;
};

export default async function SandboxCheckoutSuccessPage({ searchParams }: SandboxCheckoutSuccessPageProps) {
  const { checkout_intent_id: checkoutIntentId } = await searchParams;

  return (
    <main className="route-page">
      <section className="route-hero">
        <CheckoutSuccessStatus checkoutIntentId={checkoutIntentId} />
      </section>
    </main>
  );
}
