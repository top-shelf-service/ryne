# scripts/scan-for-secrets.sh
#!/usr/bin/env bash
set -euo pipefail

ROOT="${1:-.}"
echo "🔍 Scanning repo and build outputs for leaked secrets…"

PATTERNS=(
  "FIREBASE_SERVICE_ACCOUNT_B64"
  "GEMINI_API_KEY"
  "JWT_SECRET"
  "SESSION_SECRET"
  "NEXTAUTH_SECRET"
)

# 1) Git history quick scan (recent commits)
echo "— Git history (last 200 commits)…"
git log -n 200 -p -- . 2>/dev/null | grep -E "$(IFS=\|; echo "${PATTERNS[*]}")" && \
  echo "❌ Found matches in history (rotate + purge)!" || echo "✅ No matches in last 200 commits."

# 2) Working tree & build outputs
echo "— Working tree & build dirs…"
TARGET_DIRS=("$ROOT" "dist" "build" ".next" "out" "public")
for d in "${TARGET_DIRS[@]}"; do
  if [[ -d "$d" ]]; then
    echo "  * $d"
    grep -RIn --exclude-dir=node_modules --binary-files=without-match \
      -E "$(IFS=\|; echo "${PATTERNS[*]}")" "$d" \
      && echo "❌ Found matches in $d" || echo "✅ Clean: $d"
  fi
done

echo "ℹ️  For deep scans, also run gitleaks via CI."
