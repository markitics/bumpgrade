"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

type DownloadTokenState =
  | { status: "idle"; message: string; downloadUrl: null }
  | { status: "loading"; message: string; downloadUrl: null }
  | { status: "ready"; message: string; downloadUrl: string }
  | { status: "error"; message: string; downloadUrl: null };

type DownloadTokenResponse = {
  ok?: boolean;
  downloadUrl?: string;
  expiresAt?: string;
  message?: string;
};

export function CustomerDownloadTokenButton({
  checkoutIntentId,
  entitlementId,
}: {
  checkoutIntentId: string;
  entitlementId: string;
}) {
  const [state, setState] = useState<DownloadTokenState>({
    status: "idle",
    message: "Create a short-lived private delivery token.",
    downloadUrl: null,
  });

  async function requestToken() {
    setState({ status: "loading", message: "Creating token...", downloadUrl: null });
    try {
      const response = await fetch("/api/products/download-tokens", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ checkoutIntentId, entitlementId }),
      });
      const payload = (await response.json()) as DownloadTokenResponse;
      if (!response.ok || !payload.ok || !payload.downloadUrl) {
        setState({ status: "error", message: payload.message ?? "Download token could not be created.", downloadUrl: null });
        return;
      }
      setState({
        status: "ready",
        message: payload.expiresAt ? `Token expires at ${payload.expiresAt}.` : "Token is ready.",
        downloadUrl: payload.downloadUrl,
      });
    } catch {
      setState({ status: "error", message: "Download token could not be created.", downloadUrl: null });
    }
  }

  return (
    <div className="download-token-panel">
      {state.downloadUrl ? (
        <a className="secondary-action" href={state.downloadUrl}>
          Download private file <Download aria-hidden="true" />
        </a>
      ) : (
        <button className="secondary-action" type="button" onClick={() => void requestToken()} disabled={state.status === "loading"}>
          {state.status === "loading" ? "Creating..." : "Create download token"}
          {state.status === "loading" ? <Loader2 aria-hidden="true" /> : <Download aria-hidden="true" />}
        </button>
      )}
      <p>{state.message}</p>
    </div>
  );
}
