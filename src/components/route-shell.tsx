import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

type RouteShellProps = {
  eyebrow: string;
  title: string;
  body: string;
  issue: string;
  icon: LucideIcon;
  bullets: string[];
};

export function RouteShell({ eyebrow, title, body, issue, icon: Icon, bullets }: RouteShellProps) {
  return (
    <main className="route-page">
      <section className="route-hero">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lede">{body}</p>
          <Link href={`https://github.com/markitics/bumpgrade/issues/${issue.replace("#", "")}`} className="text-link">
            Track {issue}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <div className="route-status-panel">
          <Icon aria-hidden="true" />
          <p>Status</p>
          <strong>Planned</strong>
          <span>Scaffolded in the Cloudflare app foundation. Implementation lands in its issue slice.</span>
        </div>
      </section>
      <section className="content-band">
        <div className="section-heading">
          <p className="eyebrow">Expected shape</p>
          <h2>What this route will become</h2>
        </div>
        <div className="check-grid">
          {bullets.map((bullet) => (
            <div key={bullet} className="check-row">
              <span aria-hidden="true">✓</span>
              <p>{bullet}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
