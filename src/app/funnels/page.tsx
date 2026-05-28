import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, PanelsTopLeft, Route, ShieldCheck } from "lucide-react";

import { MarketingProductVisual } from "@/components/marketing-product-visual";
import { funnelBlockLibrary, funnelTemplateLibrary, seededFunnels } from "@/lib/funnels";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Funnels",
  description:
    "Explore Bumpgrade funnel examples, reusable funnel templates, source data, checkout handoffs, imports, and public-safe launch boundaries.",
  alternates: {
    canonical: `${site.url}/funnels`,
  },
};

const relatedFeatureLinks = [
  { href: "/features/sales-funnels", label: "Sales funnels" },
  { href: "/features/simple-landing-page", label: "Landing pages" },
  { href: "/features/order-bump", label: "Order bumps" },
  { href: "/features/ai-business-coach", label: "AI business coach" },
];

const relatedRouteLinks = [
  { href: "/compare/clickfunnels-alternative", label: "ClickFunnels comparison" },
  { href: "/imports", label: "Importer center" },
  { href: "/imports/clickfunnels", label: "ClickFunnels importer" },
  { href: "/offers/indie-launch-stack", label: "Seeded offer stack" },
  { href: "/products/indie-launch-library", label: "Product access example" },
];

const liveCapabilities = [
  "Crawlable seeded funnel examples with ordered opt-in, sales, checkout, resource, webinar, and thank-you steps.",
  "Reusable funnel templates and block library records exposed through public-safe source data.",
  "Owner-session draft creation, editing, checkout linking, publishing, archive, unpublish, and purge controls.",
  "Published funnel routes can render linked checkout, resource-delivery, and webinar reference blocks without exposing private files, provider secrets, or buyer records.",
];

const notLiveCapabilities = [
  "Unauthenticated public agent publishing or unauthenticated public agent-created delivery tokens.",
  "Live billing mutation, arbitrary offer mutation, one-click upsell charging, or checkout-link deletion from public funnel pages.",
  "Live webinar scheduling, attendee tracking, reminder sending, replay hosting, or provider automation.",
  "Arbitrary uploaded private asset delivery, signed URL exposure, direct R2 object selection, or live fulfillment automation.",
];

export default function FunnelsPage() {
  const primaryFunnelRoute = seededFunnels[0]?.previewRoute ?? "/funnels/source-data";
  const templateCount = funnelTemplateLibrary.length;
  const reusableBlockCount = funnelBlockLibrary.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Bumpgrade funnels",
    url: `${site.url}/funnels`,
    description:
      "A public index for Bumpgrade funnel examples, reusable templates, source data, feature pages, comparisons, and importer routes.",
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: site.url,
    },
  };

  return (
    <main className="route-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replaceAll("<", "\\u003c") }}
      />

      <section className="route-hero">
        <div>
          <p className="eyebrow">Funnels</p>
          <h1>Plan the page path from first click to checkout, delivery, and follow-up.</h1>
          <p className="lede">
            Bumpgrade funnels keep opt-in pages, sales pages, checkout handoffs, product access, webinar references,
            and launch evidence connected so a publisher can inspect the whole path before changing what customers see.
          </p>
          <div className="hero-actions">
            <Link href={primaryFunnelRoute} className="primary-action">
              Open seeded funnel
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/funnels/source-data" className="secondary-action">
              View source data
              <BadgeCheck aria-hidden="true" />
            </Link>
          </div>
        </div>
        <MarketingProductVisual />
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Live public examples</p>
            <h2>Start from seeded funnel paths and inspect the connected records.</h2>
          </div>
          <p>
            The public examples are safe to crawl. Private draft copy, raw buyer data, provider credentials, private
            files, and owner session details stay out of public routes and source data.
          </p>
        </div>
        <div className="feature-grid">
          {seededFunnels.map((funnel) => (
            <article key={funnel.id} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className="status-badge live">Live example</span>
                <Link href={funnel.previewRoute}>Open route</Link>
              </div>
              <h3>{funnel.title}</h3>
              <p>{funnel.summary}</p>
              <div className="feature-detail">
                <strong>Steps</strong>
                <span>{funnel.steps.map((step) => step.kind.replaceAll("_", " ")).join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Evidence</strong>
                <span>
                  <Link href={funnel.sourceDataRoute}>Public funnel source data</Link>
                </span>
              </div>
            </article>
          ))}
          <article className="feature-card content-surface-card">
            <div className="feature-card-top">
              <span className="status-badge active">Reusable</span>
              <Link href="/funnels/source-data">Inspect data</Link>
            </div>
            <h3>{templateCount} templates and {reusableBlockCount} block types</h3>
            <p>
              Funnel templates cover warm list opt-ins, launch sales paths, webinar registration and replay pages, and
              resource delivery pages. Blocks stay typed so humans and agents can review the launch path.
            </p>
            <div className="feature-detail">
              <strong>Template examples</strong>
              <span>{funnelTemplateLibrary.map((template) => template.title).join(", ")}</span>
            </div>
          </article>
        </div>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Capability boundary</p>
            <h2>What is live now, and what still needs stronger write protections.</h2>
          </div>
          <p>
            Funnel pages can explain and render approved launch paths. Riskier billing, fulfillment, webinar, and public
            agent write actions remain outside the public funnel surface.
          </p>
        </div>
        <div className="feature-proof-grid">
          <div>
            <PanelsTopLeft aria-hidden="true" />
            <h3>Live now</h3>
            <ul>
              {liveCapabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Not live yet</h3>
            <ul>
              {notLiveCapabilities.map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
          </div>
          <div>
            <Route aria-hidden="true" />
            <h3>Connected records</h3>
            <p>
              Source data links the public funnel path to feature IDs, templates, checkout offer records, product access,
              importer routes, and comparison pages without exposing private operational state.
            </p>
          </div>
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Related paths</p>
            <h2>Use the funnel hub with feature pages, comparison pages, and migration paths.</h2>
          </div>
          <Link href="/features/sales-funnels" className="secondary-action">
            Sales funnel feature
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="linked-record-grid">
          <article>
            <h3>Feature pages</h3>
            <ul>
              {relatedFeatureLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Comparison and importer routes</h3>
            <ul>
              {relatedRouteLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Agent-readable data</h3>
            <ul>
              <li>
                <Link href="/funnels/source-data">Funnel source data</Link>
              </li>
              <li>
                <Link href="/features/source-data">Feature source data</Link>
              </li>
              <li>
                <Link href="/imports/source-data">Importer source data</Link>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
