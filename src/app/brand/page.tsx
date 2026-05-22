import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, Palette, ShieldCheck, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand-logo";
import { brandAssets, brandColors, brandSourceData, brandVoicePrinciples } from "@/lib/brand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Brand",
  description:
    "Bumpgrade brand assets, logo usage, colors, typography, voice, UI principles, and public source-data references.",
  alternates: {
    canonical: `${site.url}/brand`,
  },
};

export default function BrandPage() {
  return (
    <main className="brand-page">
      <section className="brand-hero">
        <div>
          <p className="eyebrow">Bumpgrade brand</p>
          <h1>A practical growth mark for publisher launch systems.</h1>
          <p className="lede">
            The Bumpgrade identity should feel direct, operational, and durable: a publisher has a next offer to launch,
            a checkout path to trust, and enough source-grounded context for humans and agents to work from the same facts.
          </p>
          <div className="hero-actions">
            <Link href="/brand/source-data" className="primary-action">
              Brand source data
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="secondary-action">
              See live pricing
              <Sparkles aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="brand-showcase" aria-label="Bumpgrade logo preview">
          <BrandMark className="brand-showcase-mark" title="Bumpgrade mark" />
          <div>
            <span>Bumpgrade</span>
            <strong>publisher growth OS</strong>
          </div>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Logo system</p>
            <h2>Use the mark when space is tight and the lockup when the name needs to travel.</h2>
          </div>
          <p>
            The mark combines a geometric B with a gold upgrade step so it reads as both the product name and the job
            Bumpgrade does: move a publisher from a rough launch to a stronger one.
          </p>
        </div>
        <div className="brand-asset-grid">
          {brandAssets.map((asset) => (
            <article key={asset.id} className="brand-asset-card">
              <div className="brand-asset-preview">
                <Image
                  src={asset.route}
                  alt={asset.id === "brand-logo-svg" ? "Bumpgrade logo lockup" : asset.label}
                  width={asset.id === "brand-logo-svg" ? 260 : 96}
                  height={96}
                  unoptimized
                />
              </div>
              <span>{asset.format.toUpperCase()}</span>
              <h3>{asset.label}</h3>
              <p>{asset.use}</p>
              <Link href={asset.route} className="text-link compact-link">
                Open asset
                <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Color</p>
            <h2>Ground the product in ink, green, blue, and gold.</h2>
          </div>
          <p>
            The palette stays quiet enough for work surfaces, but the gold step and blue signal accents keep the brand
            from becoming a single green block.
          </p>
        </div>
        <div className="brand-color-grid">
          {brandColors.map((color) => (
            <article key={color.id} className="brand-color-card">
              <span style={{ background: color.value }} />
              <div>
                <h3>{color.name}</h3>
                <code>{color.value}</code>
                <p>{color.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band alternate">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Voice and interface</p>
            <h2>Make the offer, evidence, and next action obvious.</h2>
          </div>
          <p>
            Bumpgrade pages should tell a publisher what they can do today, what evidence supports the claim, and where
            the billing or agent boundary sits.
          </p>
        </div>
        <div className="brand-principle-grid">
          {brandVoicePrinciples.map((principle) => (
            <article key={principle.id} className="brand-principle-card">
              <BadgeCheck aria-hidden="true" />
              <h3>{principle.title}</h3>
              <p>{principle.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band brand-proof-band">
        <div className="split-heading">
          <div>
            <p className="eyebrow">Public contract</p>
            <h2>Agents can cite the same brand contract humans read.</h2>
          </div>
          <p>
            Contract {brandSourceData.id} exposes logo assets, colors, voice principles, typography, and source routes
            without private design files.
          </p>
        </div>
        <div className="brand-proof-strip">
          <span>
            <Palette aria-hidden="true" />
            Color tokens
          </span>
          <span>
            <FileText aria-hidden="true" />
            Asset routes
          </span>
          <span>
            <ShieldCheck aria-hidden="true" />
            Public-safe source data
          </span>
        </div>
      </section>
    </main>
  );
}
