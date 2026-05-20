"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, LogOut } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import type { SessionAdminState } from "@/lib/admin-auth";

type AuthMode = "sign-in" | "sign-up";

type AuthPanelProps = {
  initialState: SessionAdminState;
  initialMode?: AuthMode;
  nextPath?: string;
};

function errorMessage(error: unknown) {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Authentication failed. Check the details and try again.";
}

export function AuthPanel({ initialState, initialMode = "sign-in", nextPath }: AuthPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = authClient.useSession();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const callbackURL = useMemo(() => {
    const raw = nextPath ?? searchParams.get("callbackURL") ?? searchParams.get("next");
    if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/admin/roadmap";
    return raw;
  }, [nextPath, searchParams]);
  const ctaLabel = mode === "sign-up" ? "Create account" : "Sign in";
  const signedInEmail = session.data?.user?.email ?? initialState.userEmail;
  const helperText = useMemo(() => {
    if (mode === "sign-up") return "Create a Bumpgrade publisher account with email and password.";
    return "Sign in with an existing Bumpgrade publisher account.";
  }, [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    const normalizedEmail = email.trim();
    const normalizedName = name.trim();
    setEmail(normalizedEmail);
    setName(normalizedName);

    const response =
      mode === "sign-up"
        ? await authClient.signUp.email({
            email: normalizedEmail,
            password,
            name: normalizedName || normalizedEmail,
            callbackURL,
          })
        : await authClient.signIn.email({
            email: normalizedEmail,
            password,
            callbackURL,
          });

    setIsSubmitting(false);

    if (response.error) {
      setFormError(errorMessage(response.error));
      return;
    }

    await session.refetch();
    router.push(callbackURL);
    router.refresh();
  }

  async function signOut() {
    setIsSubmitting(true);
    await authClient.signOut().catch(() => undefined);
    setIsSubmitting(false);
    await session.refetch();
    router.refresh();
  }

  return (
    <div className="auth-panel" data-testid="auth-panel">
      <div className="auth-card">
        <div className="auth-mode-toggle" role="group" aria-label="Authentication mode">
          <button type="button" aria-pressed={mode === "sign-in"} onClick={() => setMode("sign-in")}>
            Sign in
          </button>
          <button type="button" aria-pressed={mode === "sign-up"} onClick={() => setMode("sign-up")}>
            Sign up
          </button>
        </div>
        <form className="auth-form" onSubmit={submit} noValidate>
          <p>{helperText}</p>
          {mode === "sign-up" ? (
            <label>
              Name
              <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
          ) : null}
          <label>
            Email
            <input
              required
              autoComplete="email"
              inputMode="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={(event) => setEmail(event.currentTarget.value.trim())}
            />
          </label>
          <label>
            Password
            <input
              required
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {formError ? <p className="auth-message">{formError}</p> : null}
          <button className="primary-action auth-submit" type="submit" disabled={isSubmitting || session.isPending}>
            {isSubmitting ? <Loader2 aria-hidden="true" className="spin-icon" /> : null}
            {ctaLabel}
          </button>
        </form>
      </div>
      <aside className="auth-session-card">
        <CheckCircle2 aria-hidden="true" />
        <p className="eyebrow">Current session</p>
        <h2>{signedInEmail ? "Signed in" : "Signed out"}</h2>
        <p>
          {signedInEmail
            ? `${signedInEmail} is the active account in this browser.`
            : "Create an account or sign in to continue to protected Bumpgrade surfaces."}
        </p>
        {signedInEmail ? (
          <button className="secondary-action auth-signout" type="button" onClick={signOut} disabled={isSubmitting}>
            <LogOut aria-hidden="true" />
            Sign out
          </button>
        ) : null}
      </aside>
    </div>
  );
}
