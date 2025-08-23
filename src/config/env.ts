export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  onboardingDevMock: process.env.ONBOARDING_DEV_MOCK === "1",
};

export function isProduction() {
  return env.nodeEnv === "production";
}

export function useMockOnboarding() {
  // Never allow mock gating in production.
  return !isProduction() && env.onboardingDevMock;
}
