// scripts/test-local-secrets.cjs
require("dotenv").config();

function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

const names = [
  "GEMINI_API_KEY",
  "FIREBASE_SERVICE_ACCOUNT_B64",
  "JWT_SECRET",
  "SESSION_SECRET",
  "NEXTAUTH_SECRET",
];

console.log("Reading .env and verifying required keys exist...");
for (const n of names) {
  if (!process.env[n]) {
    console.error(`❌ ${n} is missing`);
    process.exit(1);
  }
  console.log(`✅ ${n} present (${process.env[n].length} chars)`);
}

// Decode SA to confirm valid JSON
try {
  const sa = JSON.parse(Buffer.from(must("FIREBASE_SERVICE_ACCOUNT_B64"), "base64").toString("utf8"));
  const fields = ["project_id", "client_email", "private_key_id"];
  console.log("Decoding FIREBASE_SERVICE_ACCOUNT_B64:");
  for (const f of fields) {
    console.log(`  - ${f}: ${sa[f] ? "OK" : "MISSING"}`);
  }
} catch (e) {
  console.error("❌ Failed to decode FIREBASE_SERVICE_ACCOUNT_B64 JSON", e.message);
  process.exit(1);
}

console.log("🎉 Local secret test passed.");
