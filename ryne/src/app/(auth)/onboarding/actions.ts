"use server";

import { FIRST_TIME_FLOW, type OnboardingStep } from "@/config/onboarding";
import { computeEtag, getCachedState, setCachedState, loadOnboardingSnapshot } from "@/lib/onboarding/state";

function get(ctx: any, path: string) {
  return path.split(".").reduce((o:any,k)=> (o ? o[k] : undefined), ctx);
}

function evaluate(flow: OnboardingStep[], snapshot: Record<string, any>) {
  let stepIndex = 0;
  while (stepIndex < flow.length) {
    const step = flow[stepIndex];
    for (const req of step.requirements) {
      const val = get(snapshot, req.key);
      if (req.required) {
        if (val === undefined || val === null) return { complete:false, nextStep:step.step };
        if (req.validator && !req.validator(val)) return { complete:false, nextStep:step.step };
      }
    }
    const nextKey = typeof step.next === "function" ? step.next(snapshot) : step.next;
    const idx = flow.findIndex(s => s.step === nextKey);
    if (idx === -1) return { complete:false, nextStep:step.step };
    if (nextKey === "done") return { complete: true };
    stepIndex = idx;
  }
  return { complete: false, nextStep: "account" };
}

export async function getOnboardingGate(userId: string, orgId?: string) {
  const cached = await getCachedState(userId, orgId ?? "-");
  if (cached?.complete) return cached;

  const snapshot = await loadOnboardingSnapshot(userId, orgId ?? "-");
  const result = evaluate(FIRST_TIME_FLOW, snapshot);
  const etag = computeEtag(snapshot);
  const state = { complete: result.complete, nextStep: result.nextStep, etag, updatedAt: Date.now() };
  await setCachedState(userId, orgId ?? "-", state);
  return state;
}
