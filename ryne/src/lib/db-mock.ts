/**
 * DEV-ONLY in-memory store to keep the example self-contained.
 * Replace with Firestore/Prisma in production.
 */

export type OrgRecord = {
  orgUid: string;
  legalName: string;
  timezone: string;
  country: string;
  joinCode: string;
  createdAt: number;
};

export type MembershipRecord = {
  userId: string;
  orgUid: string;
  role: "owner" | "manager" | "staff";
  createdAt: number;
};

export type OnboardingSnapshot = Record<string, any>;

const orgs = new Map<string, OrgRecord>();                            // orgUid -> org
const memberships = new Map<string, MembershipRecord>();              // `${orgUid}:${userId}` -> membership
const onboarding = new Map<string, OnboardingSnapshot>();             // `${orgUid}:${userId}` -> snapshot
const sessions = new Map<string, { userId: string; orgId?: string }>(); // sessionId -> session

export const db = {
  // ORG
  getOrg(orgUid: string) {
    return orgs.get(orgUid) || null;
  },
  putOrg(org: OrgRecord) {
    orgs.set(org.orgUid, org);
  },
  updateOrg(orgUid: string, patch: Partial<OrgRecord>) {
    const cur = orgs.get(orgUid);
    if (!cur) return false;
    orgs.set(orgUid, { ...cur, ...patch });
    return true;
  },

  // MEMBERSHIP
  putMembership(m: MembershipRecord) {
    memberships.set(`${m.orgUid}:${m.userId}`, m);
  },
  getMembership(orgUid: string, userId: string) {
    return memberships.get(`${orgUid}:${userId}`) || null;
  },

  // ONBOARDING SNAPSHOT
  getOnboarding(orgUid: string, userId: string) {
    return onboarding.get(`${orgUid}:${userId}`) || null;
  },
  setOnboarding(orgUid: string, userId: string, data: Partial<OnboardingSnapshot>) {
    const key = `${orgUid}:${userId}`;
    const cur = onboarding.get(key) || {};
    const merged = deepMerge(cur, data);
    onboarding.set(key, merged);
    return merged;
  },

  // SESSIONS (dev)
  putSession(sessionId: string, payload: { userId: string; orgId?: string }) {
    sessions.set(sessionId, payload);
  },
  getSession(sessionId: string) {
    return sessions.get(sessionId) || null;
  }
};

function deepMerge(a: any, b: any) {
  if (Array.isArray(a) && Array.isArray(b)) return b.slice();
  if (isObj(a) && isObj(b)) {
    const out: any = { ...a };
    for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
    return out;
  }
  return b === undefined ? a : b;
}

function isObj(x: any) {
  return x && typeof x === "object" && !Array.isArray(x);
}
