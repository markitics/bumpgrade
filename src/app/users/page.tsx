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
            <article key={segment.id} id={segment.slug} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className="status-badge live">Use case</span>
                <Link href={segment.route}>View page</Link>
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
                <span>{segment.bestFor}</span>
              </div>
              <div className="feature-detail">
                <strong>Outcome</strong>
                <span>{segment.outcome}</span>
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
