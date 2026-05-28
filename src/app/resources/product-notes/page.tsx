import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, FileSearch, Sparkles } from "lucide-react";

import { resourceHubItems } from "@/lib/content-surfaces";
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

export default function ProductNotesResourcePage() {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Product notes</p>
          <h1>Launch guidance and product notes grounded in public Bumpgrade records.</h1>
          <p className="lede">
            Use this index when you need the current public notes behind Bumpgrade resources. It points to the guides,
            contracts, and feature pages that already have public evidence instead of treating future articles as live
            content.
          </p>
          <div className="hero-actions">
            <Link href="/resources" className="primary-action">
              Back to resources
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/agent-docs" className="secondary-action">
              Read agent docs
              <Sparkles aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="route-status-panel" aria-label="Product notes status">
          <BookOpen aria-hidden="true" />
          <p>{resource?.title ?? "Product notes"}</p>
          <strong>Live index</strong>
          <span>{resource?.agentBoundary ?? "Resource claims need evidence before publication."}</span>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Current notes</p>
            <h2>Follow the route that matches the question you are answering.</h2>
          </div>
        </div>
        <div className="feature-grid">
          {currentNotes.map((note) => (
            <article key={note.href} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className="status-badge live">Available now</span>
                <Link href={note.href}>Open note</Link>
              </div>
              <h3>{note.title}</h3>
              <p>{note.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Publication rule</p>
            <h2>Do not turn an idea into a factual claim without evidence.</h2>
          </div>
          <Link href="/content/source-data" className="text-link compact-link">
            Inspect evidence
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
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
      </section>
    </main>
  );
}
