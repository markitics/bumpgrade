import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CreditCard, ShieldCheck } from "lucide-react";

import { confirmBillingCheckoutSession, getOptionalBillingRuntime } from "@/lib/billing-signup";
import { pricingPlanBySlug } from "@/lib/pricing-plans";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing success | Bumpgrade",
  description: "Confirm your Bumpgrade subscription and continue into publisher account setup.",
  alternates: {
    canonical: `${site.url}/pricing/success`,
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PricingSuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

function accountSetupLoginHref(email?: string | null) {
  const params = new URLSearchParams({ callbackURL: "/account/setup" });
  if (email) {
    params.set("mode", "sign-up");
    params.set("email", email);
  }
  return `/login?${params.toString()}`;
}

export default async function PricingSuccessPage({ searchParams }: PricingSuccessPageProps) {
  const params = await searchParams;
  const runtime = await getOptionalBillingRuntime();
  const confirmation = runtime
    ? await confirmBillingCheckoutSession({
        db: runtime.db,
        env: runtime.env,
        sessionId: params.session_id,
      })
    : ({ ok: false, status: "db_unavailable", message: "Billing storage is unavailable in this runtime." } as const);

  const plan = confirmation.ok ? pricingPlanBySlug(confirmation.planSlug) : null;

  return (
    <main className="pricing-page">
      <section className="pricing-success-hero">
        <div>
          <p className="eyebrow">Bumpgrade checkout</p>
          <h1>{confirmation.ok ? `${plan?.name ?? "Bumpgrade"} is active.` : "Finish verifying your checkout."}</h1>
          <p className="lede">
            {confirmation.ok
              ? `Stripe confirmed the subscription for ${confirmation.ownerEmail}. Use the same email when you create or sign in to your Bumpgrade account so the paid entitlement can unlock publisher setup.`
              : confirmation.message}
          </p>
          <div className="hero-actions">
            <Link href={accountSetupLoginHref(confirmation.ok ? confirmation.ownerEmail : null)} className="primary-action">
              Continue to account setup
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="secondary-action">
              Back to pricing
              <CreditCard aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className={`pricing-note ${confirmation.ok ? "success-note" : ""}`}>
          {confirmation.ok ? <BadgeCheck aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
          <strong>{confirmation.ok ? "Subscription verified" : "Verification pending"}</strong>
          <p>
            {confirmation.ok
              ? `Plan: ${plan?.name ?? confirmation.planSlug}. White glove setup: ${
                  confirmation.setupAddonSelected ? "selected" : "not selected"
                }. Raw Stripe identifiers stay server-private.`
              : "If Stripe already completed the payment, refresh this page after a few seconds. Bumpgrade verifies the Checkout Session directly before granting account access."}
          </p>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Next step</p>
            <h2>Set up the publisher workspace attached to your paid plan.</h2>
          </div>
          <p>
            Account setup lets you reserve the Bumpgrade subdomain for your launch, then connect an existing custom
            domain when your plan includes it.
          </p>
        </div>
        <div className="payment-option-grid">
          <article className="payment-option-card">
            <BadgeCheck aria-hidden="true" />
            <h3>Use the paid email</h3>
            <p>Sign in or create your account with the same email used in Stripe so Bumpgrade can match the entitlement.</p>
          </article>
          <article className="payment-option-card">
            <ShieldCheck aria-hidden="true" />
            <h3>Reserve the subdomain</h3>
            <p>Pick the default Bumpgrade hostname customers will see while your first offer is being set up.</p>
          </article>
          <article className="payment-option-card">
            <CreditCard aria-hidden="true" />
            <h3>Keep billing safe</h3>
            <p>Subscription state is verified server-side and provider identifiers stay out of public contract routes.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
