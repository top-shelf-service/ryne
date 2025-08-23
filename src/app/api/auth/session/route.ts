import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { db } from "@/lib/db-mock";

/**
 * DEV-ONLY session creation:
 * - Generates a 'sid' cookie bound to a userId derived from email (hashed).
 * - Optionally starts onboarding at orgChoice for new accounts.
 * In production replace with real auth.
 */
export async function POST(req: NextRequest) {
  const { email, newAccount } = await req.json();
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const userId = crypto.createHash("sha256").update(String(email)).digest("hex").slice(0, 16);
  const sid = crypto.randomBytes(12).toString("hex");

  db.putSession(sid, { userId });

  // Seed minimal onboarding snapshot baseline for this user
  db.setOnboarding("-", userId, {
    user: { emailOrPhone: email, authMethod: "password", verified: true, role: "staff" },
    membership: { choice: newAccount ? null : "join", orgId: "-", role: "staff" }
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("sid", sid, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
