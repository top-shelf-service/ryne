import crypto from "node:crypto";

export type CompletionState = {
  complete: boolean;
  nextStep?: string;
  etag: string;
  updatedAt: number;
};

// Replace with Redis/memory cache in production
const memoryKV = new Map<string, CompletionState>();

export function cacheKey(userId: string, orgId: string) {
  return `onb:${orgId}:${userId}`;
}

export function computeEtag(snapshot: Record<string, any>) {
  const s = JSON.stringify(snapshot);
  return crypto.createHash("sha256").update(s).digest("hex").slice(0,16);
}

export async function getCachedState(userId: string, orgId: string): Promise<CompletionState | null> {
  const key = cacheKey(userId, orgId);
  const v = memoryKV.get(key);
  if (!v) return null;
  // 5-min TTL
  if (Date.now() - v.updatedAt > 5 * 60 * 1000) {
    memoryKV.delete(key);
    return null;
  }
  return v;
}

export async function setCachedState(userId: string, orgId: string, state: CompletionState) {
  memoryKV.set(cacheKey(userId, orgId), { ...state, updatedAt: Date.now() });
}

/**
 * Load the authoritative onboarding snapshot for evaluation.
 * TODO: Replace with Firestore reads. It must include keys referenced in FIRST_TIME_FLOW requirements.
 */
export async function loadOnboardingSnapshot(userId: string, orgId: string): Promise<Record<string, any>> {
  // Example skeleton:
  // const orgDoc = await db.doc(`organizations/${orgId}`).get();
  // const userDoc = await db.doc(`organizations/${orgId}/users/${userId}`).get();
  // return { ...orgDoc.data(), ...userDoc.data(), membership: {...}, ... };
  return {};
}
