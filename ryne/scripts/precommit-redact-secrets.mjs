// scripts/precommit-redact-secrets.mjs
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import dotenv from "dotenv";
import { isText } from "istextorbinary";

// Load .env so we know the actual secret values to hunt for
dotenv.config();

// Known secret variables we will treat as authoritative
const SECRET_VAR_NAMES = [
  "FIREBASE_SERVICE_ACCOUNT_B64",
  "GEMINI_API_KEY",
  "JWT_SECRET",
  "SESSION_SECRET",
  "NEXTAUTH_SECRET",
];

// Extra patterns to catch obvious key material even if not in .env yet
const EXTRA_PATTERNS = [
  /-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/g, // PEM blocks
  /AIza[0-9A-Za-z\-_]{35}/g, // Firebase Web key (identifier; safe but we still redact if it ended up in server files)
];

// Do not scan these folders / file globs
const IGNORE_DIRS = [
  "node_modules",
  ".git",
  ".husky",
  "dist",
  "build",
  ".next",
  "out",
  "public",
];

// Only process text files smaller than:
const MAX_BYTES = 2 * 1024 * 1024;

function sh(cmd) {
  return execSync(cmd, { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" }).trim();
}

function getStagedFiles() {
  const out = sh('git diff --cached --name-only --diff-filter=ACMR');
  if (!out) return [];
  return out.split("\n").filter(Boolean).filter(p => {
    return !IGNORE_DIRS.some(d => p === d || p.startsWith(d + "/"));
  });
}

function sha12(s) {
  return crypto.createHash("sha256").update(s).digest("hex").slice(0, 12);
}

function escapeForRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function redactContent(content, filePath) {
  let changed = false;
  let updated = content;

  // 1) Replace exact values for known secrets (from .env)
  for (const name of SECRET_VAR_NAMES) {
    const val = process.env[name];
    if (!val) continue;
    if (typeof val !== "string" || val.length === 0) continue;
    const re = new RegExp(escapeForRegex(val), "g");
    if (re.test(updated)) {
      const tag = `[SECRET::${name}::SHA256:${sha12(val)}]`;
      updated = updated.replace(re, tag);
      changed = true;
    }
  }

  // 2) Extra patterns (PEM, obvious keys). Use generic redaction token.
  for (const pat of EXTRA_PATTERNS) {
    if (pat.test(updated)) {
      updated = updated.replace(pat, (m) => `[SECRET::PATTERN::SHA256:${sha12(m)}]`);
      changed = true;
    }
  }

  // 3) Service account JSON specific field cleanup if someone pasted raw JSON
  try {
    if (/\"private_key\"\s*:\s*\"/.test(updated)) {
      updated = updated.replace(
        /\"private_key\"\s*:\s*\"[^"]+\"/g,
        `"private_key":"[SECRET::FIREBASE_PRIVATE_KEY]"`
      );
      changed = true;
    }
  } catch (_) { /* noop */ }

  // Prevent accidental .env commit: if file looks like .env, nuke values
  if (path.basename(filePath).startsWith(".env")) {
    updated = updated.replace(/^[A-Z0-9_]+\s*=\s*.*/gm, (line) => {
      const [k] = line.split("=", 1);
      if (SECRET_VAR_NAMES.includes(k)) {
        return `${k}=[SECRET::ENV::${k}]`;
      }
      return line;
    });
    changed = updated !== content || changed;
  }

  return { changed, updated };
}

function isLikelyText(filePath, buf) {
  try {
    return isText(filePath, buf);
  } catch {
    // Fallback: treat as text if it has common text bytes ratio
    const slice = buf.subarray(0, 4096);
    const ascii = slice.toString("utf8");
    const nonBinary = /^[\s\S]*$/.test(ascii);
    return nonBinary;
  }
}

function main() {
  const files = getStagedFiles();
  if (!files.length) {
    console.log("precommit-redact: no staged files.");
    return;
  }

  let redactedCount = 0;
  for (const fp of files) {
    if (!fs.existsSync(fp)) continue;
    const stat = fs.statSync(fp);
    if (!stat.isFile() || stat.size > MAX_BYTES) continue;

    const buf = fs.readFileSync(fp);
    if (!isLikelyText(fp, buf)) continue;

    const original = buf.toString("utf8");
    const { changed, updated } = redactContent(original, fp);
    if (changed) {
      fs.writeFileSync(fp, updated);
      // re-stage modified file
      execSync(`git add -- "${fp.replace(/"/g, '\\"')}"`);
      console.log(`precommit-redact: redacted secrets in ${fp}`);
      redactedCount++;
    }
  }

  if (redactedCount === 0) {
    console.log("precommit-redact: no secrets found in staged files.");
  } else {
    console.log(`precommit-redact: ✅ redacted ${redactedCount} file(s).`);
  }
}

try {
  main();
} catch (e) {
  console.error("precommit-redact: error", e);
  // Do NOT block developer flow; allow commit to continue.
  // If you prefer strict mode, exit 1.
  process.exit(0);
}
