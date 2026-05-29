import Image from "next/image";
import Link from "next/link";

import { site } from "@/lib/site";

type FooterLink = {
  label: string;
  href: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    title: "Explore",
    links: [
      { label: "Features", href: "/features" },
      { label: "Funnels", href: "/funnels" },
      { label: "Users", href: "/users" },
      { label: "Pricing", href: "/pricing" },
      { label: "Playground", href: "/playground" },
    ],
  },
  {
    title: "Move or compare",
    links: [
      { label: "Import center", href: "/imports" },
      { label: "ClickFunnels import", href: "/imports/clickfunnels" },
      { label: "Compare platforms", href: "/compare" },
      { label: "Resources", href: "/resources" },
      { label: "Brand kit", href: "/brand" },
    ],
  },
  {
    title: "Agents",
    links: [
      { label: "Developers and agents", href: "/developers-and-agents" },
      { label: "Agent docs", href: "/agent-docs" },
      { label: "Agent manifest", href: "/agent-docs/source-data" },
      { label: "Evidence guide", href: "/agent-docs/bumpgrade-source-evidence" },
      { label: "llms.txt", href: "/llms.txt" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Availability map", href: "/roadmap" },
      { label: "Trust records", href: "/trust/source-data" },
      { label: "Pricing policy", href: "/pricing/source-data" },
      { label: "Contact", href: `mailto:${site.contactEmail}` },
      { label: "GitHub repo", href: site.repo },
    ],
  },
];

const trustItems = [
  {
    label: "Available now",
    body: "Feature pages, pricing, imports, examples, and comparison guides are open for publishers to inspect.",
  },
  {
    label: "Agent readable",
    body: "Agents can start with docs, the manifest, llms.txt, and the evidence guide before using the web UI.",
  },
  {
    label: "Owner approval",
    body: "Publishing, billing, email sends, product access, and customer-impacting changes require deliberate approval.",
  },
];

function FooterNavigationLink({ href, label }: FooterLink) {
  if (href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}>
        {label}
      </a>
    );
  }

  return <Link href={href}>{label}</Link>;
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-summary">
            <Link href="/" className="site-footer-brand" aria-label="Bumpgrade home">
              <span className="site-footer-mark" aria-hidden="true">
                <Image src="/brand/bumpgrade-mark.svg" alt="" width={40} height={40} unoptimized />
              </span>
              <span>
                <strong>{site.name}</strong>
                <small>publisher growth OS</small>
              </span>
            </Link>
            <p>{site.description}</p>
            <div className="site-footer-trust-grid" aria-label="Trust and availability notes">
              {trustItems.map((item) => (
                <div key={item.label}>
                  <strong>{item.label}</strong>
                  <span>{item.body}</span>
                </div>
              ))}
            </div>
          </div>

          <nav className="site-footer-nav" aria-label="Footer navigation">
            {footerSections.map((section) => (
              <section key={section.title} className="site-footer-section">
                <h2>{section.title}</h2>
                <ul>
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.href}`}>
                      <FooterNavigationLink {...link} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div className="site-footer-bottom">
          <span>© {new Date().getFullYear()} {site.name}. Built for careful publisher launches.</span>
          <span>Legal docs are not public yet.</span>
        </div>
      </div>
    </footer>
  );
}
