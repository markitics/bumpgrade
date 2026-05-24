import { adminRoadmapCounts, getAdminSurfaceData } from "@/lib/admin-surface-data";
import { agentManifest } from "@/lib/agent-manifest";
import { commerceTables } from "@/lib/commerce";
import { featureCatalog, featureCatalogUpdatedAt, type FeatureStatus } from "@/lib/feature-catalog";
import { getMobileAdminActionIntentSummary } from "@/lib/mobile-admin-actions";
import { getMobileAdminPrivateRowsSummary } from "@/lib/mobile-admin-private-rows";
import { androidMobileAdminSourceData } from "@/lib/mobile-admin-android";
import { iosMobileAdminSourceData } from "@/lib/mobile-admin-ios";
import { mobileAdminContract, mobileAdminUpdatedAt } from "@/lib/mobile-admin";
import { roadmapCounts, roadmapItems, roadmapUpdatedAt } from "@/lib/roadmap";

export const mobileAdminDashboardIssue = 153;
export const mobileAdminDashboardRoute = "/mobile-admin/dashboard/source-data";
export const mobileAdminDashboardStatus = "live-public-mobile-dashboard-ready";

function publicSafeText(value: string) {
  return value.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email-redacted]");
}

function countByFeatureStatus(status: FeatureStatus) {
  return featureCatalog.filter((feature) => feature.status === status).length;
}

function recentWorkLogEntries(entries: Awaited<ReturnType<typeof getAdminSurfaceData>>["workLogEntries"]) {
  return entries.slice(0, 5).map((entry) => ({
    id: entry.id,
    title: publicSafeText(entry.title),
    completedAt: entry.completedAt,
    githubIssueNumbers: entry.githubIssues.map((issue) => issue.number).filter((number) => typeof number === "number"),
    closedPrNumbers: entry.closedPrs.map((pr) => pr.number).filter((number) => typeof number === "number"),
    prCommentUrl: entry.prCommentUrl,
  }));
}

function attentionSummaries(items: Awaited<ReturnType<typeof getAdminSurfaceData>>["attentionItems"]) {
  return items.map((item) => ({
    id: item.id,
    category: item.category,
    state: item.state,
    urgency: item.urgency,
    title: publicSafeText(item.title),
    responseChannelIds: item.responseChannels?.map((channel) => channel.id) ?? [],
    linkIssueNumbers: item.links.map((link) => link.number).filter((number) => typeof number === "number"),
    lastActivityAt: item.lastActivityAt,
  }));
}

export async function getMobileAdminDashboardSourceData() {
  const adminData = await getAdminSurfaceData();
  const actionIntentSummary = await getMobileAdminActionIntentSummary({ includeStaleStateTokens: false });
  const privateRowsSummary = await getMobileAdminPrivateRowsSummary();
  const mobileFeature = featureCatalog.find((feature) => feature.id === mobileAdminContract.featureId);
  const mobileRoadmapItem = roadmapItems.find((item) => item.issue === mobileAdminContract.parentIssue);

  return {
    id: "bumpgrade-mobile-admin-dashboard-source-data",
    generatedFrom: "src/lib/mobile-admin-dashboard.ts",
    updatedAt: mobileAdminUpdatedAt,
    status: mobileAdminDashboardStatus,
    issue: mobileAdminDashboardIssue,
    parentIssue: mobileAdminContract.parentIssue,
    featureId: mobileAdminContract.featureId,
    route: mobileAdminDashboardRoute,
    sourceRoutes: [
      mobileAdminContract.liveDashboard.route,
      "/mobile-admin/source-data",
      iosMobileAdminSourceData.sourceDataRoute,
      androidMobileAdminSourceData.sourceDataRoute,
      mobileAdminContract.privateAuth.sessionRoute,
      mobileAdminContract.privateRowsApi.route,
      mobileAdminContract.actionIntentApi.route,
      "/features/source-data",
      "/roadmap/source-data",
      "/admin/source-data",
      "/commerce/source-data",
      "/agent-docs/source-data",
    ],
    caveat:
      "This dashboard contract is public-safe and read-only. It gives mobile clients one live digest route and public-safe private-row counts, but it is not push notifications, production confirmed-write support, physical-device proof, App Store distribution, or Play Store distribution.",
    redaction: {
      privateBuyerDataIncluded: false,
      rawInboxBodiesIncluded: false,
      ownerEmailValuesIncluded: false,
      sessionIdentifiersIncluded: false,
      r2ObjectKeysIncluded: false,
      signedUrlsIncluded: false,
      uploadBodiesIncluded: false,
      secretValuesIncluded: false,
      writeTokensIncluded: false,
    },
    platformStatus: [
      {
        platform: "ios",
        issue: iosMobileAdminSourceData.issue,
        status: iosMobileAdminSourceData.status,
        sourceDataRoute: iosMobileAdminSourceData.sourceDataRoute,
        validationCommand: iosMobileAdminSourceData.validationCommand,
        smokeCommand: iosMobileAdminSourceData.smokeCommand,
        screenshotPath: iosMobileAdminSourceData.screenshotPath,
      },
      {
        platform: "android",
        issue: androidMobileAdminSourceData.issue,
        status: androidMobileAdminSourceData.status,
        sourceDataRoute: androidMobileAdminSourceData.sourceDataRoute,
        validationCommand: androidMobileAdminSourceData.validationCommand,
        smokeCommand: androidMobileAdminSourceData.smokeCommand,
        screenshotPath: androidMobileAdminSourceData.screenshotPath,
      },
    ],
    privateAuth: {
      id: mobileAdminContract.privateAuth.id,
      issue: mobileAdminContract.privateAuth.issue,
      status: mobileAdminContract.privateAuth.status,
      sessionRoute: mobileAdminContract.privateAuth.sessionRoute,
      loginRoute: mobileAdminContract.privateAuth.loginRoute,
      callbackSurface: mobileAdminContract.privateAuth.callbackSurface,
      acceptedRoles: mobileAdminContract.privateAuth.acceptedRoles,
      deniedStates: mobileAdminContract.privateAuth.deniedStates,
      redactionBoundary: mobileAdminContract.privateAuth.redactionBoundary,
      privateRowsIncluded: false,
      ownerEmailValuesIncluded: false,
      sessionIdentifiersIncluded: false,
    },
    privateRowsApi: {
      id: mobileAdminContract.privateRowsApi.id,
      issue: mobileAdminContract.privateRowsApi.issue,
      status: mobileAdminContract.privateRowsApi.status,
      route: mobileAdminContract.privateRowsApi.route,
      authBoundary: mobileAdminContract.privateRowsApi.authBoundary,
      readBoundary: mobileAdminContract.privateRowsApi.readBoundary,
      summarySource: privateRowsSummary.source,
      loadError: privateRowsSummary.loadError,
      counts: privateRowsSummary.counts,
      redaction: privateRowsSummary.redaction,
      latestRows: privateRowsSummary.latestRows.map((row) => ({
        id: row.id,
        rowKind: row.rowKind,
        sourceRoute: row.sourceRoute,
        sourceRecordId: row.sourceRecordId,
        priority: row.priority,
        readState: row.readState,
        requiresAction: row.requiresAction,
        privateFieldsAvailable: row.privateFieldsAvailable,
        createdAt: row.createdAt,
      })),
    },
    confirmedActions: mobileAdminContract.confirmedActions.map((action) => ({
      id: action.id,
      issue: action.issue,
      title: action.title,
      status: action.status,
      surface: action.surface,
      requiredInputs: action.requiredInputs,
      mutationBoundary: action.mutationBoundary,
    })),
    actionIntentApi: {
      id: mobileAdminContract.actionIntentApi.id,
      issue: mobileAdminContract.actionIntentApi.issue,
      status: mobileAdminContract.actionIntentApi.status,
      route: mobileAdminContract.actionIntentApi.route,
      authBoundary: mobileAdminContract.actionIntentApi.authBoundary,
      intentBoundary: mobileAdminContract.actionIntentApi.intentBoundary,
      summarySource: actionIntentSummary.source,
      loadError: actionIntentSummary.loadError,
      counts: actionIntentSummary.counts,
      redaction: actionIntentSummary.redaction,
      latestIntents: actionIntentSummary.latestIntents.map((intent) => ({
        id: intent.id,
        actionId: intent.actionId,
        sourceRoute: intent.sourceRoute,
        productionMutationCreated: intent.productionMutationCreated,
        billingMutationCreated: intent.billingMutationCreated,
        pushNotificationSent: intent.pushNotificationSent,
        distributionStateChanged: intent.distributionStateChanged,
        createdAt: intent.createdAt,
      })),
    },
    featureSummary: {
      updatedAt: featureCatalogUpdatedAt,
      total: featureCatalog.length,
      live: countByFeatureStatus("live"),
      launchPreview: countByFeatureStatus("launch-preview"),
      pending: countByFeatureStatus("pending"),
      mobileFeature: mobileFeature
        ? {
            id: mobileFeature.id,
            status: mobileFeature.status,
            issue: mobileFeature.issue,
            evidence: mobileFeature.evidence,
          }
        : null,
    },
    roadmapSummary: {
      updatedAt: roadmapUpdatedAt,
      counts: roadmapCounts(),
      mobileRoadmapItem: mobileRoadmapItem
        ? {
            id: mobileRoadmapItem.id,
            status: mobileRoadmapItem.status,
            issue: mobileRoadmapItem.issue,
            nextMilestone: mobileRoadmapItem.nextMilestone,
          }
        : null,
    },
    adminDigest: {
      source: adminData.source,
      loadError: adminData.loadError,
      roadmapCounts: adminRoadmapCounts(adminData.roadmapItems),
      counts: {
        roadmapItems: adminData.roadmapItems.length,
        workLogEntries: adminData.workLogEntries.length,
        userJourneys: adminData.userJourneys.length,
        openAttentionItems: adminData.attentionItems.filter((item) => item.state === "open").length,
      },
      recentWorkLogEntries: recentWorkLogEntries(adminData.workLogEntries),
      attentionItems: attentionSummaries(adminData.attentionItems),
    },
    commerceDigest: {
      sourceDataRoute: "/commerce/source-data",
      tableCount: commerceTables.length,
      liveTables: commerceTables.filter((table) => table.status === "live").map((table) => table.table),
      privateFieldsIncluded: false,
    },
    agentDigest: {
      sourceDataRoute: "/agent-docs/source-data",
      readContractCount: agentManifest.readContracts.length,
      sourceEvidenceRouteCount: agentManifest.sourceEvidenceRoutes.length,
      mcpPlanCount: agentManifest.mcpPlan.length,
      mobileReadContracts: agentManifest.readContracts
        .filter((contract) => contract.id.includes("mobile-admin"))
        .map((contract) => ({
          id: contract.id,
          route: contract.route,
          auth: contract.auth,
        })),
    },
    nextMobileMilestones: [
      "Add domain-specific confirmed-write APIs before mobile can approve billing-impacting, publishing, moderation, or creator-speech actions.",
      "Add physical-device proof for private mobile row inspection beyond simulator/emulator scaffolds.",
      "Add distribution and push-notification readiness after the read-only mobile surface stabilizes.",
    ],
    writeBoundary: mobileAdminContract.confirmedWriteRules,
  };
}
