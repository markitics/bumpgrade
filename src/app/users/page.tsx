import type { Metadata } from "next";
import { Users } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Users",
  description: "Bumpgrade use cases for creators, coaches, course sellers, agencies, and small publishers.",
};

export default function UsersPage() {
  return (
    <RouteShell
      eyebrow="Users and use cases"
      title="Use cases for indiepreneurs who sell from an owned audience."
      body="This section will map Bumpgrade workflows to creator, coach, course seller, agency, newsletter, and small-publisher jobs."
      issue="#20"
      icon={Users}
      bullets={[
        "Creator and publisher personas with clear buyer goals.",
        "Use-case pages that connect public copy to features and roadmap state.",
        "Migration hooks for people leaving single-purpose tools.",
        "Agent-readable journey links for future assistants.",
      ]}
    />
  );
}
