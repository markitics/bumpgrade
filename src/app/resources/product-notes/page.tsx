import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, FileSearch, Sparkles } from "lucide-react";

import {
  ContentBand,
  MarketingCard,
  MarketingHero,
  SplitHeading,
} from "@/components/marketing-primitives";
import { resourceHubItems } from "@/lib/content-surfaces";
import { marketingDesignTokens } from "@/lib/marketing-design-tokens";
import { site } from "@/lib/site";

const resource = resourceHubItems.find((item) => item.id === "resource-product-notes-blog-index");

export const metadata: Metadata = {
  title: "Product Notes and Launch Guidance",
  description:
    "Bumpgrade product notes, launch guidance, commerce notes, agent contracts, and source-grounded resource paths for publishers.",
  alternates: {
    canonical: `${site.url}/resources/product-notes`,
  },
};

const currentNotes = [
  {
    title: "Commerce setup notes",
    href: "/agent-docs/bumpgrade-commerce-contract",
    body: "Read the current checkout, subscription, offer, and billing-safety boundaries before making commerce claims.",
  },
  {
    title: "Agent contract map",
    href: "/agent-docs",
    body: "Use the public agent docs to understand which Bumpgrade records are readable today and which actions need confirmation.",
  },
  {
    title: "Feature catalog",
    href: "/features",
    body: "Start from the public feature pages when you need product capability context in plain language.",
  },
  {
    title: "Comparison hub",
    href: "/compare",
    body: "Use the comparison pages for platform-switching research, then refresh volatile third-party facts before citing them.",
  },
  {
    title: "Importer center",
    href: "/imports",
    body: "Choose the import path that matches the source platform before mapping existing launch material into Bumpgrade.",
  },
];

const publicationSteps = [
  {
    label: "01",
    title: "Find the public record",
    href: "/content/source-data",
  },
  {
    label: "02",
    title: "Open the product context",
    href: "/features",
  },
  {
    label: "03",
    title: "Refresh platform facts",
    href: "/compare",
  },
];

export default function ProductNotesResourcePage() {
  return (
    <main className="route-page">
      <MarketingHero
        className="route-hero"
        eyebrow="Product notes"
        title="Launch guidance and product notes grounded in public Bumpgrade records."
        lede="Use this index when you need the current public notes behind Bumpgrade resources. It points to the guides, contracts, and feature pages that already have public evidence instead of treating future articles as live content."
        actions={
          <>
            <Link href="/resources" className={marketingDesignTokens.actionClasses.primary}>
              Back to resources
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/agent-docs" className={marketingDesignTokens.actionClasses.secondary}>
              Read agent docs
              <Sparkles aria-hidden="true" />
            </Link>
          </>
        }
        visual={
          <aside className="marketing-path-panel product-notes-path-panel" aria-label="Product notes status">
            <figure className="marketing-path-media">
              <Image
                src="/marketing/ai-launch-advisor-card.png"
                alt="Bumpgrade AI launch advisor card with grounded next-step recommendations."
                width={1200}
                height={650}
                priority
                unoptimized
              />
            </figure>
            <div className="marketing-path-summary">
              <BookOpen aria-hidden="true" />
              <p>{resource?.title ?? "Product notes"}</p>
              <strong>Live index</strong>
              <span>{resource?.agentBoundary ?? "Resource claims need evidence before publication."}</span>
            </div>
            <ol className="marketing-path-list">
              {publicationSteps.map((step) => (
                <li key={step.href}>
                  <span>{step.label}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <Link href={step.href}>Open path</Link>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        }
      />

      <ContentBand tone="alternate">
        <SplitHeading
          eyebrow="Current notes"
          title="Follow the route that matches the question you are answering."
          className="feature-section-heading"
        />
        <div className="feature-grid">
          {currentNotes.map((note) => (
            <MarketingCard key={note.href} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className="status-badge live">Available now</span>
                <Link href={note.href}>Open note</Link>
              </div>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </MarketingCard>
          ))}
        </div>
      </ContentBand>

      <ContentBand tone="dark">
        <SplitHeading
          eyebrow="Publication rule"
          title="Do not turn an idea into a factual claim without evidence."
          className="feature-section-heading"
        >
          <Link
            href="/content/source-data"
            className={`${marketingDesignTokens.actionClasses.text} ${marketingDesignTokens.actionClasses.compact}`}
          >
            Inspect evidence
            <ArrowRight aria-hidden="true" />
          </Link>
        </SplitHeading>
        <div className="feature-proof-grid">
          <div>
            <FileSearch aria-hidden="true" />
            <h3>Cite a public record</h3>
            <p>Use a feature page, agent doc, comparison page, or evidence route that already supports the statement.</p>
          </div>
          <div>
            <BookOpen aria-hidden="true" />
            <h3>Keep future material separate</h3>
            <p>Ideas for later articles should stay out of live resource copy until they have enough supporting context.</p>
          </div>
          <div>
            <Sparkles aria-hidden="true" />
            <h3>Refresh volatile facts</h3>
            <p>Third-party pricing, packaging, and platform capability details need fresh source checks before publication.</p>
          </div>
        </div>
      </ContentBand>
    </main>
  );
}
