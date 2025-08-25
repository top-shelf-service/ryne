// scripts/lib/shell.ts
import { execSync } from "node:child_process";

export function sh(cmd: string, opts: { silent?: boolean } = {}) {
  return execSync(cmd, {
    stdio: opts.silent ? "pipe" : "inherit",
    encoding: "utf8",
    env: process.env,
  }).toString().trim();
}
