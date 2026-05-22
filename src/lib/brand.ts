export const brandUpdatedAt = "2026-05-22";

export type BrandAsset = {
  id: string;
  title: string;
  route: string;
  format: "svg";
  usage: string;
  background: "light" | "dark" | "transparent";
};

export type BrandColor = {
  id: string;
  name: string;
  cssVariable: string;
  hex: string;
  usage: string;
};

export type BrandPrinciple = {
  id: string;
  title: string;
  body: string;
};

export const brandAssets: BrandAsset[] = [
  {
    id: "brand-asset-logo",
    title: "Primary logo",
    route: "/brand/bumpgrade-logo.svg",
    format: "svg",
    usage: "Use on light backgrounds when the full Bumpgrade name should be visible.",
    background: "light",
  },
  {
    id: "brand-asset-mark",
    title: "App mark",
    route: "/brand/bumpgrade-mark.svg",
    format: "svg",
    usage: "Use in tight chrome, nav, favicons, app icons, and places where the name is nearby.",
    background: "dark",
  },
  {
    id: "brand-asset-favicon",
    title: "Favicon",
    route: "/favicon.svg",
    format: "svg",
    usage: "Use as the browser icon and small bookmark identity.",
    background: "dark",
  },
  {
    id: "brand-asset-og",
    title: "Social card",
    route: "/brand/bumpgrade-og.svg",
    format: "svg",
    usage: "Use as the default Open Graph card until route-specific screenshots are more useful.",
    background: "light",
  },
];

export const brandIconRoutes = ["/favicon.svg", "/icon-192.png", "/icon-512.png", "/apple-touch-icon.png"];

export const brandColors: BrandColor[] = [
  {
    id: "brand-color-ink",
    name: "Ink",
    cssVariable: "--ink",
    hex: "#121713",
    usage: "Primary text, strong borders, and high-confidence interface copy.",
  },
  {
    id: "brand-color-paper",
    name: "Paper",
    cssVariable: "--paper",
    hex: "#f5f7f4",
    usage: "Default page background and quiet space around product surfaces.",
  },
  {
    id: "brand-color-green",
    name: "Launch green",
    cssVariable: "--green",
    hex: "#174131",
    usage: "Primary actions, logo mark, and positive state anchors.",
  },
  {
    id: "brand-color-blue",
    name: "System blue",
    cssVariable: "--blue",
    hex: "#1f536b",
    usage: "Secondary product evidence, source-data accents, and technical surfaces.",
  },
  {
    id: "brand-color-gold",
    name: "Signal gold",
    cssVariable: "--gold",
    hex: "#8a6424",
    usage: "Eyebrows, decision labels, and owner-attention emphasis.",
  },
  {
    id: "brand-color-rose",
    name: "Review rose",
    cssVariable: "--rose",
    hex: "#7c3e46",
    usage: "Review states, caveats, and proof labels that need a different visual register.",
  },
];

export const brandTypography = {
  family: "Inter, system UI, sans-serif",
  headline: "Large, direct, low-drama product claims with no negative letter spacing.",
  body: "Readable 16-18px prose for decision support and operational clarity.",
  ui: "Bold 12-14px labels for navigation, status, cards, and command surfaces.",
};

export const brandVoicePrinciples: BrandPrinciple[] = [
  {
    id: "brand-voice-direct",
    title: "Direct",
    body: "Say what Bumpgrade does in concrete launch jobs: pages, checkout, email, products, analytics, and AI-assisted review.",
  },
  {
    id: "brand-voice-evidence",
    title: "Evidence-backed",
    body: "Tie capability claims to source-data routes, issues, PRs, screenshots, or live product states.",
  },
  {
    id: "brand-voice-practical",
    title: "Practical",
    body: "Prefer the next useful action over broad promises about entrepreneurship, automation, or growth.",
  },
];

export const brandUiPrinciples: BrandPrinciple[] = [
  {
    id: "brand-ui-work-surface",
    title: "Work surface first",
    body: "Bumpgrade screens should feel like product surfaces for repeated decisions, not campaign pages that hide the workflow.",
  },
  {
    id: "brand-ui-proof-visible",
    title: "Proof visible",
    body: "Expose source-data, screenshots, roadmap state, and admin evidence close to the claim they support.",
  },
  {
    id: "brand-ui-restrained",
    title: "Restrained but not flat",
    body: "Use the full green, blue, gold, and rose palette to separate actions, evidence, decisions, and review states.",
  },
];

export const brandSourceData = {
  id: "bumpgrade-brand-source-data",
  status: "live",
  issue: 318,
  updatedAt: brandUpdatedAt,
  routes: [
    "/brand",
    "/brand/source-data",
    "/favicon.svg",
    "/icon-192.png",
    "/icon-512.png",
    "/apple-touch-icon.png",
    "/brand/bumpgrade-mark.svg",
    "/brand/bumpgrade-logo.svg",
  ],
  assets: brandAssets,
  iconRoutes: brandIconRoutes,
  colors: brandColors,
  typography: brandTypography,
  voicePrinciples: brandVoicePrinciples,
  uiPrinciples: brandUiPrinciples,
  agentBoundary:
    "Agents may read and cite this brand system. New public-facing brand changes should stay source-grounded and should not invent customer claims.",
};
