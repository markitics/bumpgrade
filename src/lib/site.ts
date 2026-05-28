import type { LucideIcon } from "lucide-react";
import {
  Bot,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CircleDollarSign,
  FileArchive,
  FileText,
  FileUp,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  LogIn,
  Mail,
  Palette,
  PanelsTopLeft,
  Route,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";

export const site = {
  name: "Bumpgrade",
  domain: "bumpgrade.com",
  url: "https://bumpgrade.com",
  repo: "https://github.com/markitics/bumpgrade",
  contactEmail: "hello@bumpgrade.com",
  description:
    "A funnel, checkout, email, product delivery, analytics, and AI-assisted growth platform for publishers launching paid offers.",
};

export type NavItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  status?: "planned" | "live";
};

export const topNavItems: NavItem[] = [
  {
    label: "Features",
    href: "/features",
    description: "Funnel builder, checkout, products, email, analytics, affiliates, and AI-assisted launch planning.",
    icon: Sparkles,
    status: "live",
  },
  {
    label: "Funnels",
    href: "/funnels",
    description: "Public funnel examples, source data, templates, checkout handoffs, and launch boundaries.",
    icon: PanelsTopLeft,
    status: "live",
  },
  {
    label: "Playground",
    href: "/playground",
    description: "Save a private launch draft before signup, then attach it to Free Build when ready.",
    icon: Sparkles,
    status: "live",
  },
  {
    label: "Users",
    href: "/users",
    description: "Use cases for creators, coaches, course sellers, agencies, publishers, and indie hackers.",
    icon: Users,
    status: "live",
  },
  {
    label: "Developers and agents",
    href: "/developers-and-agents",
    description: "APIs, MCP, manifests, webhooks, and safe confirmed-write contracts.",
    icon: Bot,
    status: "live",
  },
  {
    label: "Resources",
    href: "/resources",
    description: "Comparison pages, migration guides, launch playbooks, and product notes.",
    icon: FileText,
    status: "live",
  },
  {
    label: "Brand",
    href: "/brand",
    description: "Logo assets, colors, typography, voice, and UI guidance for partners, press, and agents.",
    icon: Palette,
    status: "live",
  },
  {
    label: "Imports",
    href: "/imports",
    description: "Import planning for ClickFunnels, SamCart, Kit, Kajabi, Shopify, and related platforms.",
    icon: FileUp,
    status: "live",
  },
  {
    label: "Pricing",
    href: "/pricing",
    description: "Self-serve pricing and checkout for publishers starting Bumpgrade.",
    icon: CircleDollarSign,
    status: "live",
  },
];

export const adminNavItems: NavItem[] = [
  {
    label: "Director",
    href: "/admin/director",
    description: "Executive one-pager for recent changes, risks, due work, and nested workstreams.",
    icon: BriefcaseBusiness,
  },
  {
    label: "Admin roadmap",
    href: "/admin/roadmap",
    description: "Main feature status, owners, issues, PRs, and blockers.",
    icon: GitBranch,
  },
  {
    label: "Work log",
    href: "/admin/work-log",
    description: "Durable record of agent work, validation, screenshots, and ship notes.",
    icon: ListChecks,
  },
  {
    label: "User journeys",
    href: "/admin/user-journeys",
    description: "Named user paths tied to features, edge cases, and validation evidence.",
    icon: Route,
  },
  {
    label: "Draft funnels",
    href: "/admin/funnels",
    description: "Owner-gated draft funnel creation and ordered step records.",
    icon: PanelsTopLeft,
  },
  {
    label: "Products",
    href: "/admin/products",
    description: "Owner-gated product entitlement and fulfillment inspection.",
    icon: FileArchive,
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    description: "Owner-gated experiment decision evidence and analytics review.",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Owner attention",
    href: "/admin/for-mark",
    description: "Non-blocking owner decisions, risks, and blockers.",
    icon: Mail,
  },
];

export const firstWaveCompetitors = [
  "ClickFunnels",
  "Kit",
  "Shopify",
  "SamCart",
  "Kajabi",
  "Podia",
  "Systeme.io",
  "Kartra",
  "ThriveCart",
];

export const featurePillars = [
  {
    title: "Funnels and pages",
    body: "Draft multi-step funnels, opt-in pages, sales pages, launch paths, and agent-readable page state.",
    icon: PanelsTopLeft,
    issue: "#14",
  },
  {
    title: "Checkout and offers",
    body: "Stripe-backed checkouts, order bumps, one-click upsells, downsells, subscriptions, and audit trails.",
    icon: ShoppingCart,
    issue: "#15",
  },
  {
    title: "Admin and agents",
    body: "Owner roadmap, work-log, journeys, owner-attention queue, public docs, manifests, and MCP path.",
    icon: LayoutDashboard,
    issue: "#8",
  },
  {
    title: "Growth system",
    body: "Email, automation, CRM-lite, analytics, A/B testing, referrals, resources, and SEO surfaces.",
    icon: ChartNoAxesCombined,
    issue: "#17",
  },
];

export const scaffoldRoutes = [
  "/features",
  "/funnels",
  "/compare",
  "/roadmap",
  "/users",
  "/developers-and-agents",
  "/resources",
  "/imports",
  "/playground",
  "/brand",
  "/pricing",
  "/pricing-v2",
  "/pricing/success",
  "/account/setup",
  "/products/entitlements",
  "/commerce/checkout/success",
  "/commerce/checkout/cancel",
  "/login",
  "/admin/director",
  "/admin/roadmap",
  "/admin/work-log",
  "/admin/user-journeys",
  "/admin/funnels",
  "/admin/funnels/funnel-draft-indie-launch-working-copy/preview",
  "/admin/products",
  "/admin/analytics",
  "/admin/for-mark",
  "/agent-docs",
  "/agent-docs/bumpgrade-agent-surface",
  "/agent-docs/bumpgrade-commerce-contract",
  "/agent-docs/bumpgrade-source-evidence",
  "/agent-docs/bumpgrade-admin-surfaces",
  "/agent-docs/bumpgrade-mcp",
  "/agent-docs/bumpgrade-mobile-admin",
];

export const loginNavItem: NavItem = {
  label: "Log in / sign up",
  href: "/login?callbackURL=/account/setup",
  description: "Sign in or create a Bumpgrade publisher account.",
  icon: LogIn,
  status: "live",
};

export const accountNavItem: NavItem = {
  label: "Account",
  href: "/account/setup",
  description: "Publisher setup, paid plan status, and Bumpgrade subdomain reservation.",
  icon: LayoutDashboard,
  status: "live",
};
