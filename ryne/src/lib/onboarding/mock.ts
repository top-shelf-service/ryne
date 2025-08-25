// Optional dev mocks you can flip to quickly demo flows
export type MockScenario = "incomplete" | "complete";
let currentScenario: MockScenario = "incomplete";

export function setMockScenario(s: MockScenario) { currentScenario = s; }
export function getMockScenario(): MockScenario { return currentScenario; }

export function getMockSnapshot() {
  if (currentScenario === "complete") {
    return {
      user: { emailOrPhone: "jane@example.com", authMethod: "password", verified: true, role: "staff" },
      membership: { choice: "join", orgId: "bluebottle-7QZK3W", role: "staff" },
      org: { orgUid: "bluebottle-7QZK3W", legalName: "Blue Bottle", timezone: "America/Chicago", country: "US", joinCode: "ABCD2345" },
      i9: {
        section1: { completed: true, date: "2025-08-20" },
        section2: { completed: true, reviewer: "mgr_42", date: "2025-08-21" },
        docsUploaded: [{ type: "List A - Passport", fileUrl: "dev://passport.pdf", verified: true }],
        eVerify: { submitted: true, caseId: "EV-123456" },
        status: "verified"
      }
    };
  }
  return {
    user: { emailOrPhone: "jane@example.com", authMethod: "password", verified: true, role: "staff" },
    membership: { choice: "join", orgId: "bluebottle-7QZK3W", role: "staff" },
    org: { orgUid: "bluebottle-7QZK3W", legalName: "Blue Bottle", timezone: "America/Chicago", country: "US", joinCode: "ABCD2345" },
    i9: {
      section1: { completed: true, date: "2025-08-23" },
      section2: { completed: false, reviewer: null, date: null },
      docsUploaded: [],
      eVerify: { submitted: false, caseId: null },
      status: "pending"
    }
  };
}
