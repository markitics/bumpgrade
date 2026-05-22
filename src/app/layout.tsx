import type { Metadata } from "next";

import { TopNav } from "@/components/top-nav";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Bumpgrade | Funnel, checkout, email, and growth platform",
    template: "%s | Bumpgrade",
  },
  description: site.description,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/bumpgrade-mark.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/brand/bumpgrade-mark.svg",
  },
  alternates: {
    canonical: site.url,
  },
  openGraph: {
    title: "Bumpgrade",
    description: site.description,
    url: site.url,
    siteName: "Bumpgrade",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
