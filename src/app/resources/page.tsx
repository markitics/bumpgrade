import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileText, FileSearch, Sparkles } from "lucide-react";

import { resourceHubItems } from "@/lib/content-surfaces";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Bumpgrade resources, comparison guides, migration guides, launch playbooks, product notes, and practical notes for publishers.",
  alternates: {
    canonical: `${site.url}/resources`,
  },
};

const resourceDisplay: Record<string, { title: string; summary: string; label: string; cta: string }> = {
  "resource-comparison-hub": {
    title: "Platform comparison hub",
    summary: "Compare Bumpgrade with the tools publishers already know so you can choose the right launch setup.",
    label: "Available now",
    cta: "Compare platforms",
  },
  "resource-clickfunnels-migration": {
    title: "ClickFunnels migration worksheet",
    summary: "A practical checklist for moving a sales funnel, checkout path, email follow-up, and offer stack into Bumpgrade.",
    label: "Migration worksheet",
    cta: "Open worksheet",
  },
  "resource-launch-playbook": {
    title: "Offer launch playbook",
    summary: "A step-by-step guide for turning a warm audience into an opt-in, sales page, checkout, follow-up, and reporting loop.",
    label: "Launch worksheet",
    cta: "See launch stack",
  },
  "resource-product-notes-blog-index": {
    title: "Product notes and launch essays",
    summary: "Short notes on what Bumpgrade is shipping, what early publishers can try, and how to think about launch systems.",
    label: "Available now",
    cta: "Open notes",
  },
  "resource-commerce-notes": {
    title: "Checkout setup notes",
    summary: "Plain-English notes on Bumpgrade plan checkout, publisher-offer checkout, payment review, and offer safety.",
    label: "Available now",
    cta: "Read notes",
  },
  "resource-brand-system": {
    title: "Brand system",
    summary: "Bumpgrade logo assets, favicon, colors, typography, and writing principles for humans and agents.",
    label: "Available now",
    cta: "Open brand",
  },
  "resource-agent-contracts": {
    title: "AI helper setup notes",
    summary: "How Bumpgrade keeps product, offer, customer, and launch context readable enough for AI helpers to assist safely.",
    label: "Available now",
    cta: "Read notes",
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

export default function ResourcesPage() {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Resources</p>
          <h1>Guides, comparisons, migrations, and launch notes for publishers.</h1>
          <p className="lede">
            Start with platform comparisons, checkout notes, and practical launch resources. The goal is simple: help
            you decide what to sell, where the buyer goes next, and which Bumpgrade features should support the first
            launch.
          </p>
          <div className="hero-actions">
            <Link href="/compare" className="primary-action">
              Compare platforms
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/features" className="secondary-action">
              Browse features
              <Sparkles aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="route-status-panel" aria-label="Resource surface status">
          <FileText aria-hidden="true" />
          <p>Resource library</p>
          <strong>{resourceHubItems.length} launch resources</strong>
          <span>Use the comparison hub, checkout notes, and worksheets to choose your next launch move.</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Resource hub</p>
            <h2>Start with the guide that matches the decision in front of you.</h2>
          </div>
        </div>
        <div className="feature-grid">
          {resourceHubItems.map((item) => {
            const display = displayForResource(item.id);
            return (
            <article key={item.id} id={item.id.replace("resource-", "")} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className="status-badge live">{display.label}</span>
                <Link href={item.route}>{display.cta}</Link>
              </div>
              <h3>{display.title}</h3>
              <p>{display.summary}</p>
              <div className="feature-detail">
                <strong>Best when</strong>
                <span>{item.type === "comparison" ? "You are choosing between platforms or explaining the switch." : "You want a clearer next step for your launch."}</span>
              </div>
              <div className="feature-detail">
                <strong>Use it to</strong>
                <span>{item.type === "migration" ? "Map what moves, what changes, and what can be simplified." : "Turn the idea into a decision you can act on."}</span>
              </div>
            </article>
          );
        })}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Reading path</p>
            <h2>Use the resources to shorten the path from research to launch.</h2>
          </div>
          <Link href="/features" className="text-link compact-link">
            Browse features
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
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
      </section>
    </main>
  );
}
