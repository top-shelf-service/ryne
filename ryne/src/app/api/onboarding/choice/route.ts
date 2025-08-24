import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db-mock";

function getSid(req: NextRequest) { return req.cookies.get("sid")?.value || ""; }

export async function POST(req: NextRequest) {
  const sid = getSid(req);
  const sess = db.getSession(sid);
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { choice } = await req.json(); // "create" | "join"
  db.setOnboarding("-", sess.userId, { membership: { choice } });
  return NextResponse.json({ ok: true });
}
