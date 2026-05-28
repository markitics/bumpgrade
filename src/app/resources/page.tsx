import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, FileSearch, Sparkles } from "lucide-react";

import {
  ContentBand,
  MarketingCard,
  MarketingHero,
  SplitHeading,
} from "@/components/marketing-primitives";
import { resourceHubItems } from "@/lib/content-surfaces";
import { marketingDesignTokens } from "@/lib/marketing-design-tokens";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Bumpgrade resources, comparison guides, migration guides, launch playbooks, product notes, and practical notes for publishers.",
  alternates: {
    canonical: `${site.url}/resources`,
  },
};

const resourcePathSteps = [
  {
    label: "01",
    title: "Compare the platform decision",
    href: "/compare",
  },
  {
    label: "02",
    title: "Map the source platform",
    href: "/imports",
  },
  {
    label: "03",
    title: "Publish from evidence",
    href: "/content/source-data",
  },
];

const resourceDisplay: Record<
  string,
  {
    title: string;
    summary: string;
    label: string;
    cta: string;
    href?: string;
    bestWhen?: string;
    useItTo?: string;
  }
> = {
  "resource-comparison-hub": {
    title: "Platform comparison hub",
    summary: "Compare Bumpgrade with the tools publishers already know so you can choose the right launch setup.",
    label: "Available now",
    cta: "Compare platforms",
  },
  "resource-clickfunnels-migration": {
    title: "ClickFunnels importer",
    summary: "A review-first path for moving funnel pages, checkout notes, product context, and follow-up ideas into Bumpgrade.",
    label: "Available now",
    cta: "Open importer",
  },
  "resource-import-center": {
    title: "Importer center",
    summary: "Choose a dedicated import path for ClickFunnels, SamCart, Kit, Kajabi, Shopify, Podia, Systeme.io, Kartra, or ThriveCart.",
    label: "Available now",
    cta: "See import paths",
  },
  "resource-launch-playbook": {
    title: "Offer launch playbook",
    summary:
      "A future guide for connecting opt-in, sales, checkout, follow-up, and reporting work once the supporting launch paths have stronger public evidence.",
    label: "Not live yet",
    cta: "See related features",
    href: "/features",
    bestWhen: "You are shaping a launch path and want the current feature pages first.",
    useItTo: "Track the pieces that need stronger public evidence before this becomes a full guide.",
  },
  "resource-product-notes-blog-index": {
    title: "Launch essays and product guidance",
    summary: "Current public notes on Bumpgrade launch systems, feature choices, and safer offer workflows.",
    label: "Available now",
    cta: "Open notes",
  },
  "resource-commerce-notes": {
    title: "Checkout setup notes",
    summary: "Plain-English notes on Bumpgrade plan checkout, publisher-offer checkout, payment review, and offer safety.",
    label: "Available now",
    cta: "Read notes",
  },
  "resource-agent-contracts": {
    title: "AI launch helper guide",
    summary: "How AI helpers can use Bumpgrade launch context to plan funnels, offers, email, product delivery, and next actions.",
    label: "Available now",
    cta: "Read notes",
  },
  "resource-brand-kit": {
    title: "Bumpgrade brand kit",
    summary: "Logo, favicon, social card, color, typography, voice, and UI principles for public launch surfaces.",
    label: "Available now",
    cta: "Open brand kit",
  },
};

function displayForResource(id: string) {
  return (
    resourceDisplay[id] ?? {
      title: "Bumpgrade resource",
      summary: "A practical guide for shaping, launching, and improving a publisher offer.",
      label: "Available now",
      cta: "Open",
    }
  );
}

function resourceStatusClass(status: "live" | "planned") {
  return status === "live" ? "live" : "planned";
}

function resourceBestWhen(type: string) {
  return type === "comparison"
    ? "You are choosing between platforms or explaining the switch."
    : "You want a clearer next step for your launch.";
}

function resourceUseItTo(type: string) {
  return type === "migration"
    ? "Map what moves, what changes, and what can be simplified."
    : "Turn the idea into a decision you can act on.";
}

export default function ResourcesPage() {
  return (
    <main className="route-page">
      <MarketingHero
        className="route-hero"
        eyebrow="Resources"
        title="Guides, comparisons, migrations, and launch notes for publishers."
        lede="Start with platform comparisons, checkout notes, and practical launch resources. The goal is simple: help you decide what to sell, where the buyer goes next, and which Bumpgrade features should support the first launch."
        actions={
          <>
            <Link href="/compare" className={marketingDesignTokens.actionClasses.primary}>
              Compare platforms
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/features" className={marketingDesignTokens.actionClasses.secondary}>
              Browse features
              <Sparkles aria-hidden="true" />
            </Link>
          </>
        }
        visual={
          <aside className="marketing-path-panel resource-path-panel" aria-label="Resource surface status">
            <figure className="marketing-path-media">
              <Image
                src="/marketing/launch-funnel-card.png"
                alt="Bumpgrade launch funnel workspace with opt-in, offer, checkout, and delivery steps."
                width={1200}
                height={650}
                priority
                unoptimized
              />
            </figure>
            <div className="marketing-path-summary">
              <FileText aria-hidden="true" />
              <p>Resource library</p>
              <strong>{resourceHubItems.length} launch resources</strong>
              <span>
                Use available guides, checkout notes, and clearly marked future guides to choose your next launch move.
              </span>
            </div>
            <ol className="marketing-path-list">
              {resourcePathSteps.map((step) => (
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
          eyebrow="Resource hub"
          title="Start with the guide that matches the decision in front of you."
          className="feature-section-heading"
        />
        <div className="feature-grid">
          {resourceHubItems.map((item) => {
            const display = displayForResource(item.id);
            return (
              <MarketingCard
                key={item.id}
                id={item.id.replace("resource-", "")}
                className="feature-card content-surface-card"
              >
                <div className="feature-card-top">
                  <span className={`status-badge ${resourceStatusClass(item.status)}`}>{display.label}</span>
                  <Link href={display.href ?? item.route}>{display.cta}</Link>
                </div>
                <h3>{display.title}</h3>
                <p>{display.summary}</p>
                <div className="feature-detail">
                  <strong>Best when</strong>
                  <span>{display.bestWhen ?? resourceBestWhen(item.type)}</span>
                </div>
                <div className="feature-detail">
                  <strong>Use it to</strong>
                  <span>{display.useItTo ?? resourceUseItTo(item.type)}</span>
                </div>
              </MarketingCard>
            );
          })}
        </div>
      </ContentBand>

      <ContentBand tone="dark">
        <SplitHeading
          eyebrow="Reading path"
          title="Use the resources to shorten the path from research to launch."
          className="feature-section-heading"
        >
          <Link
            href="/features"
            className={`${marketingDesignTokens.actionClasses.text} ${marketingDesignTokens.actionClasses.compact}`}
          >
            Browse features
            <ArrowRight aria-hidden="true" />
          </Link>
        </SplitHeading>
        <div className="feature-proof-grid">
          <div>
            <FileSearch aria-hidden="true" />
            <h3>Compare first</h3>
            <p>Use the comparison hub when you need to understand how Bumpgrade differs from the tools you already know.</p>
          </div>
          <div>
            <BookOpen aria-hidden="true" />
            <h3>Choose the launch move</h3>
            <p>Pick the guide that helps you decide the next page, offer, checkout, email, or product step.</p>
          </div>
          <div>
            <Sparkles aria-hidden="true" />
            <h3>Choose the missing piece</h3>
            <p>Use the feature pages and comparison hub to pick the next launch, checkout, audience, or product step.</p>
          </div>
        </div>
      </ContentBand>
    </main>
  );
}
