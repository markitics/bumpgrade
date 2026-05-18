import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { iosSlice, mobileAdminContractFixture } from "./mobileAdminFixture";

function Badge({ children }: { children: string }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}

export default function App() {
  const jobs = mobileAdminContractFixture.jobs.slice(0, 3);

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
