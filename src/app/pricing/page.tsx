import type { Metadata } from "next";
import { CircleDollarSign } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Planned Bumpgrade pricing direction for publishers, products, payments, and agent workflows.",
};

export default function PricingPage() {
  return (
    <RouteShell
      eyebrow="Pricing"
      title="Pricing surface without premature billing claims."
      body="This route will explain the pricing model once product and Stripe foundations exist. Until then, it stays clearly aspirational."
      issue="#11"
      icon={CircleDollarSign}
      bullets={[
        "Plan positioning for publishers and small teams.",
        "Payment, checkout, transaction, and agent-workflow cost notes.",
        "Stripe-backed billing architecture before live plan claims.",
        "Roadmap links for anything not yet implemented.",
      ]}
    />
  );
}
