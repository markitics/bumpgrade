import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, MessageSquareText, Palette, PanelsTopLeft, ShieldCheck, Type } from "lucide-react";

import { brandAssets, brandColors, brandTypography, brandUiPrinciples, brandVoicePrinciples } from "@/lib/brand";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Brand",
  description:
    "Bumpgrade logo, favicon, color, typography, voice, UI principles, and public brand assets for publisher-facing launch surfaces.",
  alternates: {
    canonical: `${site.url}/brand`,
  },
  openGraph: {
    title: "Bumpgrade brand",
    description:
      "Logo, favicon, color, typography, voice, and UI principles for the Bumpgrade publisher growth OS.",
    url: `${site.url}/brand`,
    images: [
      {
        url: "/brand/bumpgrade-og.svg",
        width: 1200,
        height: 630,
        alt: "Bumpgrade brand card",
      },
    ],
  },
};

export default function BrandPage() {
  return (
    <main className="brand-page">
      <section className="brand-hero">
        <div>
          <p className="eyebrow">Brand system</p>
          <h1>Bumpgrade should feel like a calm control room for publisher launches.</h1>
          <p className="lede">
            The brand pairs a compact stepped B mark with a practical product voice: direct, evidence-backed, and built
            for publishers making launch decisions across funnels, checkout, email, products, analytics, and AI guidance.
          </p>
          <div className="hero-actions">
            <Link href="/brand/bumpgrade-logo.svg" className="primary-action">
              Open logo
              <Download aria-hidden="true" />
            </Link>
            <Link href="/pricing" className="secondary-action">
              See it in context
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
        <aside className="brand-specimen" aria-label="Bumpgrade logo preview">
          <Image
            src="/brand/bumpgrade-logo.svg"
            alt="Bumpgrade logo"
            width={920}
            height={260}
            priority
            unoptimized
          />
          <div className="brand-specimen-grid">
            <span>Publisher growth OS</span>
            <span>Launch workspace</span>
            <span>Funnel, checkout, email</span>
          </div>
        </aside>
      </section>

      <section className="content-band alternate">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Assets</p>
            <h2>Logo, mark, favicon, and social card</h2>
          </div>
          <Link href="/brand/bumpgrade-logo.svg" className="text-link compact-link">
            Open primary logo
            <Download aria-hidden="true" />
          </Link>
        </div>
        <div className="brand-asset-grid">
          {brandAssets.map((asset) => (
            <article key={asset.id} className="brand-asset-card">
              <div className={`brand-asset-preview ${asset.background}`}>
                <Image src={asset.route} alt="" width={asset.id === "brand-asset-og" ? 480 : 360} height={asset.id === "brand-asset-og" ? 252 : 160} unoptimized />
              </div>
              <div>
                <span>{asset.format}</span>
                <h3>{asset.title}</h3>
                <p>{asset.usage}</p>
              </div>
              <Link href={asset.route} className="text-link compact-link">
                Open asset
                <Download aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Palette</p>
            <h2>Use color to separate actions, decisions, support notes, and product states.</h2>
          </div>
        </div>
        <div className="brand-color-grid">
          {brandColors.map((color) => (
            <article key={color.id} className="brand-color-card">
              <div className="brand-color-chip" style={{ backgroundColor: color.hex }} aria-hidden="true" />
              <span>{color.cssVariable}</span>
              <h3>{color.name}</h3>
              <strong>{color.hex}</strong>
              <p>{color.usage}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-band dark-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Voice and UI</p>
            <h2>Keep every surface useful for a publisher trying to launch.</h2>
          </div>
        </div>
        <div className="brand-principle-grid">
          <article className="brand-principle-card">
            <MessageSquareText aria-hidden="true" />
            <h3>Voice</h3>
            {brandVoicePrinciples.map((principle) => (
              <p key={principle.id}>
                <strong>{principle.title}.</strong> {principle.body}
              </p>
            ))}
          </article>
          <article className="brand-principle-card">
            <PanelsTopLeft aria-hidden="true" />
            <h3>Interface</h3>
            {brandUiPrinciples.map((principle) => (
              <p key={principle.id}>
                <strong>{principle.title}.</strong> {principle.body}
              </p>
            ))}
          </article>
          <article className="brand-principle-card">
            <Type aria-hidden="true" />
            <h3>Typography</h3>
            <p>
              <strong>Family.</strong> {brandTypography.family}
            </p>
            <p>
              <strong>Headlines.</strong> {brandTypography.headline}
            </p>
            <p>
              <strong>Body.</strong> {brandTypography.body}
            </p>
            <p>
              <strong>UI.</strong> {brandTypography.ui}
            </p>
          </article>
        </div>
      </section>

      <section className="content-band">
        <div className="feature-section-heading">
          <div>
            <p className="eyebrow">Usage</p>
            <h2>Use the mark where space is tight and the full logo where the brand needs to stand alone.</h2>
          </div>
        </div>
        <div className="brand-guideline-grid">
          <div>
            <Palette aria-hidden="true" />
            <h3>Keep enough contrast</h3>
            <p>Use the green mark on light backgrounds. On dark bands, give the logo a light panel or use the mark alone.</p>
          </div>
          <div>
            <ShieldCheck aria-hidden="true" />
            <h3>Keep claims grounded</h3>
            <p>Brand copy should make concrete promises about funnels, checkout, email, products, analytics, and AI help.</p>
          </div>
          <div>
            <PanelsTopLeft aria-hidden="true" />
            <h3>Keep UI operational</h3>
            <p>Buttons, cards, and panels should help a publisher decide the next launch action without marketing clutter.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
