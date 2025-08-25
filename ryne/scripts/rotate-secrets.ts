// scripts/rotate-secrets.ts
import fs from "node:fs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import * as path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";
import { randBase64, randHex } from "./lib/crypto.js";
import { sh } from "./lib/shell.js";

/**
 * Master rotation script:
 * - Loads .env (if present)
 * - Generates new app secrets
 * - Optionally calls SA rotation shell (gcloud) and captures FIREBASE_SERVICE_ACCOUNT_B64
 * - Prompts once for a fresh Gemini API key (cannot be auto-generated)
 * - Writes a new .env (atomic rename)
 * - Optionally syncs to:
 *    - Cloudflare Worker secrets (wrangler)
 *    - GitHub Actions repo secrets (gh)
 */

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");
const BACKUP_PATH = path.join(ROOT, `.env.backup.${Date.now()}`);
const NEW_PATH = path.join(ROOT, `.env.new`);

dotenv.config({ path: ENV_PATH });

const EnvSchema = z.object({
  GCP_PROJECT_ID: z.string().nonempty().optional(),
  FIREBASE_SA_EMAIL: z.string().nonempty().optional(),
  FIREBASE_SERVICE_ACCOUNT_B64: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  CF_ACCOUNT_ID: z.string().optional(),
  CF_WORKER_NAME: z.string().optional(),
  WRANGLER_ENV: z.string().optional(),
  GH_REPO: z.string().optional(),
});

const existingEnv = EnvSchema.parse(process.env);

function writeEnv(file: string, map: Record<string, string | undefined>) {
  const lines: string[] = [];
  Object.entries(map).forEach(([k, v]) => {
    if (typeof v === "undefined") return;
    // Ensure single line
    const safe = v.replace(/\r?\n/g, "");
    lines.push(`${k}=${safe}`);
  });
  fs.writeFileSync(file, lines.join("\n") + "\n", { mode: 0o600 });
}

async function prompt(question: string, { mask = false } = {}) {
  const rl = readline.createInterface({ input, output });
  if (!mask) {
    const ans = await rl.question(question);
    rl.close();
    return ans.trim();
  }
  // rudimentary masking
  output.write(question);
  const chunks: string[] = [];
  const onData = (c: Buffer) => {
    const s = c.toString();
    if (s === "\n" || s === "\r" || s === "\u0004") {
      process.stdin.off("data", onData);
      output.write("\n");
      rl.close();
    } else {
      chunks.push(s);
    }
  };
  process.stdin.on("data", onData);
  await new Promise<void>((res) => rl.once("close", () => res()));
  return chunks.join("").trim();
}

function ensureBackup() {
  if (fs.existsSync(ENV_PATH)) {
    fs.copyFileSync(ENV_PATH, BACKUP_PATH);
    console.log(`🧯 Backed up existing .env -> ${BACKUP_PATH}`);
  }
}

async function rotateFirebaseServiceAccount(): Promise<string | undefined> {
  const want = (await prompt("Rotate Firebase service account key now? (y/N): ")).toLowerCase() === "y";
  if (!want) return existingEnv.FIREBASE_SERVICE_ACCOUNT_B64;

  if (!existingEnv.GCP_PROJECT_ID || !existingEnv.FIREBASE_SA_EMAIL) {
    console.log("Set GCP_PROJECT_ID and FIREBASE_SA_EMAIL in .env first, then re-run to rotate SA key.");
    return existingEnv.FIREBASE_SERVICE_ACCOUNT_B64;
  }

  // Delegates to the bash helper (writes ./sa.new.json, prints b64 in stdout instructions)
  sh(`bash scripts/rotate-firebase-sa.sh ./sa.new.json`);
  if (!fs.existsSync("./sa.new.json")) {
    console.warn("No sa.new.json produced; keeping existing FIREBASE_SERVICE_ACCOUNT_B64.");
    return existingEnv.FIREBASE_SERVICE_ACCOUNT_B64;
  }
  const b64 = fs.readFileSync("./sa.new.json", "utf8")
    ? Buffer.from(fs.readFileSync("./sa.new.json")).toString("base64")
    : undefined;

  return b64?.replace(/\r?\n/g, "");
}

async function getGeminiKey(): Promise<string> {
  const current = process.env.GEMINI_API_KEY?.trim();
  if (current) {
    const reuse = (await prompt("A GEMINI_API_KEY is present. Replace it? (y/N): ")).toLowerCase() === "y";
    if (!reuse) return current;
  }
  console.log("➡️  Open https://aistudio.google.com/app/apikey and create a NEW key for this project.");
  const key = await prompt("Paste the NEW Gemini API key: ", { mask: true });
  if (!key) throw new Error("Gemini API key required to proceed.");
  return key;
}

async function main() {
  console.log("🔒 Shyft Secret Rotation starting…");
  ensureBackup();

  // 1) Generate new app secrets
  const JWT_SECRET = randBase64(48);
  const SESSION_SECRET = randBase64(48);
  const NEXTAUTH_SECRET = randHex(32);

  // 2) Optional SA key rotation
  const FIREBASE_SERVICE_ACCOUNT_B64 = await rotateFirebaseServiceAccount();

  // 3) Gemini key (manual paste, then propagated)
  const GEMINI_API_KEY = await getGeminiKey();

  // 4) Compose new .env
  const merged = {
    // Project/platform wiring (keep existing if provided)
    GCP_PROJECT_ID: existingEnv.GCP_PROJECT_ID,
    FIREBASE_SA_EMAIL: existingEnv.FIREBASE_SA_EMAIL,

    // Rotated / newly generated values
    FIREBASE_SERVICE_ACCOUNT_B64,
    GEMINI_API_KEY,
    JWT_SECRET,
    SESSION_SECRET,
    NEXTAUTH_SECRET,

    // Cloudflare wiring (keep existing)
    CF_ACCOUNT_ID: existingEnv.CF_ACCOUNT_ID,
    CF_WORKER_NAME: existingEnv.CF_WORKER_NAME,
    WRANGLER_ENV: existingEnv.WRANGLER_ENV || "production",

    // GitHub wiring (keep existing)
    GH_REPO: existingEnv.GH_REPO,
  };

  writeEnv(NEW_PATH, merged);
  fs.renameSync(NEW_PATH, ENV_PATH);
  console.log("✅ Wrote new .env (atomic).");

  // 5) Sync destinations (optional prompts)
  if ((await prompt("Sync secrets to Cloudflare Worker now? (y/N): ")).toLowerCase() === "y") {
    sh("bash scripts/sync-cloudflare-wrangler.sh");
  }
  if ((await prompt("Sync secrets to GitHub Actions now? (y/N): ")).toLowerCase() === "y") {
    sh("bash scripts/sync-github-secrets.sh");
  }

  console.log("🎯 Rotation complete. Run `npm run postrotate` for rollout notes.");
}

main().catch((err) => {
  console.error("❌ Rotation failed:", err);
  process.exit(1);
});
