import type { Metadata } from "next";
import { LogIn } from "lucide-react";

import { RouteShell } from "@/components/route-shell";

export const metadata: Metadata = {
  title: "Log in / sign up",
  description: "Bumpgrade publisher authentication placeholder before Better Auth wiring.",
};

export default function LoginPage() {
  return (
    <RouteShell
      eyebrow="Account access"
      title="Publisher login will land with the Better Auth slice."
      body="The navbar has a real route now. Authentication will be implemented with Better Auth, Cloudflare-compatible storage, and protected admin surfaces."
      issue="#9"
      icon={LogIn}
      bullets={[
        "Better Auth account/session foundation.",
        "Protected admin and publisher routes.",
        "Turnstile or equivalent abuse boundary where useful.",
        "Documented local and production secret requirements.",
      ]}
    />
  );
}
