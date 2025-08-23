import { NextRequest, NextResponse } from "next/server";
import { generateOrgUid, generateJoinCode, buildInviteLink, generateInviteQrDataUrl } from "@/lib/org-invite";
import { db } from "@/lib/db-mock";

function getSid(req: NextRequest) { return req.cookies.get("sid")?.value || ""; }

export async function POST(req: NextRequest) {
  const sid = getSid(req);
  const sess = db.getSession(sid);
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { legalName, timezone, country } = await req.json();
  if (!legalName || !timezone || !country) return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const orgUid = generateOrgUid(legalName);
  const joinCode = generateJoinCode();

  const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const inviteUrl = buildInviteLink(baseUrl, orgUid, joinCode);
  const inviteQrDataUrl = await generateInviteQrDataUrl(inviteUrl);

  db.putOrg({ orgUid, legalName, timezone, country, joinCode, createdAt: Date.now() });
  db.putMembership({ userId: sess.userId, orgUid, role: "owner", createdAt: Date.now() });

  // Seed onboarding snapshot for this user/org
  db.setOnboarding(orgUid, sess.userId, {
    user: { verified: true, authMethod: "password", role: "owner" },
    membership: { choice: "create", orgId: orgUid, role: "owner" },
    org: { orgUid, legalName, timezone, country, joinCode }
  });

  // Bind session to orgId for subsequent gate checks
  db.putSession(sid, { userId: sess.userId, orgId: orgUid });

  return NextResponse.json({ orgUid, joinCode, inviteUrl, inviteQrDataUrl });
}
