import { NextRequest, NextResponse } from "next/server";

import { getSessionAdminState } from "@/lib/admin-auth";
import {
  createDraftFunnelFromTemplate,
  getFunnelDraftD1OrThrow,
  seedEditableFunnelDraft,
} from "@/lib/funnel-drafts";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function wantsJson(request: NextRequest, formData: FormData) {
  return formValue(formData, "return") === "json" || (request.headers.get("accept") ?? "").includes("application/json");
}

function fallbackIdempotencyKey() {
  return `funnel-draft-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const json = wantsJson(request, formData);
  const adminState = await getSessionAdminState(request.headers);

  if (!adminState.identity) {
    if (json) {
      return NextResponse.json({ error: "Owner session required.", denialReason: adminState.denialReason }, { status: 401 });
    }

    const login = new URL("/login", request.url);
    login.searchParams.set("callbackURL", "/admin/funnels");
    return NextResponse.redirect(login, { status: 303 });
  }

  try {
    const db = await getFunnelDraftD1OrThrow();
    const mode = formValue(formData, "mode") || "create";
    const idempotencyKey = formValue(formData, "idempotencyKey") || fallbackIdempotencyKey();
    const draft =
      mode === "seed"
        ? await seedEditableFunnelDraft(db, adminState.identity, idempotencyKey)
        : await createDraftFunnelFromTemplate(db, adminState.identity, {
            title: formValue(formData, "title"),
            idempotencyKey,
          });

    if (json) {
      return NextResponse.json({ ok: true, mode, draft });
    }

    const redirect = new URL("/admin/funnels", request.url);
    redirect.searchParams.set("draft", draft.id);
    return NextResponse.redirect(redirect, { status: 303 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create draft funnel.";
    if (json) {
      return NextResponse.json({ error: message }, { status: 503 });
    }

    const redirect = new URL("/admin/funnels", request.url);
    redirect.searchParams.set("error", message);
    return NextResponse.redirect(redirect, { status: 303 });
  }
}
