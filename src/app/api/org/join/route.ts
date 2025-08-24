import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db-mock";

function getSid(req: NextRequest) { return req.cookies.get("sid")?.value || ""; }

export async function POST(req: NextRequest) {
  const sid = getSid(req);
  const sess = db.getSession(sid);
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { orgUid, joinCode, role = "staff" } = await req.json();
  if (!orgUid || !joinCode) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const org = db.getOrg(orgUid);
  if (!org) return NextResponse.json({ error: "org not found" }, { status: 404 });
  if (org.joinCode !== joinCode) return NextResponse.json({ error: "invalid join code" }, { status: 403 });

  db.putMembership({ userId: sess.userId, orgUid, role: role === "manager" ? "manager" : "staff", createdAt: Date.now() });

  db.setOnboarding(orgUid, sess.userId, {
    membership: { choice: "join", orgId: orgUid, role },
    org: { orgUid, legalName: org.legalName, timezone: org.timezone, country: org.country, joinCode: org.joinCode }
  });

  // bind session to org
  db.putSession(sid, { userId: sess.userId, orgId: orgUid });

  return NextResponse.json({ ok: true, orgUid, role });
}
