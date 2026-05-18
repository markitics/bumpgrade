import Link from "next/link";
import { Menu } from "lucide-react";

import { loginNavItem, site, topNavItems } from "@/lib/site";

export function TopNav() {
  return (
    <header className="site-header">
      <Link href="/" className="brand-link" aria-label="Bumpgrade home">
        <span className="brand-mark" aria-hidden="true">
          B
        </span>
        <span>
          <span className="brand-name">{site.name}</span>
          <span className="brand-subtitle">publisher growth OS</span>
        </span>
      </Link>

      <nav className="desktop-nav" aria-label="Main navigation">
        {topNavItems.map((item) => (
          <Link key={item.href} href={item.href} className="nav-link">
            {item.label}
          </Link>
        ))}
      </nav>

      <Link href={loginNavItem.href} className="nav-cta">
        {loginNavItem.label}
      </Link>

      <details className="mobile-nav">
        <summary aria-label="Open navigation">
          <Menu aria-hidden="true" />
        </summary>
        <div className="mobile-nav-panel">
          {[...topNavItems, loginNavItem].map((item) => (
            <Link key={item.href} href={item.href}>
              <item.icon aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </details>
    </header>
  );
}
