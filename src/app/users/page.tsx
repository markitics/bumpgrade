import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Compass, Sparkles, Users } from "lucide-react";

import { audienceSegments } from "@/lib/content-surfaces";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Users and Use Cases",
  description:
    "Bumpgrade use cases for creators, coaches, newsletter writers, course sellers, agencies, small publishers, and indie hackers.",
  alternates: {
    canonical: `${site.url}/users`,
  },
};

const useCaseDetails: Record<string, { bestFor: string; outcome: string; href: string }> = {
  "audience-creators": {
    bestFor: "Templates, communities, paid downloads, services, and expertise packaged into a clear offer.",
    outcome: "Turn a scattered idea into a focused page, offer, checkout path, and follow-up plan.",
    href: "/features/simple-landing-page",
  },
  "audience-coaches": {
    bestFor: "Coaches, consultants, and solo experts selling audits, workshops, cohorts, or retainers.",
    outcome: "Qualify demand, sell the first package, and keep the follow-up organized around real buyers.",
    href: "/features/order-bump",
  },
  "audience-newsletter-publishers": {
    bestFor: "Audience owners who want to grow a list and turn attention into paid products.",
    outcome: "Capture subscribers, segment interest, and prepare a launch sequence without stitching together extra tools.",
    href: "/features/email-campaigns",
  },
  "audience-course-sellers": {
    bestFor: "Course creators, membership sellers, and productized knowledge businesses.",
    outcome: "Sell access, deliver protected files or lessons, and keep customer access tied to the purchase.",
    href: "/features/digital-products",
  },
  "audience-agencies": {
    bestFor: "Operators managing repeated launches, client offers, partner campaigns, and reporting.",
    outcome: "Reuse launch structures, review performance, and coordinate approvals across offers.",
    href: "/features/ad-tracking",
  },
  "audience-indie-hackers": {
    bestFor: "Tiny teams and builders who want one owned growth system around a minimum viable offer.",
    outcome: "Ship a useful funnel, take payment when ready, and keep enough context for AI helpers to assist.",
    href: "/features/ai-business-coach",
  },
};

function detailForSegment(id: string) {
  return (
    useCaseDetails[id] ?? {
      bestFor: "Publishers turning a focused audience into a paid offer.",
      outcome: "Shape the path from idea to signup, checkout, fulfillment, and follow-up.",
      href: "/features",
    }
  );
}

export default function UsersPage() {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Users and use cases</p>
          <h1>Use cases for indiepreneurs who sell from an owned audience.</h1>
          <p className="lede">
            Bumpgrade helps creators, coaches, newsletter writers, course sellers, agencies, small publishers, and
            indie hackers turn attention into a clear offer, a simple buyer path, and a follow-up system they can keep
            improving.
          </p>
          <div className="hero-actions">
            <Link href="/features" className="primary-action">
              Explore features
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="secondary-action">
              See launch pricing
              <Sparkles aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="route-status-panel" aria-label="User surface status">
          <Users aria-hidden="true" />
          <p>Find your path</p>
          <strong>{audienceSegments.length} launch paths</strong>
          <span>Pick the closest match, then start with the smallest offer that proves demand.</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Segments</p>
            <h2>Who Bumpgrade helps</h2>
          </div>
        </div>
        <div className="feature-grid">
          {audienceSegments.map((segment) => (
            <article key={segment.id} id={segment.id.replace("audience-", "")} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className="status-badge live">Use case</span>
                <Link href={detailForSegment(segment.id).href}>Start here</Link>
              </div>
              <h3>{segment.title}</h3>
              <p>{segment.summary}</p>
              <ul>
                {segment.primaryJobs.map((job) => (
                  <li key={job}>{job}</li>
                ))}
              </ul>
              <div className="feature-detail">
                <strong>Best for</strong>
                <span>{detailForSegment(segment.id).bestFor}</span>
              </div>
              <div className="feature-detail">
                <strong>Outcome</strong>
                <span>{detailForSegment(segment.id).outcome}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Launch path</p>
            <h2>Start with the buyer journey, then add the system around it.</h2>
          </div>
          <Link href="/features" className="text-link compact-link">
            See the stack
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-proof-grid">
          <div>
            <Compass aria-hidden="true" />
            <h3>Pick one launch path</h3>
            <p>Choose the use case that matches the next offer you want to validate.</p>
          </div>
          <div>
            <Sparkles aria-hidden="true" />
            <h3>Shape the first offer</h3>
            <p>Use the page, checkout, product, email, and analytics pieces that matter for that offer.</p>
          </div>
          <div>
            <BadgeCheck aria-hidden="true" />
            <h3>Invite real buyers</h3>
            <p>Launch with enough structure to learn quickly and improve the next version.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
