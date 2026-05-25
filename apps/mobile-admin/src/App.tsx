import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { iosSlice, mobileAdminContractFixture } from "./mobileAdminFixture";

type LiveDashboardPayload = {
  issue: number;
  status: string;
  route: string;
  adminDigest?: {
    counts?: {
      roadmapItems?: number;
      workLogEntries?: number;
      userJourneys?: number;
      openAttentionItems?: number;
    };
  };
  directorDigest?: {
    totals?: {
      workstreams?: number;
      needsMark?: number;
      changedPastWeek?: number;
    };
    workstreams?: Array<{
      id: string;
      title: string;
      status: string;
      currentFocus: string;
      defaultOpen?: boolean;
      counts?: {
        active?: number;
        pending?: number;
        shipped?: number;
        blocked?: number;
        changedPastWeek?: number;
        needsMark?: number;
      };
      brief?: {
        headline?: string;
      };
    }>;
  };
  redaction?: Record<string, boolean>;
};

type DashboardPanel = {
  route: string;
  purpose: string;
  status: string;
  issue: number;
  sourceLabel: string;
  boundary: string;
  directorSummary: string;
  directorWorkstreams: string[];
};

type PrivateAuthContract = {
  id: string;
  issue: number;
  status: string;
  sessionRoute: string;
  loginRoute: string;
  callbackSurface: string;
  acceptedRoles: string[];
  deniedStates: string[];
  sessionSemantics: string;
  redactionBoundary: string;
};

type ConfirmedActionContract = {
  id: string;
  issue: number;
  title: string;
  status: string;
  surface: string;
  confirmationText: string;
  requiredInputs: string[];
  mutationBoundary: string;
};

type ActionIntentApiContract = {
  id: string;
  issue: number;
  status: string;
  route: string;
  authBoundary: string;
  purpose: string;
  intentBoundary: string;
  publicSourceDataSummary: string;
  requiredInputs: string[];
};

type PrivateRowsApiContract = {
  id: string;
  issue: number;
  status: string;
  route: string;
  authBoundary: string;
  purpose: string;
  readBoundary: string;
  publicSourceDataSummary: string;
};

type PrivateRowActionsApiContract = {
  id: string;
  issue: number;
  status: string;
  route: string;
  authBoundary: string;
  purpose: string;
  actionBoundary: string;
  requiredInputs: string[];
};

type DirectorReviewApiContract = {
  id: string;
  issue: number;
  status: string;
  route: string;
  authBoundary: string;
  purpose: string;
  reviewBoundary: string;
  requiredInputs: string[];
};

type CommerceReviewApiContract = {
  id: string;
  issue: number;
  status: string;
  route: string;
  authBoundary: string;
  purpose: string;
  reviewBoundary: string;
  requiredInputs: string[];
};

type PushNotificationBoundaryContract = {
  id: string;
  issue: number;
  status: string;
  sendCapability: string;
  purpose: string;
  requiredProviders: Array<{
    platform: "ios" | "android";
    provider: string;
    credentialBoundary: string;
    requiredEvidence: string[];
  }>;
  blockedBy: string[];
  redactionFlags: string[];
};

type DistributionReadinessContract = {
  id: string;
  issue: number;
  status: string;
  installableDistributionClaim: boolean;
  purpose: string;
  platformEvidence: Array<{
    platform: "ios" | "android";
    currentEvidence: string;
    requiredBeforeClaim: string[];
    blockedBy: string[];
  }>;
  redactionFlags: string[];
};

function Badge({ children }: { children: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}

function fixtureDashboardPanel(): DashboardPanel {
  const dashboard = mobileAdminContractFixture.liveDashboard;
  return {
    route: dashboard.route,
    purpose: dashboard.purpose,
    status: dashboard.status,
    issue: dashboard.issue,
    sourceLabel: "Fixture fallback",
    boundary: dashboard.redactionBoundary,
    directorSummary: "Director brief loads from /mobile-admin/dashboard/source-data.",
    directorWorkstreams: [
      "Marketing, Security / Trust, Mobile Admin, and other workstreams are grouped in the live Director digest.",
    ],
  };
}

function liveDashboardPanel(payload: LiveDashboardPayload): DashboardPanel {
  const counts = payload.adminDigest?.counts;
  const countSummary = counts
    ? `Roadmap ${counts.roadmapItems ?? 0}, work logs ${counts.workLogEntries ?? 0}, journeys ${counts.userJourneys ?? 0}, attention ${counts.openAttentionItems ?? 0}.`
    : "Live public-safe dashboard payload loaded.";
  const redactionValues = Object.values(payload.redaction ?? {});
  const redactionSummary =
    redactionValues.length > 0 && redactionValues.every((value) => value === false)
      ? `Redaction: ${redactionValues.length} private-data flags false.`
      : mobileAdminContractFixture.liveDashboard.redactionBoundary;
  const directorTotals = payload.directorDigest?.totals;
  const directorSummary = directorTotals
    ? `Director: ${directorTotals.workstreams ?? 0} workstreams, ${directorTotals.needsMark ?? 0} need Mark, ${directorTotals.changedPastWeek ?? 0} changed this week.`
    : "Director brief loaded without totals.";
  const directorWorkstreams =
    payload.directorDigest?.workstreams
      ?.slice(0, 5)
      .map((workstream) => {
        const changed = workstream.counts?.changedPastWeek ?? 0;
        const needsMark = workstream.counts?.needsMark ?? 0;
        const headline = workstream.brief?.headline ?? workstream.currentFocus;
        return `${workstream.title}: ${workstream.status}; ${changed} changed 7d; ${needsMark} need Mark. ${headline}`;
      }) ?? fixtureDashboardPanel().directorWorkstreams;
  return {
    route: payload.route,
    purpose: countSummary,
    status: payload.status,
    issue: payload.issue,
    sourceLabel: "Live network",
    boundary: redactionSummary,
    directorSummary,
    directorWorkstreams,
  };
}

export default function App() {
  const jobs = mobileAdminContractFixture.jobs.slice(0, 3);
  const privateAuth = mobileAdminContractFixture.privateAuth as PrivateAuthContract;
  const privateRowsApi = mobileAdminContractFixture.privateRowsApi as PrivateRowsApiContract;
  const privateRowActionsApi = mobileAdminContractFixture.privateRowActionsApi as PrivateRowActionsApiContract;
  const directorReviewApi = mobileAdminContractFixture.directorReviewApi as DirectorReviewApiContract;
  const commerceReviewApi = mobileAdminContractFixture.commerceReviewApi as CommerceReviewApiContract;
  const actionIntentApi = mobileAdminContractFixture.actionIntentApi as ActionIntentApiContract;
  const pushBoundary = mobileAdminContractFixture.pushNotificationBoundary as PushNotificationBoundaryContract;
  const distributionReadiness = mobileAdminContractFixture.distributionReadiness as DistributionReadinessContract;
  const iosPushProvider = pushBoundary.requiredProviders.find((provider) => provider.platform === "ios") ?? pushBoundary.requiredProviders[0];
  const iosDistributionEvidence =
    distributionReadiness.platformEvidence.find((evidence) => evidence.platform === "ios") ??
    distributionReadiness.platformEvidence[0];
  const confirmedActions = mobileAdminContractFixture.confirmedActions.slice(0, 3) as ConfirmedActionContract[];
  const [dashboard, setDashboard] = useState<DashboardPanel>(() => fixtureDashboardPanel());

  useEffect(() => {
    let cancelled = false;
    const url = `${mobileAdminContractFixture.publicBaseUrl}${mobileAdminContractFixture.liveDashboard.route}`;

    fetch(url)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Dashboard fetch returned ${response.status}`);
        return (await response.json()) as LiveDashboardPayload;
      })
      .then((payload) => {
        if (!cancelled) setDashboard(liveDashboardPanel(payload));
      })
      .catch(() => {
        if (!cancelled) setDashboard(fixtureDashboardPanel());
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Badge>{iosSlice?.status ?? "iOS scaffold"}</Badge>
          <Text style={styles.title}>Bumpgrade mobile admin</Text>
          <Text style={styles.lede}>
            The first iOS screen reads the checked-in fixture generated from /mobile-admin/source-data and keeps
            issue #{iosSlice?.issue ?? 67} read-only.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Source contract</Text>
          <Text style={styles.panelTitle}>{mobileAdminContractFixture.id}</Text>
          <Text style={styles.body}>
            Parent issue #{mobileAdminContractFixture.parentIssue}. Feature {mobileAdminContractFixture.featureId}.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Live dashboard</Text>
          <Text style={styles.panelTitle}>{dashboard.route}</Text>
          <Text style={styles.body}>{dashboard.purpose}</Text>
          <Text style={styles.meta}>
            Status: {dashboard.status} · issue #{dashboard.issue}
          </Text>
          <Text style={styles.meta}>Source: {dashboard.sourceLabel}</Text>
          <Text style={styles.meta}>Boundary: {dashboard.boundary}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Director brief</Text>
          <Text style={styles.panelTitle}>Workstreams</Text>
          <Text style={styles.body}>{dashboard.directorSummary}</Text>
          {dashboard.directorWorkstreams.map((line) => (
            <Text key={line} style={styles.meta}>
              {line}
            </Text>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Private auth</Text>
          <Text style={styles.panelTitle}>{privateAuth.status}</Text>
          <Text style={styles.body}>{privateAuth.sessionSemantics}</Text>
          <Text style={styles.meta}>Session: {privateAuth.sessionRoute}</Text>
          <Text style={styles.meta}>Login: {privateAuth.loginRoute} -> {privateAuth.callbackSurface}</Text>
          <Text style={styles.meta}>Roles: {privateAuth.acceptedRoles.join(", ")}</Text>
          <Text style={styles.meta}>Denied: {privateAuth.deniedStates.join(", ")}</Text>
          <Text style={styles.meta}>Boundary: {privateAuth.redactionBoundary}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Private rows API</Text>
          <Text style={styles.panelTitle}>{privateRowsApi.route}</Text>
          <Text style={styles.body}>{privateRowsApi.purpose}</Text>
          <Text style={styles.meta}>
            Status: {privateRowsApi.status} · issue #{privateRowsApi.issue}
          </Text>
          <Text style={styles.meta}>Auth: {privateRowsApi.authBoundary}</Text>
          <Text style={styles.meta}>Boundary: {privateRowsApi.readBoundary}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Private row actions API</Text>
          <Text style={styles.panelTitle}>{privateRowActionsApi.route}</Text>
          <Text style={styles.body}>{privateRowActionsApi.purpose}</Text>
          <Text style={styles.meta}>
            Status: {privateRowActionsApi.status} · issue #{privateRowActionsApi.issue}
          </Text>
          <Text style={styles.meta}>Auth: {privateRowActionsApi.authBoundary}</Text>
          <Text style={styles.meta}>Boundary: {privateRowActionsApi.actionBoundary}</Text>
          <Text style={styles.meta}>Inputs: {privateRowActionsApi.requiredInputs.join(", ")}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Director review API</Text>
          <Text style={styles.panelTitle}>{directorReviewApi.route}</Text>
          <Text style={styles.body}>{directorReviewApi.purpose}</Text>
          <Text style={styles.meta}>Status: {directorReviewApi.status} · issue #{directorReviewApi.issue}</Text>
          <Text style={styles.meta}>Auth: {directorReviewApi.authBoundary}</Text>
          <Text style={styles.meta}>Boundary: {directorReviewApi.reviewBoundary}</Text>
          <Text style={styles.meta}>Inputs: {directorReviewApi.requiredInputs.join(", ")}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Commerce review API</Text>
          <Text style={styles.panelTitle}>{commerceReviewApi.route}</Text>
          <Text style={styles.body}>{commerceReviewApi.purpose}</Text>
          <Text style={styles.meta}>Status: {commerceReviewApi.status} · issue #{commerceReviewApi.issue}</Text>
          <Text style={styles.meta}>Auth: {commerceReviewApi.authBoundary}</Text>
          <Text style={styles.meta}>Boundary: {commerceReviewApi.reviewBoundary}</Text>
          <Text style={styles.meta}>Inputs: {commerceReviewApi.requiredInputs.join(", ")}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Action intent API</Text>
          <Text style={styles.panelTitle}>{actionIntentApi.route}</Text>
          <Text style={styles.body}>{actionIntentApi.purpose}</Text>
          <Text style={styles.meta}>
            Status: {actionIntentApi.status} · issue #{actionIntentApi.issue}
          </Text>
          <Text style={styles.meta}>Auth: {actionIntentApi.authBoundary}</Text>
          <Text style={styles.meta}>Boundary: {actionIntentApi.intentBoundary}</Text>
          <Text style={styles.meta}>Inputs: {actionIntentApi.requiredInputs.join(", ")}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Push boundary</Text>
          <Text style={styles.panelTitle}>{pushBoundary.status}</Text>
          <Text style={styles.body}>{pushBoundary.purpose}</Text>
          <Text style={styles.meta}>Send: {pushBoundary.sendCapability}</Text>
          <Text style={styles.meta}>
            Provider: {iosPushProvider?.platform.toUpperCase()} {iosPushProvider?.provider}
          </Text>
          <Text style={styles.meta}>Needs: {iosPushProvider?.requiredEvidence.join(", ")}</Text>
          <Text style={styles.meta}>Blocked: {pushBoundary.blockedBy.join(", ")}</Text>
          <Text style={styles.meta}>Redaction: {pushBoundary.redactionFlags.join(", ")}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.kicker}>Distribution boundary</Text>
          <Text style={styles.panelTitle}>{distributionReadiness.status}</Text>
          <Text style={styles.body}>{distributionReadiness.purpose}</Text>
          <Text style={styles.meta}>
            Installable claim: {distributionReadiness.installableDistributionClaim ? "live" : "not live"}
          </Text>
          <Text style={styles.meta}>Evidence: {iosDistributionEvidence?.currentEvidence}</Text>
          <Text style={styles.meta}>Needs: {iosDistributionEvidence?.requiredBeforeClaim.join(", ")}</Text>
          <Text style={styles.meta}>Blocked: {iosDistributionEvidence?.blockedBy.join(", ")}</Text>
        </View>

        {jobs.map((job) => (
          <View key={job.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Badge>{job.firstScreen}</Badge>
            </View>
            <Text style={styles.cardTitle}>{job.title}</Text>
            <Text style={styles.body}>{job.goal}</Text>
            <Text style={styles.meta}>User: {job.primaryUser}</Text>
            <Text style={styles.meta}>Routes: {job.sourceRoutes.join(", ")}</Text>
            <Text style={styles.meta}>Boundary: {job.writeBoundary}</Text>
          </View>
        ))}

        <View style={styles.sectionHeader}>
          <Text style={styles.kicker}>Confirmed mobile actions</Text>
        </View>
        {confirmedActions.map((action) => (
          <View key={action.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Badge>{action.status}</Badge>
            </View>
            <Text style={styles.cardTitle}>{action.title}</Text>
            <Text style={styles.body}>{action.mutationBoundary}</Text>
            <Text style={styles.meta}>Surface: {action.surface}</Text>
            <Text style={styles.meta}>Confirmation: {action.confirmationText}</Text>
            <Text style={styles.meta}>Inputs: {action.requiredInputs.join(", ")}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: "#f5f7f2",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    gap: 12,
    paddingTop: 20,
  },
  title: {
    color: "#0c120f",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 42,
  },
  lede: {
    color: "#4f5b53",
    fontSize: 17,
    lineHeight: 25,
  },
  panel: {
    gap: 8,
    borderColor: "#d9ded6",
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#ffffff",
  },
  card: {
    gap: 10,
    borderColor: "#d9ded6",
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#ffffff",
  },
  cardTop: {
    flexDirection: "row",
  },
  sectionHeader: {
    paddingTop: 4,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#e9f0e5",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: "#254532",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  kicker: {
    color: "#756016",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  panelTitle: {
    color: "#0c120f",
    fontSize: 20,
    fontWeight: "800",
  },
  cardTitle: {
    color: "#0c120f",
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 27,
  },
  body: {
    color: "#4f5b53",
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: "#5d6846",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
});
