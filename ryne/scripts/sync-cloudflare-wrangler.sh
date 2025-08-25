# scripts/sync-cloudflare-wrangler.sh
#!/usr/bin/env bash
set -euo pipefail
# REQUIREMENTS:
# - wrangler CLI authenticated (wrangler login)
# - WRANGLER_ENV, CF_ACCOUNT_ID, CF_WORKER_NAME exported or in .env + `set -a; source .env; set +a`

WRANGLER_ENV="${WRANGLER_ENV:-production}"
CF_ACCOUNT_ID="${CF_ACCOUNT_ID:-}"
CF_WORKER_NAME="${CF_WORKER_NAME:-}"

if [[ -z "$CF_ACCOUNT_ID" || -z "$CF_WORKER_NAME" ]]; then
  echo "CF_ACCOUNT_ID and CF_WORKER_NAME must be set." >&2
  exit 1
fi

# Pull from .env and push to Worker secrets.
# Add/remove keys here if needed.
SECRET_KEYS=(
  "GEMINI_API_KEY"
  "FIREBASE_SERVICE_ACCOUNT_B64"
  "JWT_SECRET"
  "SESSION_SECRET"
  "NEXTAUTH_SECRET"
)

if [[ ! -f ".env" ]]; then
  echo ".env not found in repo root." >&2
  exit 1
fi

set -a
source .env
set +a

for key in "${SECRET_KEYS[@]}"; do
  val="${!key:-}"
  if [[ -z "$val" ]]; then
    echo "Skipping $key (empty)." >&2
    continue
  fi
  # Use stdin to avoid echoing secrets in terminal history
  printf "%s" "$val" | wrangler secret put "$key" \
    --name "$CF_WORKER_NAME" \
    --env "$WRANGLER_ENV" \
    --silent
  echo "Synced Cloudflare secret: $key"
done

echo "✅ Cloudflare secrets synced to $CF_WORKER_NAME ($WRANGLER_ENV)."
