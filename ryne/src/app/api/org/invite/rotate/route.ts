import { NextRequest, NextResponse } from "next/server";
import { generateJoinCode, buildInviteLink, generateInviteQrDataUrl } from "@/lib/org-invite";
import { db } from "@/lib/db-mock";

/**
 * POST /api/org/invite/rotate
 * body: { orgUid: string }
 * auth: owner/manager only (stubbed)
 */
export async function POST(req: NextRequest) {
  const { orgUid } = await req.json();
  if (!orgUid) return NextResponse.json({ error: "orgUid required" }, { status: 400 });

  const org = db.getOrg(orgUid);
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  // TODO: auth check: current user must be owner/manager of this org
  const newCode = generateJoinCode();
  db.updateOrg(orgUid, { joinCode: newCode });

  const baseUrl = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const inviteUrl = buildInviteLink(baseUrl, orgUid, newCode);
  const inviteQrDataUrl = await generateInviteQrDataUrl(inviteUrl);

  return NextResponse.json({ orgUid, joinCode: newCode, inviteUrl, inviteQrDataUrl });
}
