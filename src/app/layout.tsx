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
  alternates: {
    canonical: site.url,
  },
  openGraph: {
    title: "Bumpgrade",
    description: site.description,
    url: site.url,
    siteName: "Bumpgrade",
    type: "website",
    images: [
      {
        url: "/brand/bumpgrade-og.svg",
        width: 1200,
        height: 630,
        alt: "Bumpgrade brand card",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bumpgrade",
    description: site.description,
    images: ["/brand/bumpgrade-og.svg"],
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.svg",
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
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
