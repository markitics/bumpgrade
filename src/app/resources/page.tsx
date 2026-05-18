import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Resources",
  description: "Bumpgrade resources, comparison guides, migration guides, and launch playbooks.",
};

export default function ResourcesPage() {
  return (
    <RouteShell
      eyebrow="Resources"
      title="Guides, comparisons, migrations, and launch notes."
      body="This section will hold comparison resources, migration guides, blog posts, and practical launch playbooks."
      issue="#20"
      icon={FileText}
      bullets={[
        "Comparison and migration content linked from `/compare`.",
        "Blog/resource posts for launch planning, pricing, offers, and funnel strategy.",
        "Public-safe notes that cite source evidence when making factual claims.",
        "Markdown and agent-readable mirrors for high-value resources.",
      ]}
    />
  );
}
