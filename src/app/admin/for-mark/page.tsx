import type { Metadata } from "next";
import { Mail } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "For Mark",
  description: "Bumpgrade owner attention surface placeholder.",
};

export default function ForMarkPage() {
  return (
    <RouteShell
      eyebrow="For Mark"
      title="Non-blocking attention items live here."
      body="This route will hold decisions, risks, blockers, and FYIs that Mark should see while agents keep working."
      issue="#8"
      icon={Mail}
      bullets={[
        "Blocked, review, and FYI categories.",
        "Required action, response instructions, links, source agent, and session context.",
        "Email escalation through `codex@bumpgrade.com` when configured.",
        "State changes for read, ok, and resolved items.",
      ]}
    />
  );
}
