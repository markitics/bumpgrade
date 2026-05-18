import type { Metadata } from "next";
import { Route } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Admin user journeys",
  description: "Bumpgrade user journey placeholder.",
};

export default function AdminUserJourneysPage() {
  return (
    <RouteShell
      eyebrow="Admin user journeys"
      title="Journeys connect product promises to testable paths."
      body="This route will connect main features to user goals, happy paths, edge cases, evidence, and agent access boundaries."
      issue="#8"
      icon={Route}
      bullets={[
        "One or more journeys per main feature.",
        "Roles for publishers, buyers, affiliates, admins, and agents.",
        "Happy paths and failure states that can drive Playwright checks.",
        "Evidence links to issues, PRs, screenshots, deployments, and work logs.",
      ]}
    />
  );
}
