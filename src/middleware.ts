import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getOnboardingGate } from "@/app/(auth)/onboarding/actions";
import { db } from "@/lib/db-mock";

/** DEV session reader: read 'sid' cookie -> memory session */
async function readSession(req: NextRequest) {
  const sid = req.cookies.get("sid")?.value;
  if (!sid) return null;
  const s = db.getSession(sid);
  if (!s) return null;
  return s;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes allowed
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/api/auth") ||     // allow session endpoints
    pathname.startsWith("/api/dev") ||      // dev mock control
    pathname.startsWith("/onboarding")
  ) {
    return NextResponse.next();
  }

  // Everything else is protected by auth + onboarding
  const session = await readSession(req);
  if (!session?.userId) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const gate = await getOnboardingGate(session.userId, session.orgId);
  if (!gate.complete) {
    const url = new URL("/onboarding/route", req.url);
    url.searchParams.set("step", gate.nextStep ?? "account");
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!favicon.ico|manifest.json).*)"]
};
