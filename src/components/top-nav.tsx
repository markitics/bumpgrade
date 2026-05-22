"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { authClient } from "@/lib/auth-client";
import { BrandLockup } from "@/components/brand-logo";
import { accountNavItem, loginNavItem, topNavItems } from "@/lib/site";

function subscribeToHydrationStore() {
  return () => undefined;
}

function getClientHydrationSnapshot() {
  return true;
}

function getServerHydrationSnapshot() {
  return false;
}

export function TopNav() {
  const session = authClient.useSession();
  const hasHydrated = useSyncExternalStore(
    subscribeToHydrationStore,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const mobileNavPanelId = "mobile-nav-panel";
  const showLoginNavItem = hasHydrated && !session.isPending && !session.data?.user;
  const showAccountNavItem = hasHydrated && !session.isPending && Boolean(session.data?.user);
  const mobileNavItems = showLoginNavItem
    ? [...topNavItems, loginNavItem]
    : showAccountNavItem
      ? [...topNavItems, accountNavItem]
      : topNavItems;

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
        <BrandLockup />
      </Link>

      <nav className="desktop-nav" aria-label="Main navigation">
        {topNavItems.map((item) => (
          <Link key={item.href} href={item.href} className="nav-link">
            {item.label}
          </Link>
        ))}
      </nav>

      {showLoginNavItem ? (
        <Link href={loginNavItem.href} className="nav-cta">
          {loginNavItem.label}
        </Link>
      ) : null}

      {showAccountNavItem ? (
        <Link href={accountNavItem.href} className="nav-cta">
          {accountNavItem.label}
        </Link>
      ) : null}

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
          {mobileNavItems.map((item) => (
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
