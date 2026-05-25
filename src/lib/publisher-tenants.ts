import { getCloudflareContext } from "@opennextjs/cloudflare";

import { describeBetterAuthSessionBoundary } from "@/lib/auth";

export type PublisherPlanEntitlementStatus = "active" | "inactive" | "expired";
export type PublisherTenantStatus = "active" | "suspended";
export type PublisherTenantPlanStatus = "free_build" | "paid";
export type PublisherSubdomainReservationStatus = "active" | "reserved" | "released";
export type PublisherCustomDomainStatus =
  | "pending_dns"
  | "dns_verified"
  | "ssl_pending"
  | "active"
  | "failed"
  | "disabled";
export type PublisherAccountStateKind = "signed_out" | "ready" | "free_build" | "unverified" | "unpaid" | "unavailable";

export type PublisherSessionUser = {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: boolean | null;
};

export type PublisherPlanEntitlement = {
  id: string;
  ownerUserId: string | null;
  ownerEmail: string;
  status: PublisherPlanEntitlementStatus;
  source: string;
  planSlug: string;
  startsAt: string | null;
  endsAt: string | null;
  updatedAt: string | null;
};

export type PublisherTenant = {
  id: string;
  ownerUserId: string | null;
  ownerEmail: string;
  displayName: string;
  status: PublisherTenantStatus;
  planStatus: PublisherTenantPlanStatus;
  defaultSubdomain: string | null;
  primaryHostname: string | null;
  sourceIssueNumber: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PublisherSubdomainReservation = {
  id: string;
  tenantId: string;
  ownerUserId: string | null;
  ownerEmail: string;
  subdomain: string;
  fullHostname: string;
  status: PublisherSubdomainReservationStatus;
  sourceIssueNumber: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PublisherCustomDomain = {
  id: string;
  tenantId: string;
  ownerUserId: string | null;
  ownerEmail: string;
  domainName: string;
  normalizedDomain: string;
  status: PublisherCustomDomainStatus;
  dnsInstruction: PublisherDnsInstruction;
  dnsLastCheckedAt: string | null;
  dnsVerifiedAt: string | null;
  sslStatus: string;
  failureReason: string | null;
  sourceIssueNumber: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type PublisherDnsInstruction = {
  recordType: "CNAME";
  recordName: string;
  recordValue: string;
  expectedValue: string;
  propagation: string;
};

export type PublisherAccountState = {
  kind: PublisherAccountStateKind;
  user: PublisherSessionUser | null;
  entitlement: PublisherPlanEntitlement | null;
  tenant: PublisherTenant | null;
  reservation: PublisherSubdomainReservation | null;
  customDomains: PublisherCustomDomain[];
  canCreateFreeBuildWorkspace: boolean;
  canReserveSubdomain: boolean;
  canAddCustomDomain: boolean;
  message: string;
  customDomainMessage: string;
  source: "d1" | "session" | "none";
};

type PublisherPlanEntitlementRow = {
  id: string;
  owner_user_id: string | null;
  owner_email: string;
  status: PublisherPlanEntitlementStatus;
  source: string;
  plan_slug: string;
  starts_at: number | null;
  ends_at: number | null;
  updated_at: number | null;
};

type PublisherTenantRow = {
  id: string;
  owner_user_id: string | null;
  owner_email: string;
  display_name: string;
  status: PublisherTenantStatus;
  plan_status: PublisherTenantPlanStatus;
  default_subdomain: string | null;
  primary_hostname: string | null;
  source_issue_number: number;
  created_at: number | null;
  updated_at: number | null;
};

type PublisherSubdomainReservationRow = {
  id: string;
  tenant_id: string;
  owner_user_id: string | null;
  owner_email: string;
  subdomain: string;
  full_hostname: string;
  status: PublisherSubdomainReservationStatus;
  source_issue_number: number;
  created_at: number | null;
  updated_at: number | null;
};

type PublisherCustomDomainRow = {
  id: string;
  tenant_id: string;
  owner_user_id: string | null;
  owner_email: string;
  domain_name: string;
  normalized_domain: string;
  status: PublisherCustomDomainStatus;
  dns_record_type: "CNAME";
  dns_record_name: string;
  dns_record_value: string;
  dns_expected_value: string;
  dns_last_checked_at: number | null;
  dns_verified_at: number | null;
  ssl_status: string;
  failure_reason: string | null;
  source_issue_number: number;
  created_at: number | null;
  updated_at: number | null;
};

type ReservePublisherSubdomainInput = {
  subdomain: string;
  idempotencyKey: string;
};

type CreateFreeBuildWorkspaceInput = {
  confirmationText: string;
  idempotencyKey: string;
};

type StartPublisherCustomDomainInput = {
  domainName: string;
  idempotencyKey: string;
};

type VerifyPublisherCustomDomainInput = {
  customDomainId: string;
  testDnsVerified?: boolean;
};

export class PublisherTenantError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "PublisherTenantError";
    this.status = status;
    this.code = code;
  }
}

export const publisherTenantIssue = 222;
export const publisherCustomDomainIssue = 223;
export const publisherCustomerAuthIssue = 224;
export const publisherDomainPurchaseIssue = 225;
export const publisherTenantParentIssue = 221;
export const publisherFreeBuildIssue = 473;
export const publisherFreeBuildParentIssue = 466;
export const publisherTenantUpdatedAt = "2026-05-25";
export const publisherSubdomainApiRoute = "/api/account/publisher/subdomain";
export const publisherCustomDomainApiRoute = "/api/account/publisher/custom-domain";
export const publisherFreeBuildWorkspaceApiRoute = "/api/account/publisher/free-build-workspace";
export const publisherAccountSetupRoute = "/account/setup";
export const publisherAccountSourceDataRoute = "/account/source-data";
export const publisherDefaultDomain = "bumpgrade.com";
export const publisherCustomDomainTarget = "custom-domains.bumpgrade.com";
export const publisherFreeBuildWorkspaceConfirmationText = "Create my private Free Build workspace";
export const publisherSubdomainConfirmationText = "Reserve this Bumpgrade subdomain for my paid publisher account";
export const publisherCustomDomainConfirmationText = "Connect this existing domain to my paid Bumpgrade account";
export const publisherHostedAuthBoundary = describeBetterAuthSessionBoundary({
  authUrl: `https://${publisherDefaultDomain}`,
  siteUrl: `https://${publisherDefaultDomain}`,
});

const reservedSubdomains = new Set([
  "account",
  "accounts",
  "admin",
  "api",
  "app",
  "assets",
  "auth",
  "billing",
  "blog",
  "bumpgrade",
  "cdn",
  "codex",
  "compare",
  "developers",
  "docs",
  "email",
  "features",
  "help",
  "login",
  "mail",
  "m",
  "pricing",
  "resources",
  "roadmap",
  "root",
  "signup",
  "static",
  "status",
  "support",
  "www",
]);

function isoFromSeconds(value: number | null | undefined) {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

function runtimeId(prefix: string) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${random}`;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function entitlementFromRow(row: PublisherPlanEntitlementRow | null | undefined): PublisherPlanEntitlement | null {
  if (!row) return null;
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    ownerEmail: row.owner_email,
    status: row.status,
    source: row.source,
    planSlug: row.plan_slug,
    startsAt: isoFromSeconds(row.starts_at),
    endsAt: isoFromSeconds(row.ends_at),
    updatedAt: isoFromSeconds(row.updated_at),
  };
}

function tenantFromRow(row: PublisherTenantRow | null | undefined): PublisherTenant | null {
  if (!row) return null;
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    ownerEmail: row.owner_email,
    displayName: row.display_name,
    status: row.status,
    planStatus: row.plan_status,
    defaultSubdomain: row.default_subdomain,
    primaryHostname: row.primary_hostname,
    sourceIssueNumber: row.source_issue_number,
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
  };
}

function reservationFromRow(
  row: PublisherSubdomainReservationRow | null | undefined,
): PublisherSubdomainReservation | null {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    ownerUserId: row.owner_user_id,
    ownerEmail: row.owner_email,
    subdomain: row.subdomain,
    fullHostname: row.full_hostname,
    status: row.status,
    sourceIssueNumber: row.source_issue_number,
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
  };
}

function customDomainFromRow(row: PublisherCustomDomainRow | null | undefined): PublisherCustomDomain | null {
  if (!row) return null;
  return {
    id: row.id,
    tenantId: row.tenant_id,
    ownerUserId: row.owner_user_id,
    ownerEmail: row.owner_email,
    domainName: row.domain_name,
    normalizedDomain: row.normalized_domain,
    status: row.status,
    dnsInstruction: {
      recordType: row.dns_record_type,
      recordName: row.dns_record_name,
      recordValue: row.dns_record_value,
      expectedValue: row.dns_expected_value,
      propagation: "DNS changes often appear within minutes, but some domain hosts can take up to 24 hours.",
    },
    dnsLastCheckedAt: isoFromSeconds(row.dns_last_checked_at),
    dnsVerifiedAt: isoFromSeconds(row.dns_verified_at),
    sslStatus: row.ssl_status,
    failureReason: row.failure_reason,
    sourceIssueNumber: row.source_issue_number,
    createdAt: isoFromSeconds(row.created_at),
    updatedAt: isoFromSeconds(row.updated_at),
  };
}

export function normalizePublisherSubdomain(input: string) {
  const subdomain = input.trim().toLowerCase();

  if (!subdomain) {
    return { ok: false as const, code: "SUBDOMAIN_REQUIRED", error: "Enter the Bumpgrade subdomain you want." };
  }

  if (subdomain.includes(".")) {
    return {
      ok: false as const,
      code: "SUBDOMAIN_ONLY",
      error: "Enter only the subdomain, for example studio instead of studio.bumpgrade.com.",
    };
  }

  if (subdomain.length < 3 || subdomain.length > 63) {
    return {
      ok: false as const,
      code: "SUBDOMAIN_LENGTH",
      error: "Bumpgrade subdomains must be between 3 and 63 characters.",
    };
  }

  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return {
      ok: false as const,
      code: "SUBDOMAIN_CHARACTERS",
      error: "Use only lowercase letters, numbers, and hyphens.",
    };
  }

  if (subdomain.startsWith("-") || subdomain.endsWith("-")) {
    return {
      ok: false as const,
      code: "SUBDOMAIN_HYPHEN_EDGE",
      error: "A Bumpgrade subdomain cannot start or end with a hyphen.",
    };
  }

  if (reservedSubdomains.has(subdomain)) {
    return {
      ok: false as const,
      code: "SUBDOMAIN_RESERVED",
      error: "That Bumpgrade subdomain is reserved. Choose a different name.",
    };
  }

  return { ok: true as const, subdomain, fullHostname: `${subdomain}.${publisherDefaultDomain}` };
}

export function normalizePublisherCustomDomain(input: string) {
  const withoutProtocol = input.trim().toLowerCase().replace(/^https?:\/\//, "");
  const domain = withoutProtocol.split("/")[0]?.split("?")[0]?.split("#")[0]?.split(":")[0]?.replace(/\.$/, "") ?? "";

  if (!domain) {
    return { ok: false as const, code: "CUSTOM_DOMAIN_REQUIRED", error: "Enter the domain you want to connect." };
  }

  if (domain.includes("*")) {
    return {
      ok: false as const,
      code: "CUSTOM_DOMAIN_WILDCARD",
      error: "Enter one specific hostname, not a wildcard domain.",
    };
  }

  if (domain === publisherDefaultDomain || domain.endsWith(`.${publisherDefaultDomain}`)) {
    return {
      ok: false as const,
      code: "CUSTOM_DOMAIN_BUMPGRADE_HOSTNAME",
      error: "Use the Bumpgrade subdomain setup for bumpgrade.com hostnames.",
    };
  }

  if (domain.length > 253 || !domain.includes(".")) {
    return {
      ok: false as const,
      code: "CUSTOM_DOMAIN_FORMAT",
      error: "Enter a real domain or subdomain, for example www.example.com.",
    };
  }

  const labels = domain.split(".");
  if (labels.some((label) => !label || label.length > 63 || label.startsWith("-") || label.endsWith("-"))) {
    return {
      ok: false as const,
      code: "CUSTOM_DOMAIN_LABEL",
      error: "Domain labels cannot be empty, too long, or start or end with a hyphen.",
    };
  }

  if (!labels.every((label) => /^[a-z0-9-]+$/.test(label))) {
    return {
      ok: false as const,
      code: "CUSTOM_DOMAIN_CHARACTERS",
      error: "Use only letters, numbers, hyphens, and dots in the domain.",
    };
  }

  const tld = labels[labels.length - 1] ?? "";
  if (!/^[a-z]{2,63}$/.test(tld)) {
    return {
      ok: false as const,
      code: "CUSTOM_DOMAIN_TLD",
      error: "The domain must end with a valid text top-level domain.",
    };
  }

  return {
    ok: true as const,
    domainName: domain,
    normalizedDomain: domain,
    dnsInstruction: {
      recordType: "CNAME" as const,
      recordName: domain,
      recordValue: publisherCustomDomainTarget,
      expectedValue: publisherCustomDomainTarget,
      propagation: "DNS changes often appear within minutes, but some domain hosts can take up to 24 hours.",
    },
  };
}

export async function getOptionalPublisherTenantD1() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as Cloudflare.Env).DB ?? null;
  } catch {
    return null;
  }
}

export async function getPublisherTenantD1OrThrow() {
  const db = await getOptionalPublisherTenantD1();
  if (!db) throw new PublisherTenantError("Cloudflare D1 binding DB is not available.", 503, "DB_UNAVAILABLE");
  return db;
}

async function loadActivePlanEntitlement(db: D1Database, user: PublisherSessionUser) {
  const email = normalizeEmail(user.email);
  const row = await db
    .prepare(
      `SELECT *
       FROM publisher_plan_entitlements
       WHERE status = 'active'
         AND (owner_user_id = ? OR owner_email = ?)
         AND (ends_at IS NULL OR ends_at > unixepoch())
       ORDER BY updated_at DESC
       LIMIT 1`,
    )
    .bind(user.id, email)
    .first<PublisherPlanEntitlementRow>();

  return entitlementFromRow(row);
}

async function loadTenant(db: D1Database, user: PublisherSessionUser) {
  const email = normalizeEmail(user.email);
  const row = await db
    .prepare(
      `SELECT *
       FROM publisher_tenants
       WHERE owner_user_id = ? OR owner_email = ?
       ORDER BY updated_at DESC
       LIMIT 1`,
    )
    .bind(user.id, email)
    .first<PublisherTenantRow>();

  return tenantFromRow(row);
}

async function loadReservationForTenant(db: D1Database, tenantId: string) {
  const row = await db
    .prepare(
      `SELECT *
       FROM publisher_subdomain_reservations
       WHERE tenant_id = ? AND status IN ('active', 'reserved')
       ORDER BY updated_at DESC
       LIMIT 1`,
    )
    .bind(tenantId)
    .first<PublisherSubdomainReservationRow>();

  return reservationFromRow(row);
}

async function loadReservationBySubdomain(db: D1Database, subdomain: string) {
  const row = await db
    .prepare(
      `SELECT *
       FROM publisher_subdomain_reservations
       WHERE subdomain = ? AND status IN ('active', 'reserved')
       LIMIT 1`,
    )
    .bind(subdomain)
    .first<PublisherSubdomainReservationRow>();

  return reservationFromRow(row);
}

async function loadReservationByIdempotencyKey(db: D1Database, idempotencyKey: string) {
  const row = await db
    .prepare("SELECT * FROM publisher_subdomain_reservations WHERE idempotency_key = ? LIMIT 1")
    .bind(idempotencyKey)
    .first<PublisherSubdomainReservationRow>();

  return reservationFromRow(row);
}

async function loadCustomDomainsForTenant(db: D1Database, tenantId: string) {
  const result = await db
    .prepare(
      `SELECT *
       FROM publisher_custom_domains
       WHERE tenant_id = ? AND status != 'disabled'
       ORDER BY updated_at DESC, created_at DESC`,
    )
    .bind(tenantId)
    .all<PublisherCustomDomainRow>();

  return (result.results ?? []).map(customDomainFromRow).filter((domain): domain is PublisherCustomDomain => Boolean(domain));
}

async function loadCustomDomainById(db: D1Database, customDomainId: string) {
  const row = await db
    .prepare("SELECT * FROM publisher_custom_domains WHERE id = ? LIMIT 1")
    .bind(customDomainId)
    .first<PublisherCustomDomainRow>();

  return customDomainFromRow(row);
}

async function loadCustomDomainByNormalizedDomain(db: D1Database, normalizedDomain: string) {
  const row = await db
    .prepare("SELECT * FROM publisher_custom_domains WHERE normalized_domain = ? AND status != 'disabled' LIMIT 1")
    .bind(normalizedDomain)
    .first<PublisherCustomDomainRow>();

  return customDomainFromRow(row);
}

async function loadCustomDomainByIdempotencyKey(db: D1Database, idempotencyKey: string) {
  const row = await db
    .prepare("SELECT * FROM publisher_custom_domains WHERE idempotency_key = ? LIMIT 1")
    .bind(idempotencyKey)
    .first<PublisherCustomDomainRow>();

  return customDomainFromRow(row);
}

async function upsertTenant(db: D1Database, user: PublisherSessionUser, entitlement: PublisherPlanEntitlement) {
  const existing = await loadTenant(db, user);
  const email = normalizeEmail(user.email);
  const displayName = (user.name ?? email).trim() || email;

  if (existing) {
    await db
      .prepare(
        `UPDATE publisher_tenants
         SET owner_user_id = COALESCE(owner_user_id, ?),
             owner_email = ?,
             display_name = ?,
             plan_status = ?,
             updated_at = unixepoch()
         WHERE id = ?`,
      )
      .bind(user.id, email, displayName, "paid", existing.id)
      .run();

    return {
      ...existing,
      ownerUserId: existing.ownerUserId ?? user.id,
      ownerEmail: email,
      displayName,
      planStatus: "paid",
    };
  }

  const tenant: PublisherTenant = {
    id: runtimeId("publisher-tenant"),
    ownerUserId: user.id,
    ownerEmail: email,
    displayName,
    status: "active",
    planStatus: "paid",
    defaultSubdomain: null,
    primaryHostname: null,
    sourceIssueNumber: publisherTenantIssue,
    createdAt: null,
    updatedAt: null,
  };

  await db
    .prepare(
      `INSERT INTO publisher_tenants (
        id, owner_user_id, owner_email, display_name, status, plan_status,
        default_subdomain, primary_hostname, source_issue_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      tenant.id,
      tenant.ownerUserId,
      tenant.ownerEmail,
      tenant.displayName,
      tenant.status,
      tenant.planStatus,
      tenant.sourceIssueNumber,
    )
    .run();

  await db
    .prepare(
      `UPDATE publisher_plan_entitlements
       SET owner_user_id = COALESCE(owner_user_id, ?), updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(user.id, entitlement.id)
    .run();

  return tenant;
}

async function upsertFreeBuildTenant(db: D1Database, user: PublisherSessionUser) {
  const existing = await loadTenant(db, user);
  const email = normalizeEmail(user.email);
  const displayName = (user.name ?? email).trim() || email;

  if (existing) {
    await db
      .prepare(
        `UPDATE publisher_tenants
         SET owner_user_id = COALESCE(owner_user_id, ?),
             owner_email = ?,
             display_name = ?,
             updated_at = unixepoch()
         WHERE id = ?`,
      )
      .bind(user.id, email, displayName, existing.id)
      .run();

    return {
      ...existing,
      ownerUserId: existing.ownerUserId ?? user.id,
      ownerEmail: email,
      displayName,
    };
  }

  const tenant: PublisherTenant = {
    id: runtimeId("publisher-tenant"),
    ownerUserId: user.id,
    ownerEmail: email,
    displayName,
    status: "active",
    planStatus: "free_build",
    defaultSubdomain: null,
    primaryHostname: null,
    sourceIssueNumber: publisherFreeBuildIssue,
    createdAt: null,
    updatedAt: null,
  };

  await db
    .prepare(
      `INSERT INTO publisher_tenants (
        id, owner_user_id, owner_email, display_name, status, plan_status,
        default_subdomain, primary_hostname, source_issue_number, metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      tenant.id,
      tenant.ownerUserId,
      tenant.ownerEmail,
      tenant.displayName,
      tenant.status,
      tenant.planStatus,
      tenant.sourceIssueNumber,
      JSON.stringify({
        parentIssueNumber: publisherFreeBuildParentIssue,
        sourceIssueNumber: publisherFreeBuildIssue,
        privateBuildOnly: true,
        paidGoLiveRequired: true,
      }),
    )
    .run();

  return tenant;
}

async function loadTenantAuditEventByIdempotencyKey(db: D1Database, idempotencyKey: string) {
  return db
    .prepare(
      `SELECT tenant_id, event_kind
       FROM publisher_tenant_audit_events
       WHERE idempotency_key = ?
       LIMIT 1`,
    )
    .bind(idempotencyKey)
    .first<{ tenant_id: string | null; event_kind: string }>();
}

async function writeTenantAuditEvent(
  db: D1Database,
  input: {
    tenantId: string;
    user: PublisherSessionUser;
    eventKind: string;
    summary: string;
    idempotencyKey: string;
    metadata: Record<string, unknown>;
  },
) {
  await db
    .prepare(
      `INSERT OR IGNORE INTO publisher_tenant_audit_events (
        id, tenant_id, actor_user_id, actor_email, event_kind, summary,
        idempotency_key, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`,
    )
    .bind(
      runtimeId("publisher-tenant-audit"),
      input.tenantId,
      input.user.id,
      normalizeEmail(input.user.email),
      input.eventKind,
      input.summary,
      input.idempotencyKey,
      JSON.stringify(input.metadata),
    )
    .run();
}

export async function loadPublisherAccountState(
  db: D1Database | null,
  user: PublisherSessionUser | null,
): Promise<PublisherAccountState> {
  if (!user) {
    return {
      kind: "signed_out",
      user: null,
      entitlement: null,
      tenant: null,
      reservation: null,
      customDomains: [],
      canReserveSubdomain: false,
      canCreateFreeBuildWorkspace: false,
      canAddCustomDomain: false,
      message: "Sign in or create a publisher account before reserving a Bumpgrade subdomain.",
      customDomainMessage: "Sign in before adding a custom domain.",
      source: "none",
    };
  }

  if (!user.emailVerified) {
    return {
      kind: "unverified",
      user,
      entitlement: null,
      tenant: null,
      reservation: null,
      customDomains: [],
      canReserveSubdomain: false,
      canCreateFreeBuildWorkspace: false,
      canAddCustomDomain: false,
      message: "Confirm your email before reserving a Bumpgrade subdomain.",
      customDomainMessage: "Confirm your email before adding a custom domain.",
      source: "session",
    };
  }

  if (!db) {
    return {
      kind: "unavailable",
      user,
      entitlement: null,
      tenant: null,
      reservation: null,
      customDomains: [],
      canReserveSubdomain: false,
      canCreateFreeBuildWorkspace: false,
      canAddCustomDomain: false,
      message: "Publisher account storage is unavailable in this runtime.",
      customDomainMessage: "Custom-domain storage is unavailable in this runtime.",
      source: "none",
    };
  }

  const entitlement = await loadActivePlanEntitlement(db, user);
  const tenant = await loadTenant(db, user);
  const reservation = tenant ? await loadReservationForTenant(db, tenant.id) : null;
  const customDomains = tenant ? await loadCustomDomainsForTenant(db, tenant.id) : [];

  if (!entitlement) {
    if (tenant) {
      return {
        kind: "free_build",
        user,
        entitlement: null,
        tenant,
        reservation: null,
        customDomains,
        canCreateFreeBuildWorkspace: false,
        canReserveSubdomain: false,
        canAddCustomDomain: false,
        message: "Private Free Build workspace is ready. A paid go-live plan is required before public domains or buyer-facing launch actions.",
        customDomainMessage: "A paid go-live plan and default Bumpgrade hostname are required before adding a custom domain.",
        source: "d1",
      };
    }

    return {
      kind: "unpaid",
      user,
      entitlement: null,
      tenant,
      reservation: null,
      customDomains,
      canCreateFreeBuildWorkspace: true,
      canReserveSubdomain: false,
      canAddCustomDomain: false,
      message: "Create a private Free Build workspace now, then choose a paid go-live plan before public domains or buyer-facing launch actions.",
      customDomainMessage: "A paid plan entitlement is required before adding a custom domain.",
      source: "d1",
    };
  }

  return {
    kind: "ready",
    user,
    entitlement,
    tenant,
    reservation,
    customDomains,
    canCreateFreeBuildWorkspace: false,
    canReserveSubdomain: !reservation,
    canAddCustomDomain: Boolean(tenant && reservation),
    message: reservation
      ? `${reservation.fullHostname} is reserved for this publisher account.`
      : "This paid publisher account can reserve a Bumpgrade subdomain.",
    customDomainMessage:
      tenant && reservation
        ? customDomains.length
          ? "Custom-domain onboarding is available for this publisher account."
          : "This paid publisher account can add an existing custom domain."
        : "Reserve the default Bumpgrade hostname before adding a custom domain.",
    source: "d1",
  };
}

export async function createFreeBuildWorkspace(
  db: D1Database,
  user: PublisherSessionUser,
  input: CreateFreeBuildWorkspaceInput,
) {
  if (!user.emailVerified) {
    throw new PublisherTenantError("Confirm your email before creating a Free Build workspace.", 403, "EMAIL_UNVERIFIED");
  }

  const idempotencyKey = input.idempotencyKey.trim();
  if (!idempotencyKey) {
    throw new PublisherTenantError("An idempotency key is required.", 400, "IDEMPOTENCY_REQUIRED");
  }

  if (input.confirmationText.trim() !== publisherFreeBuildWorkspaceConfirmationText) {
    throw new PublisherTenantError(
      "Exact Free Build workspace confirmation text is required.",
      400,
      "FREE_BUILD_CONFIRMATION_REQUIRED",
    );
  }

  const existingForIdempotency = await loadTenantAuditEventByIdempotencyKey(db, idempotencyKey);
  const existingTenant = await loadTenant(db, user);
  if (existingForIdempotency && existingForIdempotency.tenant_id !== existingTenant?.id) {
    throw new PublisherTenantError("That idempotency key is already used.", 409, "IDEMPOTENCY_CONFLICT");
  }
  if (
    existingForIdempotency &&
    existingForIdempotency.event_kind !== "free_build_workspace_created" &&
    existingForIdempotency.event_kind !== "paid_workspace_confirmed_from_free_build"
  ) {
    throw new PublisherTenantError("That idempotency key is already used.", 409, "IDEMPOTENCY_CONFLICT");
  }

  const entitlement = await loadActivePlanEntitlement(db, user);
  const tenant = entitlement ? await upsertTenant(db, user, entitlement) : await upsertFreeBuildTenant(db, user);
  if (existingForIdempotency) {
    return {
      tenant,
      planStatus: tenant.planStatus,
      idempotent: true,
      paidGoLiveRequired: !entitlement,
    };
  }

  await writeTenantAuditEvent(db, {
    tenantId: tenant.id,
    user,
    eventKind: entitlement ? "paid_workspace_confirmed_from_free_build" : "free_build_workspace_created",
    summary: entitlement
      ? `Confirmed paid publisher workspace ${tenant.id} through the Free Build setup path.`
      : `Created private Free Build workspace ${tenant.id}.`,
    idempotencyKey,
    metadata: {
      parentIssueNumber: publisherFreeBuildParentIssue,
      sourceIssueNumber: publisherFreeBuildIssue,
      planStatus: tenant.planStatus,
      paidEntitlementPresent: Boolean(entitlement),
      paidGoLiveRequired: !entitlement,
      publicPublishingEnabled: Boolean(entitlement),
      customDomainsEnabled: Boolean(entitlement),
      rawOwnerDataRedacted: true,
    },
  });

  return {
    tenant,
    planStatus: tenant.planStatus,
    idempotent: false,
    paidGoLiveRequired: !entitlement,
  };
}

export async function reservePublisherSubdomain(
  db: D1Database,
  user: PublisherSessionUser,
  input: ReservePublisherSubdomainInput,
) {
  if (!user.emailVerified) {
    throw new PublisherTenantError("Confirm your email before reserving a Bumpgrade subdomain.", 403, "EMAIL_UNVERIFIED");
  }

  const idempotencyKey = input.idempotencyKey.trim();
  if (!idempotencyKey) {
    throw new PublisherTenantError("An idempotency key is required.", 400, "IDEMPOTENCY_REQUIRED");
  }

  const normalized = normalizePublisherSubdomain(input.subdomain);
  if (!normalized.ok) {
    throw new PublisherTenantError(normalized.error, 400, normalized.code);
  }

  const entitlement = await loadActivePlanEntitlement(db, user);
  if (!entitlement) {
    throw new PublisherTenantError(
      "Choose a paid plan before reserving a Bumpgrade subdomain.",
      402,
      "PAID_PLAN_REQUIRED",
    );
  }

  const tenant = await upsertTenant(db, user, entitlement);
  const existingForIdempotency = await loadReservationByIdempotencyKey(db, idempotencyKey);
  if (existingForIdempotency) {
    if (existingForIdempotency.tenantId !== tenant.id) {
      throw new PublisherTenantError("That idempotency key is already used.", 409, "IDEMPOTENCY_CONFLICT");
    }

    return {
      tenant,
      reservation: existingForIdempotency,
      idempotent: true,
    };
  }

  const existingForTenant = await loadReservationForTenant(db, tenant.id);
  if (existingForTenant) {
    if (existingForTenant.subdomain === normalized.subdomain) {
      return { tenant, reservation: existingForTenant, idempotent: false };
    }

    throw new PublisherTenantError(
      `${existingForTenant.fullHostname} is already reserved for this publisher account.`,
      409,
      "TENANT_SUBDOMAIN_ALREADY_RESERVED",
    );
  }

  const existingForSubdomain = await loadReservationBySubdomain(db, normalized.subdomain);
  if (existingForSubdomain) {
    throw new PublisherTenantError(
      `${normalized.fullHostname} is already reserved. Choose a different Bumpgrade subdomain.`,
      409,
      "SUBDOMAIN_TAKEN",
    );
  }

  const reservation: PublisherSubdomainReservation = {
    id: runtimeId("publisher-subdomain"),
    tenantId: tenant.id,
    ownerUserId: user.id,
    ownerEmail: normalizeEmail(user.email),
    subdomain: normalized.subdomain,
    fullHostname: normalized.fullHostname,
    status: "active",
    sourceIssueNumber: publisherTenantIssue,
    createdAt: null,
    updatedAt: null,
  };

  await db
    .prepare(
      `INSERT INTO publisher_subdomain_reservations (
        id, tenant_id, owner_user_id, owner_email, subdomain, full_hostname,
        status, idempotency_key, source_issue_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      reservation.id,
      reservation.tenantId,
      reservation.ownerUserId,
      reservation.ownerEmail,
      reservation.subdomain,
      reservation.fullHostname,
      reservation.status,
      idempotencyKey,
      reservation.sourceIssueNumber,
    )
    .run();

  await db
    .prepare(
      `UPDATE publisher_tenants
       SET default_subdomain = ?, primary_hostname = ?, updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(reservation.subdomain, reservation.fullHostname, tenant.id)
    .run();

  await writeTenantAuditEvent(db, {
    tenantId: tenant.id,
    user,
    eventKind: "subdomain_reserved",
    summary: `Reserved ${reservation.fullHostname} for paid publisher tenant ${tenant.id}.`,
    idempotencyKey,
    metadata: {
      reservationId: reservation.id,
      subdomain: reservation.subdomain,
      fullHostname: reservation.fullHostname,
      sourceIssueNumber: publisherTenantIssue,
    },
  });

  return {
    tenant: {
      ...tenant,
      defaultSubdomain: reservation.subdomain,
      primaryHostname: reservation.fullHostname,
    },
    reservation,
    idempotent: false,
  };
}

async function requirePaidTenantWithDefaultHostname(db: D1Database, user: PublisherSessionUser) {
  if (!user.emailVerified) {
    throw new PublisherTenantError("Confirm your email before adding a custom domain.", 403, "EMAIL_UNVERIFIED");
  }

  const entitlement = await loadActivePlanEntitlement(db, user);
  if (!entitlement) {
    throw new PublisherTenantError(
      "Choose a paid plan before adding a custom domain.",
      402,
      "PAID_PLAN_REQUIRED",
    );
  }

  const tenant = await loadTenant(db, user);
  if (!tenant) {
    throw new PublisherTenantError(
      "Reserve the default Bumpgrade hostname before adding a custom domain.",
      409,
      "DEFAULT_SUBDOMAIN_REQUIRED",
    );
  }

  const reservation = await loadReservationForTenant(db, tenant.id);
  if (!reservation) {
    throw new PublisherTenantError(
      "Reserve the default Bumpgrade hostname before adding a custom domain.",
      409,
      "DEFAULT_SUBDOMAIN_REQUIRED",
    );
  }

  return { entitlement, tenant, reservation };
}

export async function startPublisherCustomDomain(
  db: D1Database,
  user: PublisherSessionUser,
  input: StartPublisherCustomDomainInput,
) {
  const idempotencyKey = input.idempotencyKey.trim();
  if (!idempotencyKey) {
    throw new PublisherTenantError("An idempotency key is required.", 400, "IDEMPOTENCY_REQUIRED");
  }

  const { tenant } = await requirePaidTenantWithDefaultHostname(db, user);
  const existingForIdempotency = await loadCustomDomainByIdempotencyKey(db, idempotencyKey);
  if (existingForIdempotency) {
    if (existingForIdempotency.tenantId !== tenant.id) {
      throw new PublisherTenantError("That idempotency key is already used.", 409, "IDEMPOTENCY_CONFLICT");
    }

    return { customDomain: existingForIdempotency, idempotent: true };
  }

  const normalized = normalizePublisherCustomDomain(input.domainName);
  if (!normalized.ok) {
    throw new PublisherTenantError(normalized.error, 400, normalized.code);
  }

  const existingForDomain = await loadCustomDomainByNormalizedDomain(db, normalized.normalizedDomain);
  if (existingForDomain) {
    if (existingForDomain.tenantId === tenant.id) {
      return { customDomain: existingForDomain, idempotent: false };
    }

    throw new PublisherTenantError(
      `${normalized.domainName} is already attached to another Bumpgrade publisher account.`,
      409,
      "CUSTOM_DOMAIN_TAKEN",
    );
  }

  const customDomain: PublisherCustomDomain = {
    id: runtimeId("publisher-custom-domain"),
    tenantId: tenant.id,
    ownerUserId: user.id,
    ownerEmail: normalizeEmail(user.email),
    domainName: normalized.domainName,
    normalizedDomain: normalized.normalizedDomain,
    status: "pending_dns",
    dnsInstruction: normalized.dnsInstruction,
    dnsLastCheckedAt: null,
    dnsVerifiedAt: null,
    sslStatus: "not_requested",
    failureReason: null,
    sourceIssueNumber: publisherCustomDomainIssue,
    createdAt: null,
    updatedAt: null,
  };

  await db
    .prepare(
      `INSERT INTO publisher_custom_domains (
        id, tenant_id, owner_user_id, owner_email, domain_name, normalized_domain,
        status, dns_record_type, dns_record_name, dns_record_value, dns_expected_value,
        ssl_status, idempotency_key, source_issue_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`,
    )
    .bind(
      customDomain.id,
      customDomain.tenantId,
      customDomain.ownerUserId,
      customDomain.ownerEmail,
      customDomain.domainName,
      customDomain.normalizedDomain,
      customDomain.status,
      customDomain.dnsInstruction.recordType,
      customDomain.dnsInstruction.recordName,
      customDomain.dnsInstruction.recordValue,
      customDomain.dnsInstruction.expectedValue,
      customDomain.sslStatus,
      idempotencyKey,
      customDomain.sourceIssueNumber,
    )
    .run();

  await writeTenantAuditEvent(db, {
    tenantId: tenant.id,
    user,
    eventKind: "custom_domain_started",
    summary: `Started custom-domain onboarding for ${customDomain.normalizedDomain}.`,
    idempotencyKey,
    metadata: {
      customDomainId: customDomain.id,
      normalizedDomain: customDomain.normalizedDomain,
      dnsRecordType: customDomain.dnsInstruction.recordType,
      dnsRecordName: customDomain.dnsInstruction.recordName,
      dnsRecordValue: customDomain.dnsInstruction.recordValue,
      sourceIssueNumber: publisherCustomDomainIssue,
    },
  });

  return { customDomain, idempotent: false };
}

async function dnsCnamePointsToExpectedValue(domainName: string, expectedValue: string) {
  const response = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domainName)}&type=CNAME`,
    {
      headers: { accept: "application/dns-json" },
    },
  ).catch(() => null);

  if (!response?.ok) return { verified: false, observedCount: 0 };

  const payload = (await response.json().catch(() => null)) as
    | { Answer?: Array<{ data?: string; type?: number }> }
    | null;
  const expected = expectedValue.toLowerCase().replace(/\.$/, "");
  const observed = (payload?.Answer ?? [])
    .map((answer) => answer.data?.toLowerCase().replace(/\.$/, "") ?? "")
    .filter(Boolean);

  return {
    verified: observed.some((value) => value === expected),
    observedCount: observed.length,
  };
}

export async function verifyPublisherCustomDomain(
  db: D1Database,
  user: PublisherSessionUser,
  input: VerifyPublisherCustomDomainInput,
) {
  const { tenant } = await requirePaidTenantWithDefaultHostname(db, user);
  const customDomain = await loadCustomDomainById(db, input.customDomainId.trim());

  if (!customDomain || customDomain.tenantId !== tenant.id) {
    throw new PublisherTenantError("Custom domain not found for this publisher account.", 404, "CUSTOM_DOMAIN_NOT_FOUND");
  }

  const dnsCheck = input.testDnsVerified
    ? { verified: true, observedCount: 1 }
    : await dnsCnamePointsToExpectedValue(customDomain.normalizedDomain, customDomain.dnsInstruction.expectedValue);

  const status: PublisherCustomDomainStatus = dnsCheck.verified ? "dns_verified" : "pending_dns";
  const sslStatus = dnsCheck.verified ? "pending" : "not_requested";
  const failureReason = dnsCheck.verified
    ? null
    : `Bumpgrade could not yet see a CNAME record pointing to ${customDomain.dnsInstruction.expectedValue}.`;

  await db
    .prepare(
      `UPDATE publisher_custom_domains
       SET status = ?,
           dns_last_checked_at = unixepoch(),
           dns_verified_at = CASE WHEN ? = 'dns_verified' THEN COALESCE(dns_verified_at, unixepoch()) ELSE dns_verified_at END,
           ssl_status = ?,
           failure_reason = ?,
           updated_at = unixepoch()
       WHERE id = ?`,
    )
    .bind(status, status, sslStatus, failureReason, customDomain.id)
    .run();

  await writeTenantAuditEvent(db, {
    tenantId: tenant.id,
    user,
    eventKind: dnsCheck.verified ? "custom_domain_dns_verified" : "custom_domain_dns_pending",
    summary: dnsCheck.verified
      ? `Verified DNS for custom domain ${customDomain.normalizedDomain}.`
      : `DNS is still pending for custom domain ${customDomain.normalizedDomain}.`,
    idempotencyKey: `custom-domain-verify-${customDomain.id}-${Date.now()}`,
    metadata: {
      customDomainId: customDomain.id,
      normalizedDomain: customDomain.normalizedDomain,
      status,
      observedRecordCount: dnsCheck.observedCount,
      sourceIssueNumber: publisherCustomDomainIssue,
    },
  });

  return {
    customDomain: {
      ...customDomain,
      status,
      dnsLastCheckedAt: new Date().toISOString(),
      dnsVerifiedAt: dnsCheck.verified ? customDomain.dnsVerifiedAt ?? new Date().toISOString() : customDomain.dnsVerifiedAt,
      sslStatus,
      failureReason,
    },
    verified: dnsCheck.verified,
  };
}

export const publisherTenantSourceData = {
  id: "publisher-tenant-subdomain-contract",
  status: "live",
  updatedAt: publisherTenantUpdatedAt,
  parentIssue: publisherTenantParentIssue,
  issue: publisherTenantIssue,
  routes: {
    accountSetup: publisherAccountSetupRoute,
    accountSourceData: publisherAccountSourceDataRoute,
    freeBuildWorkspaceApi: publisherFreeBuildWorkspaceApiRoute,
    reserveSubdomainApi: publisherSubdomainApiRoute,
    customDomainApi: publisherCustomDomainApiRoute,
  },
  tables: [
    {
      name: "publisher_plan_entitlements",
      purpose: "Paid-plan gate checked before a publisher can reserve a Bumpgrade subdomain.",
      publicSafeFields: ["status", "source", "plan_slug", "starts_at", "ends_at"],
      privateFields: ["owner_user_id", "owner_email"],
    },
    {
      name: "publisher_tenants",
      purpose: "One publisher workspace with owner identity, private Free Build or paid plan status, default subdomain, and primary hostname.",
      publicSafeFields: ["id", "status", "plan_status", "default_subdomain", "primary_hostname", "source_issue_number"],
      privateFields: ["owner_user_id", "owner_email"],
    },
    {
      name: "publisher_subdomain_reservations",
      purpose: "Unique default `*.bumpgrade.com` hostname reservation with idempotency and audit correlation.",
      publicSafeFields: ["subdomain", "full_hostname", "status", "source_issue_number"],
      privateFields: ["owner_user_id", "owner_email", "idempotency_key"],
    },
    {
      name: "publisher_custom_domains",
      purpose: "Existing-domain onboarding with deterministic DNS instructions, verification state, SSL state, idempotency, and redaction.",
      publicSafeFields: [
        "status",
        "dns_record_type",
        "dns_record_name",
        "dns_record_value",
        "dns_last_checked_at",
        "dns_verified_at",
        "ssl_status",
        "source_issue_number",
      ],
      privateFields: ["tenant_id", "owner_user_id", "owner_email", "domain_name", "normalized_domain", "idempotency_key"],
    },
    {
      name: "publisher_tenant_audit_events",
      purpose: "Append-only tenant setup evidence for Free Build creation, subdomain reservation, and domain/custom-domain changes.",
      publicSafeFields: ["event_kind", "summary", "created_at"],
      privateFields: ["actor_user_id", "actor_email", "metadata_json"],
    },
  ],
  freeBuildPolicy: {
    status: "live",
    issue: publisherFreeBuildIssue,
    parentIssue: publisherFreeBuildParentIssue,
    signedInWorkspaceLive: true,
    anonymousPlaygroundLive: false,
    confirmationText: publisherFreeBuildWorkspaceConfirmationText,
    privateBuildPlanStatus: "free_build",
    route: publisherFreeBuildWorkspaceApiRoute,
    whatWorksToday: [
      "Verified signed-in users can create a private Free Build workspace before payment.",
      "The workspace is persisted in publisher_tenants with plan_status=free_build.",
      "Idempotent replays return the same workspace instead of duplicating tenant rows.",
    ],
    paidGoLiveGates: [
      "Bumpgrade subdomain reservation",
      "Custom-domain onboarding",
      "Public publishing",
      "Live checkout and payment collection",
      "Buyer or subscriber sends",
      "Fulfillment and protected access",
    ],
    redaction:
      "Public source data describes the Free Build contract and gate IDs only; private owner identity, idempotency keys, and audit metadata stay behind authenticated context.",
  },
  subdomainPolicy: {
    defaultDomain: publisherDefaultDomain,
    paidPlanRequired: true,
    emailVerificationRequired: true,
    allowedPattern: "lowercase letters, numbers, and hyphens; 3-63 characters; cannot start or end with hyphen",
    reservedNames: Array.from(reservedSubdomains).sort(),
  },
  crossSubdomainAuth: {
    status: "configured",
    issue: publisherCustomerAuthIssue,
    cookieDomain: publisherHostedAuthBoundary.cookieDomain,
    trustedOriginPattern: "https://*.bumpgrade.com",
    trustedOrigins: publisherHostedAuthBoundary.trustedOrigins,
    crossSubDomainCookiesEnabled: publisherHostedAuthBoundary.crossSubDomainCookiesEnabled,
    bumpgradeHostedSubdomainsShareLogin: publisherHostedAuthBoundary.bumpgradeHostedSubdomainsShareLogin,
    goal: "One Better Auth identity session applies across bumpgrade.com and paid publisher subdomains such as a.bumpgrade.com and b.bumpgrade.com.",
    tenantIsolation: publisherHostedAuthBoundary.isolationBoundary,
    localTestBoundary:
      "Localhost cannot prove browser cookie sharing for bumpgrade.com. Tests assert the production Better Auth cookie-domain and trusted-origin contract, then production smoke reads this source-data route after deploy.",
  },
  customerAuthPolicy: {
    status: "configured",
    issue: publisherCustomerAuthIssue,
    sharedIdentityProvider: "https://bumpgrade.com",
    appliesTo: ["bumpgrade.com", "*.bumpgrade.com"],
    endUserPromise:
      "Customers using Bumpgrade-hosted publisher sites should not need a second login when moving between paid publisher subdomains on bumpgrade.com.",
    publisherSiteRule:
      "A shared identity session is not shared data access. Every request still resolves the hostname to the publisher tenant and checks checkout, entitlement, or membership state before returning customer content.",
    customDomains: {
      canShareBumpgradeCookieDirectly: publisherHostedAuthBoundary.customDomainsCanShareCookieDirectly,
      behavior:
        "Customer-owned custom domains cannot receive a bumpgrade.com browser cookie directly. Bumpgrade should use a central bumpgrade.com login handoff and return URL for identity, then enforce tenant-scoped access on the custom domain.",
      launchCopy:
        "Existing-domain DNS onboarding is live. Custom-domain customer login uses the Bumpgrade account handoff instead of promising raw cookie sharing across unrelated domains.",
    },
    adminBoundary:
      "Owner/admin sessions remain allowlisted and owner-gated; shared publisher-site identity must not grant admin access.",
  },
  customDomainPolicy: {
    status: "live",
    issue: publisherCustomDomainIssue,
    domainRequirement: "Bring an existing domain you already own; Bumpgrade does not sell or register domains today.",
    paidPlanRequired: true,
    emailVerificationRequired: true,
    defaultBumpgradeHostnameRequiredFirst: true,
    dnsInstruction: {
      recordType: "CNAME",
      recordName: "the publisher-owned hostname, for example www.example.com",
      recordValue: publisherCustomDomainTarget,
      expectedValue: publisherCustomDomainTarget,
    },
    statuses: ["pending_dns", "dns_verified", "ssl_pending", "active", "failed", "disabled"],
    redaction:
      "Public source data exposes policy, routes, and DNS instruction shape; private customer domain rows require authenticated publisher context.",
  },
  domainPurchasePolicy: {
    status: "not_offered_yet",
    issue: publisherDomainPurchaseIssue,
    currentLaunchAnswer:
      "No. Bumpgrade does not sell, register, renew, or transfer domains today. Use a paid Bumpgrade subdomain or connect a domain you already own.",
    whatWorksToday: [
      "Paid publishers can reserve a default *.bumpgrade.com hostname.",
      "Paid publishers can connect an existing custom domain with Bumpgrade DNS instructions and verification state.",
    ],
    notClaimed: [
      "Domain search or availability checks.",
      "Domain registration, transfer, renewal, privacy, contact, or refund handling.",
      "Registrar pricing, supported TLD inventory, or registrar-of-record status.",
    ],
    futurePath:
      "If Bumpgrade adds registration later, it needs a registrar/provider decision, availability checks, purchase and renewal terms, contact/privacy handling, payment/refund policy, and provider failure states before any public CTA claims domains can be bought through Bumpgrade.",
  },
  notIncludedYet: [
    "Buying, registering, renewing, or transferring domains through Bumpgrade.",
    "Publisher site editor parity for arbitrary pages on the reserved hostname.",
    "Logged-out anonymous workspace recovery.",
    "Raw browser-cookie sharing across unrelated custom domains.",
  ],
};
