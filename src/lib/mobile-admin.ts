export type MobilePlatformId = "ios" | "android";

export type MobileJob = {
  id: string;
  title: string;
  primaryUser: string;
  goal: string;
  firstScreen: string;
  sourceRoutes: string[];
  writeBoundary: string;
};

export type MobileApiDependency = {
  id: string;
  route: string;
  purpose: string;
  authBoundary: "public-safe" | "owner-session" | "owner-confirmed-intent" | "future-confirmed-write";
  stableIds: string[];
};

export type MobilePrivateAuth = {
  id: string;
  issue: number;
  status: "owner-session-contract-ready";
  sessionRoute: string;
  loginRoute: string;
  callbackSurface: string;
  acceptedRoles: string[];
  sessionSemantics: string;
  deniedStates: string[];
  platformBehavior: string[];
  redactionBoundary: string;
};

export type MobileConfirmedAction = {
  id: string;
  issue: number;
  title: string;
  status: "mobile-ui-contract-ready" | "owner-intent-api-ready" | "future-api-required";
  surface: string;
  confirmationText: string;
  requiredInputs: string[];
  safetyRules: string[];
  mutationBoundary: string;
};

export type MobileActionIntentApi = {
  id: string;
  issue: number;
  status: "owner-mobile-action-intent-ready";
  route: string;
  authBoundary: "owner-session";
  purpose: string;
  intentBoundary: string;
  publicSourceDataSummary: string;
  requiredInputs: string[];
  redactionFlags: string[];
};

export type MobilePlatformSlice = {
  platform: MobilePlatformId;
  issue: number;
  title: string;
  firstMilestone: string;
  validation: string[];
  status?: "planned" | "scaffolded" | "simulator-smoke-ready" | "emulator-smoke-ready";
  appPath?: string;
  sourceDataRoute?: string;
  fixturePath?: string;
  smokeCommand?: string;
  screenshotPath?: string;
};

export type MobileLiveDashboard = {
  id: string;
  issue: number;
  renderedInScaffoldsIssue?: number;
  liveHydrationIssue?: number;
  status: "live-public-source-data-ready";
  route: string;
  purpose: string;
  publicSafeReads: string[];
  redactionBoundary: string;
};

export type MobileAdminContract = {
  id: string;
  updatedAt: string;
  publicBaseUrl: string;
  parentIssue: number;
  currentFollowupIssue: number;
  status: "contract-ready";
  featureId: string;
  stackDecision: string;
  scaffoldBoundary: string;
  liveDashboard: MobileLiveDashboard;
  privateAuth: MobilePrivateAuth;
  actionIntentApi: MobileActionIntentApi;
  confirmedActions: MobileConfirmedAction[];
  childIssues: MobilePlatformSlice[];
  jobs: MobileJob[];
  apiDependencies: MobileApiDependency[];
  confirmedWriteRules: string[];
};

export const mobileAdminUpdatedAt = "2026-05-24";

export const mobileAdminContract: MobileAdminContract = {
  id: "bumpgrade-mobile-admin-contract",
  updatedAt: mobileAdminUpdatedAt,
  publicBaseUrl: "https://bumpgrade.com",
  parentIssue: 13,
  currentFollowupIssue: 414,
  status: "contract-ready",
  featureId: "feature-mobile-admin",
  stackDecision:
    "Start the publisher admin apps as an Expo React Native TypeScript workspace shared by iOS and Android, unless the child issue smoke tests expose a platform-specific reason to split native code. The repo has no existing native app tree, and the current web/admin state is already modeled as public-safe TypeScript/JSON contracts.",
  scaffoldBoundary:
    "Issue #13 ships the shared mobile-admin contract, API dependency map, jobs-to-be-done, and platform issue split. Issues #67 and #68 prove the first iOS and Android smoke surfaces, issue #153 adds the live public-safe dashboard source-data contract, issue #155 renders that dashboard in the app scaffolds, and issue #157 hydrates the dashboard from the live public route with fixture fallback. Issue #414 now adds the shared mobile owner-session contract, confirmed-action UI contract, and owner-gated audit-only action-intent API to the iOS, Android, and Expo scaffolds. This still does not ship installable private app distribution, push notifications, production mobile mutations, App Store distribution, or Play Store distribution.",
  liveDashboard: {
    id: "mobile-live-dashboard-source-data",
    issue: 153,
    renderedInScaffoldsIssue: 155,
    liveHydrationIssue: 157,
    status: "live-public-source-data-ready",
    route: "/mobile-admin/dashboard/source-data",
    purpose:
      "Give iOS, Android, web, and agents one public-safe mobile dashboard payload summarizing features, roadmap state, work-log recency, attention counts, commerce contract state, and agent-readiness without exposing private admin data.",
    publicSafeReads: [
      "/features/source-data",
      "/roadmap/source-data",
      "/admin/source-data",
      "/admin/work-log/source-data",
      "/admin/for-mark/source-data",
      "/commerce/source-data",
      "/agent-docs/source-data",
    ],
    redactionBoundary:
      "The dashboard exposes counts, statuses, route IDs, issue evidence, and recent public-safe work-log metadata only. It excludes private buyer rows, raw inbox bodies, owner email values, session IDs, R2 object keys, signed URLs, upload bodies, secret values, and write tokens.",
  },
  privateAuth: {
    id: "mobile-private-owner-session",
    issue: 414,
    status: "owner-session-contract-ready",
    sessionRoute: "/api/auth/[...all]",
    loginRoute: "/login",
    callbackSurface: "/admin/director",
    acceptedRoles: ["owner"],
    sessionSemantics:
      "Mobile private views reuse the same Better Auth cookie/session, owner allowlist, verified-email gate, and admin role mapping as web admin. The mobile app must not invent mobile-only roles or bypass the web/admin owner boundary.",
    deniedStates: ["signed_out", "not_allowlisted", "email_unverified", "session_unavailable"],
    platformBehavior: [
      "iOS and Android show public-safe dashboard data while signed out.",
      "Private mobile rows stay hidden until an owner session is accepted by the same admin auth contract as web.",
      "A denied mobile session should route the owner through the shared login/callback flow rather than storing mobile-only credentials.",
    ],
    redactionBoundary:
      "Mobile auth source-data may name routes, roles, denial states, and issue evidence, but it must not expose owner email values, session IDs, cookies, tokens, raw Better Auth payloads, or private admin rows.",
  },
  actionIntentApi: {
    id: "mobile-action-intent-api",
    issue: 414,
    status: "owner-mobile-action-intent-ready",
    route: "/api/mobile-admin/actions",
    authBoundary: "owner-session",
    purpose:
      "Let a verified owner record an audit-only mobile action intent after exact confirmation, idempotency, stale-state, contract revision, source-route, and audit-correlation checks.",
    intentBoundary:
      "The endpoint records redacted action intent evidence only. It creates no production admin mutation, billing mutation, push notification, distribution state change, private mobile row exposure, or direct public agent write.",
    publicSourceDataSummary:
      "/mobile-admin/source-data and /mobile-admin/dashboard/source-data may expose route, status, counts, and redaction flags; owner-only GET /api/mobile-admin/actions is required before stale-state tokens are returned.",
    requiredInputs: [
      "actionId",
      "sourceRoute",
      "expectedContractUpdatedAt",
      "staleStateToken",
      "confirmationText",
      "idempotencyKey",
      "auditCorrelationId",
    ],
    redactionFlags: [
      "actorEmailIncluded=false",
      "actorEmailHashIncluded=false",
      "actorUserIdIncluded=false",
      "privateNoteIncluded=false",
      "idempotencyKeysIncluded=false",
      "staleStateTokenHashIncluded=false",
      "productionMutationCreated=false",
      "billingMutationCreated=false",
      "pushNotificationSent=false",
      "distributionStateChanged=false",
    ],
  },
  confirmedActions: [
    {
      id: "mobile-confirm-review-agent-work",
      issue: 414,
      title: "Review and confirm agent work",
      status: "owner-intent-api-ready",
      surface: "For-Mark and work-log inbox",
      confirmationText: "CONFIRM MOBILE ADMIN ACTION",
      requiredInputs: [
        "actorUserId",
        "role",
        "actionId",
        "sourceRoute",
        "expectedContractUpdatedAt",
        "idempotencyKey",
        "staleStateToken",
        "auditCorrelationId",
      ],
      safetyRules: [
        "Require exact confirmation before public, billing-impacting, publishing, moderation, source-editing, or creator-speech writes.",
        "Check the current source-data revision before accepting stale mobile approvals.",
        "Return redacted result metadata only; never return raw private payloads to public source-data.",
      ],
      mutationBoundary:
        "The current /api/mobile-admin/actions endpoint can record owner-gated, audit-only intent evidence for this action. Future domain-specific confirmed-write endpoints must implement any production mutation before a mobile approval can change production state.",
    },
    {
      id: "mobile-confirm-commerce-change",
      issue: 414,
      title: "Confirm commerce or fulfillment changes",
      status: "future-api-required",
      surface: "Commerce health summary",
      confirmationText: "CONFIRM MOBILE COMMERCE ACTION",
      requiredInputs: ["actorUserId", "role", "priceId", "amount", "currency", "idempotencyKey", "staleStateToken", "auditCorrelationId"],
      safetyRules: [
        "Verify amount, currency, product, price, and checkout mode before any billing-impacting action.",
        "Record audit correlation and webhook evidence for live billing actions.",
        "Keep buyer identity, entitlement rows, signed URLs, and R2 object keys out of public mobile output.",
      ],
      mutationBoundary:
        "No mobile checkout, refund, subscription, price, fulfillment, or entitlement mutation is live until the shared confirmed-write API and platform evidence exist.",
    },
  ],
  childIssues: [
    {
      platform: "ios",
      issue: 67,
      title: "Build first iOS publisher admin app slice",
      firstMilestone:
        "Render the mobile admin digest, fetch the live dashboard route, and preserve fixture fallback in the Expo app scaffold and iOS simulator smoke target.",
      validation: [
        "Run npm run mobile:ios:validate to prove the fixture matches the shared contract and Xcode is available.",
        "Run npm run mobile:ios:smoke to build, install, launch, live-read/fallback hydrate, and screenshot the iOS simulator target.",
      ],
      status: "simulator-smoke-ready",
      appPath: "apps/mobile-admin",
      sourceDataRoute: "/mobile-admin/ios/source-data",
      fixturePath: "apps/mobile-admin/fixtures/mobile-admin-contract.json",
      smokeCommand: "npm run mobile:ios:smoke",
      screenshotPath: "/pr-screenshots/issue-67-ios-mobile-admin-simulator.png",
    },
    {
      platform: "android",
      issue: 68,
      title: "Build first Android publisher admin app slice",
      firstMilestone:
        "Render the mobile admin digest, fetch the live dashboard route, and preserve fixture fallback in a native Android activity and emulator smoke target.",
      validation: [
        "Run npm run mobile:android:validate to prove the fixture matches the shared contract and Android API 36 tooling is available.",
        "Run npm run mobile:android:smoke to build, install, launch, live-read/fallback hydrate, and screenshot the Android emulator target.",
      ],
      status: "emulator-smoke-ready",
      appPath: "apps/mobile-admin",
      sourceDataRoute: "/mobile-admin/android/source-data",
      fixturePath: "apps/mobile-admin/fixtures/mobile-admin-contract.json",
      smokeCommand: "npm run mobile:android:smoke",
      screenshotPath: "/pr-screenshots/issue-68-android-mobile-admin-emulator.png",
    },
  ],
  jobs: [
    {
      id: "mobile-job-launch-status",
      title: "Check launch and platform status away from desktop",
      primaryUser: "Publisher or owner monitoring Bumpgrade from a phone",
      goal: "See whether funnels, checkout, products, email, analytics, agent work, and blockers are moving without opening the desktop admin app.",
      firstScreen: "Mobile admin digest",
      sourceRoutes: ["/mobile-admin/dashboard/source-data", "/features/source-data", "/roadmap/source-data", "/admin/source-data"],
      writeBoundary: "Read-only in the first mobile slice.",
    },
    {
      id: "mobile-job-approve-agent-work",
      title: "Review agent work and confirm safe follow-up actions",
      primaryUser: "Owner receiving Codex, ChatGPT, Claude, or automation proposals",
      goal: "Inspect work-log entries, for-Mark items, screenshots, and required confirmations before approving public or billing-impacting work.",
      firstScreen: "For-Mark and work-log inbox",
      sourceRoutes: [
        "/mobile-admin/dashboard/source-data",
        "/admin/work-log/source-data",
        "/admin/for-mark/source-data",
        "/agent-docs/source-data",
      ],
      writeBoundary: "Confirmed writes need actor identity, confirmation text, idempotency key, stale-state check, audit correlation, and redaction.",
    },
    {
      id: "mobile-job-check-commerce",
      title: "Inspect offer and checkout health",
      primaryUser: "Publisher watching sales and fulfillment state",
      goal: "Read products, prices, sandbox/live checkout state, webhook evidence, and known Stripe blockers before taking action.",
      firstScreen: "Commerce health summary",
      sourceRoutes: ["/mobile-admin/dashboard/source-data", "/commerce/source-data", "/api/commerce/checkout"],
      writeBoundary: "No live checkout, refund, subscription, price, or fulfillment mutation from mobile until confirmed-write APIs ship.",
    },
  ],
  apiDependencies: [
    {
      id: "mobile-api-dashboard",
      route: "/mobile-admin/dashboard/source-data",
      purpose:
        "Live public-safe dashboard bundle for iOS and Android clients so mobile does not stitch or infer project state from hidden admin pages.",
      authBoundary: "public-safe",
      stableIds: ["mobileDashboardCardId", "featureId", "roadmapItemId", "workLogEntryId", "markAttentionId", "agentReadContractId"],
    },
    {
      id: "mobile-api-admin-source",
      route: "/admin/source-data",
      purpose: "Public-safe roadmap, work-log, user-journey, and Mark-attention digest for the first mobile admin screen.",
      authBoundary: "public-safe",
      stableIds: ["workLogEntryId", "userJourneyId", "markAttentionId", "roadmapItemId"],
    },
    {
      id: "mobile-api-feature-catalog",
      route: "/features/source-data",
      purpose: "Feature status and issue evidence for the mobile dashboard.",
      authBoundary: "public-safe",
      stableIds: ["featureId", "issue", "status"],
    },
    {
      id: "mobile-api-roadmap",
      route: "/roadmap/source-data",
      purpose: "Public roadmap lanes, blockers, next milestones, and issue links.",
      authBoundary: "public-safe",
      stableIds: ["roadmapItemId", "featureId", "issue", "status"],
    },
    {
      id: "mobile-api-commerce",
      route: "/commerce/source-data",
      purpose: "Redacted products, prices, checkout-intent, webhook, subscription, and audit architecture.",
      authBoundary: "public-safe",
      stableIds: ["productId", "priceId", "checkoutIntentId", "auditCorrelationId"],
    },
    {
      id: "mobile-api-auth",
      route: "/api/auth/[...all]",
      purpose: "Better Auth session boundary for future private publisher/admin mobile views.",
      authBoundary: "owner-session",
      stableIds: ["userId", "sessionId", "role"],
    },
    {
      id: "mobile-api-confirmed-writes",
      route: "/api/mobile-admin/actions",
      purpose:
        "Owner-gated mobile action-intent endpoint for redacted audit-only confirmation evidence before future domain-specific confirmed-write APIs mutate admin, publishing, commerce, or agent-proposal state.",
      authBoundary: "owner-confirmed-intent",
      stableIds: ["agentActionId", "idempotencyKey", "auditCorrelationId", "staleStateToken"],
    },
  ],
  confirmedWriteRules: [
    "The first mobile app slices can record audit-only action intents through /api/mobile-admin/actions, but production mutations remain disabled until domain-specific confirmed-write APIs exist.",
    "Do not ship mobile-only product semantics; mobile reads and writes must map to the same feature, roadmap, commerce, admin, and agent contracts as web.",
    "Public, destructive, billing-impacting, publishing, moderation, source-editing, and creator-speech writes require explicit confirmation text.",
    "Billing-impacting mobile actions require amount, currency, price/product stale-state checks, idempotency, audit correlation, redaction, and webhook evidence.",
    "Private admin data requires an authenticated owner or publisher session; public source-data routes must remain safe for anonymous agents.",
  ],
};
