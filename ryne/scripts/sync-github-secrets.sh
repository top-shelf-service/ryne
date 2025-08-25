# scripts/sync-github-secrets.sh
#!/usr/bin/env bash
set -euo pipefail
# REQUIREMENTS:
# - gh CLI authenticated with repo write:settings scope (gh auth login)
# - GH_REPO set to owner/repo (e.g., top-shelf-service/ryne)

GH_REPO="${GH_REPO:-}"
if [[ -z "$GH_REPO" ]]; then
  echo "GH_REPO must be set (e.g., export GH_REPO=top-shelf-service/ryne)." >&2
  exit 1
fi

if [[ ! -f ".env" ]]; then
  echo ".env not found in repo root." >&2
  exit 1
fi

set -a
source .env
set +a

# Add/remove as desired
SECRET_KEYS=(
  "GEMINI_API_KEY"
  "FIREBASE_SERVICE_ACCOUNT_B64"
  "JWT_SECRET"
  "SESSION_SECRET"
  "NEXTAUTH_SECRET"
  "GCP_PROJECT_ID"
  "FIREBASE_SA_EMAIL"
  "CF_ACCOUNT_ID"
  "CF_WORKER_NAME"
)

for key in "${SECRET_KEYS[@]}"; do
  val="${!key:-}"
  if [[ -z "$val" ]]; then
    echo "Skipping $key (empty)."
    continue
  fi
  printf "%s" "$val" | gh secret set "$key" --repo "$GH_REPO" --app actions --body -
  echo "Synced GitHub secret: $key"
done

echo "✅ GitHub Actions secrets updated on $GH_REPO."
