import { toNextJsHandler } from "better-auth/next-js";

import { createAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function handlers() {
  return toNextJsHandler(createAuth());
}

function authUnavailable(error: unknown) {
  console.error("better auth request failed", error);

  return Response.json(
    {
      ok: false,
      error: "Bumpgrade authentication is not configured.",
    },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  try {
    return await handlers().GET(request);
  } catch (error) {
    return authUnavailable(error);
  }
}

export async function POST(request: Request) {
  try {
    return await handlers().POST(request);
  } catch (error) {
    return authUnavailable(error);
  }
}
