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

export type MobilePrivateRowsApi = {
  id: string;
  issue: number;
  status: "owner-mobile-private-rows-ready";
  route: string;
  authBoundary: "owner-session";
  purpose: string;
  readBoundary: string;
  publicSourceDataSummary: string;
  redactionFlags: string[];
};

export type MobilePrivateRowActionsApi = {
  id: string;
  issue: number;
  status: "owner-mobile-private-row-actions-ready";
  route: string;
  authBoundary: "owner-session";
  purpose: string;
  actionBoundary: string;
  publicSourceDataSummary: string;
  requiredInputs: string[];
  redactionFlags: string[];
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

export type MobilePushNotificationBoundary = {
  id: string;
  issue: number;
  status: "push-boundary-ready";
  sendCapability: "disabled-provider-contract-required";
  purpose: string;
  requiredProviders: Array<{
    platform: MobilePlatformId;
    provider: "APNs" | "FCM";
    credentialBoundary: string;
    requiredEvidence: string[];
  }>;
  deliveryScope: string[];
  readinessChecklist: string[];
  blockedBy: string[];
  publicSourceDataSummary: string;
  redactionFlags: string[];
};

export type MobileDistributionReadiness = {
  id: string;
  issue: number;
  status: "distribution-boundary-ready";
  installableDistributionClaim: false;
  purpose: string;
  platformEvidence: Array<{
    platform: MobilePlatformId;
    currentEvidence: string;
    requiredBeforeClaim: string[];
    blockedBy: string[];
  }>;
  readinessChecklist: string[];
  publicSourceDataSummary: string;
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
  privateRowsApi: MobilePrivateRowsApi;
  privateRowActionsApi: MobilePrivateRowActionsApi;
  actionIntentApi: MobileActionIntentApi;
  pushNotificationBoundary: MobilePushNotificationBoundary;
  distributionReadiness: MobileDistributionReadiness;
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
    "Issue #13 ships the shared mobile-admin contract, API dependency map, jobs-to-be-done, and platform issue split. Issues #67 and #68 prove the first iOS and Android smoke surfaces, issue #153 adds the live public-safe dashboard source-data contract, issue #155 renders that dashboard in the app scaffolds, and issue #157 hydrates the dashboard from the live public route with fixture fallback. Issue #414 now adds the shared mobile owner-session contract, owner-gated private-row inspection API, confirmed-action UI contract, owner-gated audit-only action-intent API, push-notification boundary, and store-distribution readiness boundary to the iOS, Android, and Expo scaffolds. Issue #428 adds low-risk owner-confirmed private-row workflow actions. This still does not ship installable private app distribution, push notifications, high-risk production mobile mutations, App Store distribution, or Play Store distribution.",
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
  privateRowsApi: {
    id: "mobile-private-rows-api",
    issue: 414,
    status: "owner-mobile-private-rows-ready",
    route: "/api/mobile-admin/private-rows",
    authBoundary: "owner-session",
    purpose:
      "Let a verified owner inspect read-only Mobile Admin private rows through the same Better Auth owner session used by web admin.",
    readBoundary:
      "The endpoint returns owner-only private row notes and synthetic private payload metadata only to authenticated owners. Public mobile source-data exposes route, status, counts, public row labels, and redaction flags without owner-only notes, private payload JSON, owner email values, session IDs, cookies, tokens, or raw rows.",
    publicSourceDataSummary:
      "/mobile-admin/source-data and /mobile-admin/dashboard/source-data may expose the private-row API route, status, counts, and redaction flags; owner-only GET /api/mobile-admin/private-rows is required before private row notes or private payload metadata are returned.",
    redactionFlags: [
      "privateRowsIncludedInPublicSourceData=false",
      "ownerOnlyNotesIncludedInPublicSourceData=false",
      "privatePayloadIncludedInPublicSourceData=false",
      "ownerEmailValuesIncluded=false",
      "sessionIdentifiersIncluded=false",
      "cookiesIncluded=false",
      "tokensIncluded=false",
      "rawRowsIncluded=false",
    ],
  },
  privateRowActionsApi: {
    id: "mobile-private-row-actions-api",
    issue: 428,
    status: "owner-mobile-private-row-actions-ready",
    route: "/api/mobile-admin/private-rows/actions",
    authBoundary: "owner-session",
    purpose:
      "Let a verified owner mark Mobile Admin private rows read or deferred through a low-risk confirmed-write endpoint.",
    actionBoundary:
      "The endpoint mutates only private-row workflow state after exact confirmation, idempotency, stale row revision, stale-state token, and audit-correlation checks. It creates no billing mutation, commerce mutation, publishing mutation, push notification, distribution state change, moderation action, creator-speech action, or public agent write.",
    publicSourceDataSummary:
      "/mobile-admin/source-data and /mobile-admin/dashboard/source-data may expose the private-row action API route, status, counts, latest redacted action labels, and redaction flags; owner-only GET /api/mobile-admin/private-rows/actions?rowId=... is required before stale-state tokens are returned.",
    requiredInputs: [
      "rowId",
      "actionId",
      "expectedRowUpdatedAt",
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
      "privatePayloadIncluded=false",
      "ownerOnlyNoteIncluded=false",
      "idempotencyKeysIncluded=false",
      "staleStateTokenIncludedInPublicSourceData=false",
      "staleStateTokenHashIncluded=false",
      "rawRowsIncluded=false",
      "productionMutationCreated=false",
      "billingMutationCreated=false",
      "pushNotificationSent=false",
      "distributionStateChanged=false",
    ],
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
  pushNotificationBoundary: {
    id: "mobile-push-notification-boundary",
    issue: 414,
    status: "push-boundary-ready",
    sendCapability: "disabled-provider-contract-required",
    purpose:
      "Define the APNs/FCM provider, consent, payload, queue, audit, and redaction gates required before Mobile Admin can send or schedule push notifications.",
    requiredProviders: [
      {
        platform: "ios",
        provider: "APNs",
        credentialBoundary:
          "APNs credentials, team identifiers, bundle identifiers, device tokens, and push payloads must stay out of public source-data and fixture files.",
        requiredEvidence: [
          "APNs provider choice and credential storage path",
          "iOS bundle ID and entitlement proof",
          "Device-token registration contract",
          "Owner-confirmed send preflight with idempotency and audit correlation",
        ],
      },
      {
        platform: "android",
        provider: "FCM",
        credentialBoundary:
          "FCM server keys, service account JSON, sender IDs, device tokens, and push payloads must stay out of public source-data and fixture files.",
        requiredEvidence: [
          "FCM provider choice and credential storage path",
          "Android package and google-services configuration proof",
          "Device-token registration contract",
          "Owner-confirmed send preflight with idempotency and audit correlation",
        ],
      },
    ],
    deliveryScope: [
      "No mobile push notification is sent by the current Mobile Admin contract.",
      "No APNs or FCM provider call is made by the current Mobile Admin contract.",
      "No device token, recipient address, push body, provider credential, queue row, or delivery receipt is exposed in public source-data.",
      "Future push sends must require owner session, exact confirmation, idempotency, stale-state checks, audit correlation, opt-in/consent evidence, payload review, and redaction.",
    ],
    readinessChecklist: [
      "Choose APNs/FCM credential storage and rotation policy.",
      "Add private device-token registration and revocation contracts.",
      "Add push send preflight records before provider calls.",
      "Add queue, retry, delivery-result, and receipt boundaries before live sends.",
      "Add simulator/emulator and physical-device evidence without treating simulator proof as production delivery.",
    ],
    blockedBy: [
      "No APNs credential plumbing is present in the repo.",
      "No FCM credential plumbing is present in the repo.",
      "No private device-token registration contract exists yet.",
      "No owner-confirmed push send preflight or provider-call API exists yet.",
    ],
    publicSourceDataSummary:
      "Public mobile source-data may expose provider names, disabled send status, required evidence, blocked-by reasons, and redaction flags. It must not expose APNs/FCM credentials, device tokens, recipient identities, push payload bodies, queue rows, provider responses, or delivery receipts.",
    redactionFlags: [
      "apnsCredentialsIncluded=false",
      "fcmCredentialsIncluded=false",
      "deviceTokensIncluded=false",
      "recipientIdentifiersIncluded=false",
      "pushPayloadBodiesIncluded=false",
      "providerResponsesIncluded=false",
      "queueRowsIncluded=false",
      "deliveryReceiptsIncluded=false",
      "pushNotificationsSent=false",
    ],
  },
  distributionReadiness: {
    id: "mobile-distribution-readiness-boundary",
    issue: 414,
    status: "distribution-boundary-ready",
    installableDistributionClaim: false,
    purpose:
      "Separate simulator/emulator proof from installable iOS and Android distribution claims before Mobile Admin is described as App Store, TestFlight, Play Store, internal testing, or physical-device ready.",
    platformEvidence: [
      {
        platform: "ios",
        currentEvidence:
          "The iOS scaffold has a simulator smoke target and screenshots, but physical-device proof is parked while the detected iPhone target is unavailable.",
        requiredBeforeClaim: [
          "Available physical iPhone target or explicit simulator-only acceptance decision",
          "Bundle identifier and signing profile decision",
          "TestFlight or App Store Connect distribution path",
          "Private-row/auth smoke proof labeled as simulator, physical device, or distribution evidence",
        ],
        blockedBy: ["Detected iPhone target is unavailable to devicectl in the current environment."],
      },
      {
        platform: "android",
        currentEvidence:
          "The Android scaffold has an emulator smoke target and screenshots, but physical-device proof is parked because no Android device is attached.",
        requiredBeforeClaim: [
          "Attached Android physical device or explicit emulator-only acceptance decision",
          "Release signing and package identity decision",
          "Play Console/internal testing distribution path",
          "Private-row/auth smoke proof labeled as emulator, physical device, or distribution evidence",
        ],
        blockedBy: ["adb currently reports no attached physical Android devices in the project blocker audit."],
      },
    ],
    readinessChecklist: [
      "Keep simulator and emulator screenshots labeled as non-distribution evidence.",
      "Record physical-device smoke proof separately from simulator/emulator proof.",
      "Record signing, bundle/package, and store-track decisions before claiming installability.",
      "Do not label App Store, TestFlight, Play Store, or internal testing as live until platform evidence exists.",
    ],
    publicSourceDataSummary:
      "Public mobile source-data may expose simulator/emulator status, required platform evidence, and current blockers. It must not expose signing credentials, provisioning profiles, keystore material, store account identifiers, private tester lists, or physical-device private rows.",
    redactionFlags: [
      "signingCredentialsIncluded=false",
      "provisioningProfilesIncluded=false",
      "keystoreMaterialIncluded=false",
      "storeAccountIdentifiersIncluded=false",
      "privateTesterListsIncluded=false",
      "physicalDevicePrivateRowsIncluded=false",
      "appStoreDistributionLive=false",
      "playStoreDistributionLive=false",
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
        "/api/mobile-admin/private-rows",
        "/api/mobile-admin/private-rows/actions",
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
      id: "mobile-api-private-rows",
      route: "/api/mobile-admin/private-rows",
      purpose:
        "Owner-session-only private row inspection for Mobile Admin clients, with public source-data limited to route, status, counts, public row labels, and redaction flags.",
      authBoundary: "owner-session",
      stableIds: ["mobilePrivateRowId", "sourceRoute", "sourceRecordId", "readState"],
    },
    {
      id: "mobile-api-private-row-actions",
      route: "/api/mobile-admin/private-rows/actions",
      purpose:
        "Owner-confirmed private row workflow actions for Mobile Admin clients, limited to low-risk mark-read and defer mutations with redacted audit evidence.",
      authBoundary: "owner-session",
      stableIds: ["mobilePrivateRowActionId", "mobilePrivateRowId", "idempotencyKey", "auditCorrelationId", "staleStateToken"],
    },
    {
      id: "mobile-api-confirmed-writes",
      route: "/api/mobile-admin/actions",
      purpose:
        "Owner-gated mobile action-intent endpoint for redacted audit-only confirmation evidence before future domain-specific confirmed-write APIs mutate admin, publishing, commerce, or agent-proposal state.",
      authBoundary: "owner-confirmed-intent",
      stableIds: ["agentActionId", "idempotencyKey", "auditCorrelationId", "staleStateToken"],
    },
    {
      id: "mobile-api-push-boundary",
      route: "/mobile-admin/source-data",
      purpose:
        "Public-safe push-notification readiness boundary for APNs/FCM provider requirements, disabled send status, blockers, and redaction flags before any Mobile Admin push sends exist.",
      authBoundary: "public-safe",
      stableIds: ["mobilePushBoundaryId", "provider", "readinessChecklist", "blockedBy"],
    },
    {
      id: "mobile-api-distribution-boundary",
      route: "/mobile-admin/source-data",
      purpose:
        "Public-safe distribution readiness boundary that separates simulator/emulator evidence from physical-device and App Store/Play Store claims.",
      authBoundary: "public-safe",
      stableIds: ["mobileDistributionReadinessId", "platform", "requiredBeforeClaim", "blockedBy"],
    },
  ],
  confirmedWriteRules: [
    "The first private mobile row slice is read-only through /api/mobile-admin/private-rows and cannot mutate production state.",
    "The first Mobile Admin private-row confirmed-write slice can mark private rows read or deferred through /api/mobile-admin/private-rows/actions, but it cannot mutate billing, commerce, publishing, moderation, creator speech, push notifications, distribution, or public agent state.",
    "The first mobile app slices can record audit-only action intents through /api/mobile-admin/actions, but production mutations remain disabled until domain-specific confirmed-write APIs exist.",
    "Do not ship mobile-only product semantics; mobile reads and writes must map to the same feature, roadmap, commerce, admin, and agent contracts as web.",
    "Public, destructive, billing-impacting, publishing, moderation, source-editing, and creator-speech writes require explicit confirmation text.",
    "Billing-impacting mobile actions require amount, currency, price/product stale-state checks, idempotency, audit correlation, redaction, and webhook evidence.",
    "Mobile push sends remain disabled until APNs/FCM provider configuration, device-token registration, send preflight, queue, delivery-result, receipt, idempotency, consent, audit, and redaction boundaries exist.",
    "Mobile distribution remains disabled until physical-device proof and App Store/TestFlight or Play Store/internal-testing evidence are recorded separately from simulator/emulator proof.",
    "Private admin data requires an authenticated owner or publisher session; public source-data routes must remain safe for anonymous agents.",
  ],
};
