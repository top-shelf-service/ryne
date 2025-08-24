// scripts/lib/crypto.ts
import { randomBytes, createHash } from "node:crypto";

export function randBase64(bytes = 48) {
  return randomBytes(bytes).toString("base64url");
}

export function randHex(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export function deriveStableId(input: string) {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}
