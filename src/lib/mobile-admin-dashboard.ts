import { adminRoadmapCounts, getAdminSurfaceData, ownerSafeRequestText } from "@/lib/admin-surface-data";
import { agentManifest } from "@/lib/agent-manifest";
import { commerceTables } from "@/lib/commerce";
import { buildDirectorStatusData, shouldOpenDirectorWorkstreamByDefault } from "@/lib/director-status";
import { featureCatalog, featureCatalogUpdatedAt, type FeatureStatus } from "@/lib/feature-catalog";
import { getMobileAdminActionIntentSummary } from "@/lib/mobile-admin-actions";
import { getMobileAdminCommerceReviewSummary } from "@/lib/mobile-admin-commerce-reviews";
import { getMobileAdminDirectorReviewSummary } from "@/lib/mobile-admin-director-reviews";
import { getMobileAdminPrivateRowActionSummary } from "@/lib/mobile-admin-private-row-actions";
import { getMobileAdminPrivateRowsSummary } from "@/lib/mobile-admin-private-rows";
import { androidMobileAdminSourceData } from "@/lib/mobile-admin-android";
import { iosMobileAdminSourceData } from "@/lib/mobile-admin-ios";
import { mobileAdminContract, mobileAdminUpdatedAt } from "@/lib/mobile-admin";
import { roadmapCounts, roadmapItems, roadmapUpdatedAt } from "@/lib/roadmap";

export const mobileAdminDashboardIssue = 153;
export const mobileAdminDashboardRoute = "/mobile-admin/dashboard/source-data";
export const mobileAdminDashboardStatus = "live-public-mobile-dashboard-ready";

function publicSafeText(value: string) {
  return ownerSafeRequestText(value.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email-redacted]"));
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
  const director = buildDirectorStatusData(adminData);
  const actionIntentSummary = await getMobileAdminActionIntentSummary({ includeStaleStateTokens: false });
  const commerceReviewSummary = await getMobileAdminCommerceReviewSummary({ includeStaleStateTokens: false });
  const directorReviewSummary = await getMobileAdminDirectorReviewSummary({ includeStaleStateTokens: false });
  const privateRowsSummary = await getMobileAdminPrivateRowsSummary();
  const privateRowActionSummary = await getMobileAdminPrivateRowActionSummary();
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
      mobileAdminContract.privateRowActionsApi.route,
      mobileAdminContract.directorReviewApi.route,
      mobileAdminContract.commerceReviewApi.route,
      mobileAdminContract.actionIntentApi.route,
      "/features/source-data",
      "/roadmap/source-data",
      "/admin/source-data",
      "/admin/director/source-data",
      "/commerce/source-data",
      "/agent-docs/source-data",
    ],
    caveat:
      "This dashboard contract is public-safe. It gives mobile clients one live digest route, redacted Director workstream briefings, public-safe private-row counts, redacted low-risk private-row action summaries, redacted Director review summaries, redacted commerce review summaries, push-readiness blockers, and distribution-readiness blockers, but it is not live push notifications, high-risk billing or publishing confirmed-write support, physical-device proof, App Store distribution, or Play Store distribution.",
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
    privateRowActionsApi: {
      id: mobileAdminContract.privateRowActionsApi.id,
      issue: mobileAdminContract.privateRowActionsApi.issue,
      status: mobileAdminContract.privateRowActionsApi.status,
      route: mobileAdminContract.privateRowActionsApi.route,
      authBoundary: mobileAdminContract.privateRowActionsApi.authBoundary,
      actionBoundary: mobileAdminContract.privateRowActionsApi.actionBoundary,
      summarySource: privateRowActionSummary.source,
      loadError: privateRowActionSummary.loadError,
      counts: privateRowActionSummary.counts,
      redaction: privateRowActionSummary.redaction,
      latestActions: privateRowActionSummary.latestActions.map((action) => ({
        id: action.id,
        rowId: action.rowId,
        actionId: action.actionId,
        actionTitle: action.actionTitle,
        previousReadState: action.previousReadState,
        nextReadState: action.nextReadState,
        previousRequiresAction: action.previousRequiresAction,
        nextRequiresAction: action.nextRequiresAction,
        auditCorrelationId: action.auditCorrelationId,
        privateNoteRecorded: action.privateNoteRecorded,
        createdAt: action.createdAt,
      })),
    },
    directorReviewApi: {
      id: mobileAdminContract.directorReviewApi.id,
      issue: mobileAdminContract.directorReviewApi.issue,
      status: mobileAdminContract.directorReviewApi.status,
      route: mobileAdminContract.directorReviewApi.route,
      authBoundary: mobileAdminContract.directorReviewApi.authBoundary,
      reviewBoundary: mobileAdminContract.directorReviewApi.reviewBoundary,
      summarySource: directorReviewSummary.source,
      loadError: directorReviewSummary.loadError,
      counts: directorReviewSummary.counts,
      redaction: directorReviewSummary.redaction,
      latestReviews: directorReviewSummary.latestReviews.map((review) => ({
        id: review.id,
        workstreamId: review.workstreamId,
        workstreamTitle: review.workstreamTitle,
        workstreamStatus: review.workstreamStatus,
        auditCorrelationId: review.auditCorrelationId,
        reviewNoteRecorded: review.reviewNoteRecorded,
        productionAdminStateRecorded: review.productionAdminStateRecorded,
        billingMutationCreated: review.billingMutationCreated,
        pushNotificationSent: review.pushNotificationSent,
        distributionStateChanged: review.distributionStateChanged,
        publicAgentWriteCreated: review.publicAgentWriteCreated,
        createdAt: review.createdAt,
      })),
    },
    commerceReviewApi: {
      id: mobileAdminContract.commerceReviewApi.id,
      issue: mobileAdminContract.commerceReviewApi.issue,
      status: mobileAdminContract.commerceReviewApi.status,
      route: mobileAdminContract.commerceReviewApi.route,
      authBoundary: mobileAdminContract.commerceReviewApi.authBoundary,
      reviewBoundary: mobileAdminContract.commerceReviewApi.reviewBoundary,
      summarySource: commerceReviewSummary.source,
      loadError: commerceReviewSummary.loadError,
      counts: commerceReviewSummary.counts,
      redaction: commerceReviewSummary.redaction,
      latestReviews: commerceReviewSummary.latestReviews.map((review) => ({
        id: review.id,
        reviewTargetId: review.reviewTargetId,
        reviewTargetTitle: review.reviewTargetTitle,
        reviewTargetStatus: review.reviewTargetStatus,
        auditCorrelationId: review.auditCorrelationId,
        reviewNoteRecorded: review.reviewNoteRecorded,
        commerceStateRecorded: review.commerceStateRecorded,
        billingMutationCreated: review.billingMutationCreated,
        refundCreated: review.refundCreated,
        subscriptionChanged: review.subscriptionChanged,
        priceChanged: review.priceChanged,
        fulfillmentStateChanged: review.fulfillmentStateChanged,
        entitlementStateChanged: review.entitlementStateChanged,
        pushNotificationSent: review.pushNotificationSent,
        distributionStateChanged: review.distributionStateChanged,
        publicAgentWriteCreated: review.publicAgentWriteCreated,
        createdAt: review.createdAt,
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
    pushNotificationBoundary: {
      id: mobileAdminContract.pushNotificationBoundary.id,
      issue: mobileAdminContract.pushNotificationBoundary.issue,
      status: mobileAdminContract.pushNotificationBoundary.status,
      sendCapability: mobileAdminContract.pushNotificationBoundary.sendCapability,
      requiredProviders: mobileAdminContract.pushNotificationBoundary.requiredProviders.map((provider) => ({
        platform: provider.platform,
        provider: provider.provider,
        requiredEvidence: provider.requiredEvidence,
      })),
      blockedBy: mobileAdminContract.pushNotificationBoundary.blockedBy,
      redactionFlags: mobileAdminContract.pushNotificationBoundary.redactionFlags,
      publicSourceDataSummary: mobileAdminContract.pushNotificationBoundary.publicSourceDataSummary,
    },
    distributionReadiness: {
      id: mobileAdminContract.distributionReadiness.id,
      issue: mobileAdminContract.distributionReadiness.issue,
      status: mobileAdminContract.distributionReadiness.status,
      installableDistributionClaim: mobileAdminContract.distributionReadiness.installableDistributionClaim,
      platformEvidence: mobileAdminContract.distributionReadiness.platformEvidence.map((evidence) => ({
        platform: evidence.platform,
        currentEvidence: evidence.currentEvidence,
        requiredBeforeClaim: evidence.requiredBeforeClaim,
        blockedBy: evidence.blockedBy,
      })),
      readinessChecklist: mobileAdminContract.distributionReadiness.readinessChecklist,
      redactionFlags: mobileAdminContract.distributionReadiness.redactionFlags,
      publicSourceDataSummary: mobileAdminContract.distributionReadiness.publicSourceDataSummary,
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
    directorDigest: {
      sourceDataRoute: "/admin/director/source-data",
      source: director.source,
      loadError: director.loadError,
      totals: director.totals,
      windows: director.windows.map((window) => ({
        id: window.id,
        label: window.label,
        workLogEntries: window.workLogEntries,
        shippedPrs: window.shippedPrs,
        changedWorkstreams: window.changedWorkstreams,
        needsMark: window.needsMark,
        recentChanges: window.recentChanges.slice(0, 3).map((change) => ({
          id: change.id,
          title: publicSafeText(change.title),
          workstreamId: change.workstreamId,
          workstreamTitle: change.workstreamTitle,
          completedAt: change.completedAt,
        })),
      })),
      briefingControls: director.briefingControls.map((control) => ({
        id: control.id,
        label: control.label,
        title: publicSafeText(control.title),
        href: control.href,
        sourceRoute: control.sourceRoute,
        primaryMetric: control.primaryMetric,
        secondaryMetric: publicSafeText(control.secondaryMetric),
        workstreamIds: control.workstreamIds,
      })),
      executiveQueue: director.executiveQueue.map((lane) => ({
        id: lane.id,
        label: lane.label,
        itemCount: lane.items.length,
        items: lane.items.slice(0, 3).map((item) => ({
          id: item.id,
          title: publicSafeText(item.title),
          workstreamId: item.workstreamId,
          workstreamTitle: item.workstreamTitle,
          priority: item.priority,
          queueLabel: item.queueLabel,
        })),
      })),
      workstreams: director.workstreams.map((workstream) => ({
        id: workstream.id,
        title: workstream.title,
        status: workstream.status,
        currentFocus: publicSafeText(workstream.currentFocus),
        defaultOpen: shouldOpenDirectorWorkstreamByDefault(workstream),
        counts: {
          active: workstream.counts.active,
          pending: workstream.counts.pending,
          shipped: workstream.counts.shipped,
          blocked: workstream.counts.blocked,
          changedPastDay: workstream.counts.changedPastDay,
          changedPastWeek: workstream.counts.changedPastWeek,
          needsMark: workstream.counts.needsMark,
        },
        brief: {
          headline: publicSafeText(workstream.brief.headline),
          signals: workstream.brief.signals.map((signal) => ({
            id: signal.id,
            label: signal.label,
            state: signal.state,
            title: publicSafeText(signal.title),
            summary: publicSafeText(signal.summary),
            count: signal.count,
          })),
        },
      })),
      redaction: {
        privateRowsIncluded: false,
        ownerEmailValuesIncluded: false,
        rawAttentionBodiesIncluded: false,
        rawWorkLogBodiesIncluded: false,
        privateEvidenceIncluded: false,
      },
    },
    commerceDigest: {
      sourceDataRoute: "/commerce/source-data",
      tableCount: commerceTables.length,
      liveTables: commerceTables.filter((table) => table.status === "live").map((table) => table.table),
      reviewApiRoute: mobileAdminContract.commerceReviewApi.route,
      reviewedTargetCount: commerceReviewSummary.counts.reviewedTargets,
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
      "Add higher-risk domain-specific confirmed-write APIs before mobile can approve billing-impacting, fulfillment, publishing, moderation, or creator-speech actions.",
      "Add physical-device proof for private mobile row inspection beyond simulator/emulator foundations.",
      "Choose and configure private APNs/FCM provider credentials, device-token registration, send preflight, queue, delivery-result, and receipt contracts before any push sends.",
      "Record physical-device and App Store/TestFlight or Play Store/internal-testing evidence separately from simulator/emulator proof before claiming installable app readiness.",
    ],
    writeBoundary: mobileAdminContract.confirmedWriteRules,
  };
}
