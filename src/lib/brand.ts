export const brandUpdatedAt = "2026-05-22";

export const brandAssets = [
  {
    id: "brand-mark-svg",
    label: "Bumpgrade mark",
    route: "/brand/bumpgrade-mark.svg",
    format: "svg",
    use: "Favicon, compact navigation, app icon, and small square placements.",
  },
  {
    id: "brand-logo-svg",
    label: "Bumpgrade lockup",
    route: "/brand/bumpgrade-logo.svg",
    format: "svg",
    use: "Public brand page, social previews where SVG is supported, and partner references.",
  },
  {
    id: "favicon-svg",
    label: "Favicon",
    route: "/favicon.svg",
    format: "svg",
    use: "Browser tabs and metadata icon fallback.",
  },
];

export const brandColors = [
  {
    id: "ink",
    name: "Ink",
    value: "#121713",
    role: "Primary text and high-contrast action surfaces.",
  },
  {
    id: "growth-green",
    name: "Growth green",
    value: "#12392d",
    role: "Logo core, primary buttons, and durable platform signals.",
  },
  {
    id: "signal-blue",
    name: "Signal blue",
    value: "#1f536b",
    role: "Data, agent, and infrastructure accents.",
  },
  {
    id: "harvest-gold",
    name: "Harvest gold",
    value: "#d8a443",
    role: "Upgrade path, progress, and small highlight strokes.",
  },
  {
    id: "paper",
    name: "Paper",
    value: "#f5f7f4",
    role: "Default page background.",
  },
  {
    id: "soft-blue",
    name: "Soft blue",
    value: "#e6eef0",
    role: "Quiet bands and product-documentation surfaces.",
  },
];

export const brandVoicePrinciples = [
  {
    id: "plain-launch-language",
    title: "Plain launch language",
    summary: "Say what the feature does, what it unlocks, and what the next action is. Avoid vague request, pilot, or insider wording.",
  },
  {
    id: "publisher-first",
    title: "Publisher first",
    summary: "Frame decisions around the person launching an offer, not around internal implementation milestones.",
  },
  {
    id: "source-grounded",
    title: "Source grounded",
    summary: "Claims about features, pricing, competitors, and roadmap state should point to a route, source-data contract, issue, PR, or work-log record.",
  },
  {
    id: "calm-operational-ui",
    title: "Calm operational UI",
    summary: "Use dense, scannable layouts, familiar controls, and restrained color so repeated work feels fast instead of theatrical.",
  },
];

export const brandSourceData = {
  id: "bumpgrade-brand-system-v1",
  status: "live",
  issue: 318,
  updatedAt: brandUpdatedAt,
  route: "/brand",
  sourceDataRoute: "/brand/source-data",
  logoConcept:
    "A geometric B inside a rounded square, crossed by a gold upgrade step. The mark should read as Bumpgrade, publisher growth, and a concrete next step.",
  assets: brandAssets,
  colors: brandColors,
  voicePrinciples: brandVoicePrinciples,
  typography: {
    family: "Inter, system UI, sans-serif",
    rule: "Use strong hierarchy, 0 letter spacing, and compact headings inside product surfaces.",
  },
};
