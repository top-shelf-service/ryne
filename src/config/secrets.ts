// src/config/secrets.ts
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const SecretsSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY missing"),
  FIREBASE_SERVICE_ACCOUNT_B64: z.string().min(1, "FIREBASE_SERVICE_ACCOUNT_B64 missing"),
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  NEXTAUTH_SECRET: z.string().min(16),
  GCP_PROJECT_ID: z.string().optional(),
  FIREBASE_SA_EMAIL: z.string().optional(),
});

const parsed = SecretsSchema.safeParse(process.env);
if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
  throw new Error(`Secret validation failed: ${issues}`);
}

export const Secrets = parsed.data;

export function firebaseAdminCredential() {
  const json = Buffer.from(Secrets.FIREBASE_SERVICE_ACCOUNT_B64, "base64").toString("utf8");
  return JSON.parse(json);
}
