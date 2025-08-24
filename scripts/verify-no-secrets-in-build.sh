# scripts/verify-no-secrets-in-build.sh
#!/usr/bin/env bash
set -euo pipefail

BUILD_DIR="${1:-dist}"
if [[ ! -d "$BUILD_DIR" ]]; then
  echo "Build dir '$BUILD_DIR' not found. Run your build first." >&2
  exit 1
fi

echo "🧪 Verifying no secret values made it into $BUILD_DIR…"

REVEAL=0
check() {
  local name="$1" value="$2"
  [[ -z "$value" ]] && return 0
  if grep -RIl --binary-files=without-match -F "$value" "$BUILD_DIR" >/dev/null 2>&1; then
    echo "❌ Secret value for $name found in build output!"
    REVEAL=1
  else
    echo "✅ $name not present in build output."
  fi
}

set -a; source .env 2>/dev/null || true; set +a

check "FIREBASE_SERVICE_ACCOUNT_B64" "${FIREBASE_SERVICE_ACCOUNT_B64:-}"
check "GEMINI_API_KEY"               "${GEMINI_API_KEY:-}"
check "JWT_SECRET"                   "${JWT_SECRET:-}"
check "SESSION_SECRET"               "${SESSION_SECRET:-}"
check "NEXTAUTH_SECRET"              "${NEXTAUTH_SECRET:-}"

if [[ "$REVEAL" -eq 1 ]]; then
  echo "🚨 Remove any server secret imports from client code and rebuild."
  exit 2
fi

echo "🎉 No secret values detected in build artifacts."
