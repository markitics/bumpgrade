import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Compass, Sparkles, Users } from "lucide-react";

import {
  ContentBand,
  MarketingCard,
  MarketingHero,
  SplitHeading,
} from "@/components/marketing-primitives";
import { audienceSegments } from "@/lib/content-surfaces";
import { marketingDesignTokens } from "@/lib/marketing-design-tokens";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Users and Use Cases",
  description:
    "Bumpgrade use cases for creators, coaches, newsletter writers, course sellers, agencies, small publishers, and indie hackers.",
  alternates: {
    canonical: `${site.url}/users`,
  },
};

const featuredAudienceSegments = audienceSegments.slice(0, 3);

export default function UsersPage() {
  return (
    <main className="route-page">
      <MarketingHero
        className="route-hero"
        eyebrow="Users and use cases"
        title="Use cases for indiepreneurs who sell from an owned audience."
        lede="Bumpgrade helps creators, coaches, newsletter writers, course sellers, agencies, small publishers, and indie hackers turn attention into a clear offer, a simple buyer path, and a follow-up system they can keep improving."
        actions={
          <>
            <Link href="/features" className={marketingDesignTokens.actionClasses.primary}>
              Explore features
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing" className={marketingDesignTokens.actionClasses.secondary}>
              See launch pricing
              <Sparkles aria-hidden="true" />
            </Link>
          </>
        }
        visual={
          <aside className="marketing-path-panel audience-path-panel" aria-label="User surface status">
            <figure className="marketing-path-media">
              <Image
                src="/marketing/audience-email-card.png"
                alt="Bumpgrade audience email workspace with opt-in, consent, segment, and nurture steps."
                width={1200}
                height={650}
                priority
                unoptimized
              />
            </figure>
            <div className="marketing-path-summary">
              <Users aria-hidden="true" />
              <p>Find your path</p>
              <strong>{audienceSegments.length} launch paths</strong>
              <span>Pick the closest match, then start with the smallest offer that proves demand.</span>
            </div>
            <ol className="marketing-path-list">
              {featuredAudienceSegments.map((segment, index) => (
                <li key={segment.id}>
                  <span>{`0${index + 1}`}</span>
                  <div>
                    <strong>{segment.title}</strong>
                    <Link href={segment.route}>Open use case</Link>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        }
      />

      <ContentBand tone="alternate">
        <SplitHeading eyebrow="Segments" title="Who Bumpgrade helps" className="feature-section-heading" />
        <div className="feature-grid audience-segment-grid">
          {audienceSegments.map((segment) => (
            <MarketingCard key={segment.id} id={segment.slug} className="feature-card content-surface-card audience-segment-card">
              <div className="feature-card-top">
                <span className="status-badge live">Use case</span>
                <Link href={segment.route}>View page</Link>
              </div>
              <h3>{segment.title}</h3>
              <p>{segment.summary}</p>
              <ul className="audience-job-list">
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
            </MarketingCard>
          ))}
        </div>
      </ContentBand>

      <ContentBand tone="dark">
        <SplitHeading
          eyebrow="Launch path"
          title="Start with the buyer journey, then add the system around it."
          className="feature-section-heading"
        >
          <Link
            href="/features"
            className={`${marketingDesignTokens.actionClasses.text} ${marketingDesignTokens.actionClasses.compact}`}
          >
            See the stack
            <ArrowRight aria-hidden="true" />
          </Link>
        </SplitHeading>
        <ol className="audience-launch-rail">
          <li>
            <span>01</span>
            <Compass aria-hidden="true" />
            <div>
              <h3>Pick one launch path</h3>
              <p>Choose the use case that matches the next offer you want to validate.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <Sparkles aria-hidden="true" />
            <div>
              <h3>Shape the first offer</h3>
              <p>Use the page, checkout, product, email, and analytics pieces that matter for that offer.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <BadgeCheck aria-hidden="true" />
            <div>
              <h3>Invite real buyers</h3>
              <p>Launch with enough structure to learn quickly and improve the next version.</p>
            </div>
          </li>
        </ol>
      </ContentBand>
    </main>
  );
}
