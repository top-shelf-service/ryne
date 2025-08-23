export type StepKey =
  | "account"
  | "orgChoice"
  | "orgCreateMinimal"
  | "orgJoin"
  | "i9AndDocs"
  | "done";

export type Requirement = {
  key: string;
  type: "boolean" | "string" | "number" | "array" | "object";
  required: boolean;
  validator?: (val: unknown) => boolean;
};

export type OnboardingStep = {
  step: StepKey;
  title: string;
  actor: "owner" | "manager" | "staff" | "any";
  requirements: Requirement[];
  next: StepKey | ((ctx: Record<string, any>) => StepKey);
};

export const FIRST_TIME_FLOW: OnboardingStep[] = [
  {
    step: "account",
    title: "Create Account",
    actor: "any",
    requirements: [
      { key: "user.emailOrPhone", type: "string", required: true },
      { key: "user.authMethod", type: "string", required: true },
      { key: "user.verified", type: "boolean", required: true }
    ],
    next: "orgChoice"
  },
  {
    step: "orgChoice",
    title: "Create or Join Organization",
    actor: "any",
    requirements: [
      { key: "membership.choice", type: "string", required: true } // "create" | "join"
    ],
    next: (ctx) => (ctx?.membership?.choice === "create" ? "orgCreateMinimal" : "orgJoin")
  },
  {
    step: "orgCreateMinimal",
    title: "Create Organization",
    actor: "owner",
    requirements: [
      { key: "org.orgUid", type: "string", required: true },
      { key: "org.legalName", type: "string", required: true },
      { key: "org.timezone", type: "string", required: true },
      { key: "org.country", type: "string", required: true },
      { key: "org.joinCode", type: "string", required: true },
      { key: "membership.orgId", type: "string", required: true },
      { key: "membership.role", type: "string", required: true }    // "owner"
    ],
    next: "i9AndDocs"
  },
  {
    step: "orgJoin",
    title: "Join Organization",
    actor: "manager",
    requirements: [
      { key: "orgJoin.mode", type: "string", required: true },      // "inviteCode" | "domain"
      { key: "orgJoin.token", type: "string", required: true },     // join code or proof
      { key: "membership.orgId", type: "string", required: true },
      { key: "membership.role", type: "string", required: true }    // "manager" | "staff"
    ],
    next: "i9AndDocs"
  },
  {
    step: "i9AndDocs",
    title: "I-9 & Job Documents (Hard Blocker)",
    actor: "any",
    requirements: [
      { key: "i9.section1.completed", type: "boolean", required: true },
      { key: "i9.section2.completed", type: "boolean", required: true },
      { key: "i9.docsUploaded", type: "array", required: true, validator: (v:any)=> Array.isArray(v) && v.length >= 1 },
      { key: "i9.status", type: "string", required: true, validator: (v:any)=> ["verified","review"].includes(v) }
    ],
    next: "done"
  },
  {
    step: "done",
    title: "Complete",
    actor: "any",
    requirements: [],
    next: "done"
  }
];
