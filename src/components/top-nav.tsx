"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { loginNavItem, site, topNavItems } from "@/lib/site";

export function TopNav() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileNavPanelId = "mobile-nav-panel";

  useEffect(() => {
    if (!mobileNavOpen) return undefined;

    function handlePointerDown(event: PointerEvent) {
      if (!mobileNavRef.current?.contains(event.target as Node)) {
        setMobileNavOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileNavOpen]);

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

      <div className="mobile-nav" ref={mobileNavRef}>
        <button
          type="button"
          className="mobile-nav-trigger"
          aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileNavOpen}
          aria-controls={mobileNavPanelId}
          onClick={() => setMobileNavOpen((isOpen) => !isOpen)}
        >
          <Menu aria-hidden="true" />
        </button>
        <div className="mobile-nav-panel" id={mobileNavPanelId} hidden={!mobileNavOpen}>
          {[...topNavItems, loginNavItem].map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMobileNavOpen(false)}>
              <item.icon aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
