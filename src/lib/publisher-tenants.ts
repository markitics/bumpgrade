import { getCloudflareContext } from "@opennextjs/cloudflare";

export type PublisherPlanEntitlementStatus = "active" | "inactive" | "expired";
export type PublisherTenantStatus = "active" | "suspended";
export type PublisherSubdomainReservationStatus = "active" | "reserved" | "released";
export type PublisherAccountStateKind = "signed_out" | "ready" | "unverified" | "unpaid" | "unavailable";

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
  planStatus: string;
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

export type PublisherAccountState = {
  kind: PublisherAccountStateKind;
  user: PublisherSessionUser | null;
  entitlement: PublisherPlanEntitlement | null;
  tenant: PublisherTenant | null;
  reservation: PublisherSubdomainReservation | null;
  canReserveSubdomain: boolean;
  message: string;
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
  plan_status: string;
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

type ReservePublisherSubdomainInput = {
  subdomain: string;
  idempotencyKey: string;
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
export const publisherTenantParentIssue = 221;
export const publisherTenantUpdatedAt = "2026-05-20";
export const publisherSubdomainApiRoute = "/api/account/publisher/subdomain";
export const publisherAccountSetupRoute = "/account/setup";
export const publisherAccountSourceDataRoute = "/account/source-data";
export const publisherDefaultDomain = "bumpgrade.com";
export const publisherSubdomainConfirmationText = "Reserve this Bumpgrade subdomain for my paid publisher account";

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
      canReserveSubdomain: false,
      message: "Sign in or create a publisher account before reserving a Bumpgrade subdomain.",
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
      canReserveSubdomain: false,
      message: "Confirm your email before reserving a Bumpgrade subdomain.",
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
      canReserveSubdomain: false,
      message: "Publisher account storage is unavailable in this runtime.",
      source: "none",
    };
  }

  const entitlement = await loadActivePlanEntitlement(db, user);
  if (!entitlement) {
    return {
      kind: "unpaid",
      user,
      entitlement: null,
      tenant: await loadTenant(db, user),
      reservation: null,
      canReserveSubdomain: false,
      message: "A paid plan or launch-pilot entitlement is required before choosing a Bumpgrade subdomain.",
      source: "d1",
    };
  }

  const tenant = await loadTenant(db, user);
  const reservation = tenant ? await loadReservationForTenant(db, tenant.id) : null;

  return {
    kind: "ready",
    user,
    entitlement,
    tenant,
    reservation,
    canReserveSubdomain: !reservation,
    message: reservation
      ? `${reservation.fullHostname} is reserved for this publisher account.`
      : "This paid publisher account can reserve a Bumpgrade subdomain.",
    source: "d1",
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

  const existingForIdempotency = await loadReservationByIdempotencyKey(db, idempotencyKey);
  if (existingForIdempotency) {
    return {
      tenant: (await loadTenant(db, user)) ?? null,
      reservation: existingForIdempotency,
      idempotent: true,
    };
  }

  const normalized = normalizePublisherSubdomain(input.subdomain);
  if (!normalized.ok) {
    throw new PublisherTenantError(normalized.error, 400, normalized.code);
  }

  const entitlement = await loadActivePlanEntitlement(db, user);
  if (!entitlement) {
    throw new PublisherTenantError(
      "Choose a paid plan or activate a launch pilot before reserving a Bumpgrade subdomain.",
      402,
      "PAID_PLAN_REQUIRED",
    );
  }

  const tenant = await upsertTenant(db, user, entitlement);
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

export const publisherTenantSourceData = {
  id: "publisher-tenant-subdomain-contract",
  status: "live",
  updatedAt: publisherTenantUpdatedAt,
  parentIssue: publisherTenantParentIssue,
  issue: publisherTenantIssue,
  routes: {
    accountSetup: publisherAccountSetupRoute,
    accountSourceData: publisherAccountSourceDataRoute,
    reserveSubdomainApi: publisherSubdomainApiRoute,
  },
  tables: [
    {
      name: "publisher_plan_entitlements",
      purpose: "Paid-plan or launch-pilot gate checked before a publisher can reserve a Bumpgrade subdomain.",
      publicSafeFields: ["status", "source", "plan_slug", "starts_at", "ends_at"],
      privateFields: ["owner_user_id", "owner_email"],
    },
    {
      name: "publisher_tenants",
      purpose: "One publisher workspace with owner identity, paid plan status, default subdomain, and primary hostname.",
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
      name: "publisher_tenant_audit_events",
      purpose: "Append-only tenant setup evidence for subdomain reservation and future domain/custom-domain changes.",
      publicSafeFields: ["event_kind", "summary", "created_at"],
      privateFields: ["actor_user_id", "actor_email", "metadata_json"],
    },
  ],
  subdomainPolicy: {
    defaultDomain: publisherDefaultDomain,
    paidPlanRequired: true,
    emailVerificationRequired: true,
    allowedPattern: "lowercase letters, numbers, and hyphens; 3-63 characters; cannot start or end with hyphen",
    reservedNames: Array.from(reservedSubdomains).sort(),
  },
  crossSubdomainAuth: {
    status: "configured",
    cookieDomain: publisherDefaultDomain,
    trustedOriginPattern: "https://*.bumpgrade.com",
    goal: "One Better Auth login should apply across bumpgrade.com and paid publisher subdomains such as a.bumpgrade.com and b.bumpgrade.com.",
    caveat:
      "Custom-domain authentication still needs the custom-domain onboarding slice because browser cookies cannot span unrelated customer-owned domains.",
  },
  notIncludedYet: [
    "Buying domains through Bumpgrade.",
    "Custom-domain DNS verification and certificate readiness.",
    "Publisher site editor parity for arbitrary pages on the reserved hostname.",
    "Customer auth across unrelated custom domains.",
  ],
};
