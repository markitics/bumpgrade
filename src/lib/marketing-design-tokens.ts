export const marketingDesignTokens = {
  cssVariables: {
    ink: "var(--ink)",
    muted: "var(--muted)",
    panel: "var(--panel)",
    paper: "var(--paper)",
    line: "var(--line)",
    green: "var(--green)",
    gold: "var(--gold)",
    rose: "var(--rose)",
    shadow: "var(--shadow)",
  },
  layoutClasses: {
    heroActions: "hero-actions",
    contentBand: "content-band",
    alternateBand: "alternate",
    darkBand: "dark-band",
    splitHeading: "split-heading",
    sectionHeading: "section-heading",
    compareSectionHeading: "compare-section-heading",
    featureSectionHeading: "feature-section-heading",
  },
  actionClasses: {
    primary: "primary-action",
    secondary: "secondary-action",
    text: "text-link",
    compact: "compact-link",
  },
  badgeClasses: {
    base: "status-badge",
    live: "live",
    active: "active",
    pending: "pending",
    planned: "planned",
    shipped: "shipped",
    blocked: "blocked",
    next: "next",
  },
  tableClasses: {
    table: "comparison-table",
    row: "comparison-table-row",
    head: "comparison-table-head",
  },
} as const;

export type MarketingBadgeTone = keyof Omit<typeof marketingDesignTokens.badgeClasses, "base">;
export type MarketingBandTone = "default" | "alternate" | "dark";
