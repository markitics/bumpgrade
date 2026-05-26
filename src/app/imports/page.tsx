import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileUp, SearchCheck, ShieldCheck } from "lucide-react";

import { MarketingProductVisual } from "@/components/marketing-product-visual";
import { commonImporterSafetyGates, featuredImporter, importerPlatforms } from "@/lib/importers";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Import From ClickFunnels and Other Platforms",
  description:
    "Bring existing funnels, checkout paths, products, email context, and page copy into a private Bumpgrade workspace before going live.",
  alternates: {
    canonical: `${site.url}/imports`,
  },
};

function statusLabel(status: string) {
  return status === "private-draft-live" ? "Private import ready" : "Dedicated path";
}

export default function ImportsPage() {
  const publicSafetyGates = commonImporterSafetyGates.filter((gate) => !gate.includes("source-data"));

  return (
    <main className="route-page imports-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">Importer center</p>
          <h1>Bring your current launch stack into Bumpgrade before anything goes live.</h1>
          <p className="lede">
            Start with ClickFunnels, then use the same review-first path for checkout, email, product, and page context
            from the platforms publishers already use.
          </p>
          <div className="hero-actions">
            <Link href={featuredImporter.route} className="primary-action">
              Import from ClickFunnels
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/compare" className="secondary-action">
              Compare platforms
              <SearchCheck aria-hidden="true" />
            </Link>
          </div>
        </div>
        <MarketingProductVisual />
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Review first</p>
            <h2>Move the useful parts without accidentally changing what buyers see.</h2>
          </div>
          <p>
            Import paths collect the old page, offer, product, audience, and asset context in one place, then keep it
            private until the launch is ready.
          </p>
        </div>
        <div className="feature-proof-grid">
          <div>
            <FileUp aria-hidden="true" />
            <h3>Add current material</h3>
            <p>Use public URLs, files you already exported, CSVs, or pasted copy when a platform does not have a clean transfer path.</p>
          </div>
          <div>
            <SearchCheck aria-hidden="true" />
            <h3>Review the map</h3>
            <p>Check detected pages, offers, products, assets, audience notes, and follow-up ideas before Bumpgrade creates anything.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Go live deliberately</h3>
            <p>Publishing, checkout, subscriber sends, domains, and fulfillment stay off until the workspace is approved for launch.</p>
          </div>
        </div>
      </section>

      <section className="content-band" id="platforms">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Import paths</p>
            <h2>Choose the platform you are moving from.</h2>
          </div>
        </div>
        <div className="feature-grid">
          {importerPlatforms.map((platform) => (
            <article key={platform.id} className="feature-card content-surface-card">
              <div className="feature-card-top">
                <span className="status-badge active">{statusLabel(platform.status)}</span>
                <Link href={platform.route}>Open path</Link>
              </div>
              <h3>{platform.platformName}</h3>
              <p>{platform.summary}</p>
              <div className="feature-detail">
                <strong>Best for</strong>
                <span>{platform.bestFor}</span>
              </div>
              <div className="feature-detail">
                <strong>Starts with</strong>
                <span>{platform.inputs.map((input) => input.label).join(", ")}</span>
              </div>
              <div className="feature-detail">
                <strong>Bumpgrade reads</strong>
                <span>{platform.sourceChecklist.map((item) => item.label).join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Safety rules</p>
            <h2>The importer is built for careful launches, not surprise switches.</h2>
          </div>
          <Link href={featuredImporter.route} className="text-link compact-link">
            Start with ClickFunnels
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="feature-use-case-grid">
          {publicSafetyGates.map((gate) => (
            <span key={gate}>{gate}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
