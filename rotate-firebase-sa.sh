# scripts/rotate-firebase-sa.sh
#!/usr/bin/env bash
set -euo pipefail

# REQUIREMENTS:
# - gcloud authenticated to the correct GCP project (gcloud auth login / gcloud config set project <id>)
# - You know the service account email used by Firebase Admin SDK (e.g., firebase-admin@<project>.iam.gserviceaccount.com)

SA_EMAIL="${FIREBASE_SA_EMAIL:-}"
PROJECT_ID="${GCP_PROJECT_ID:-}"
OUT_JSON="${1:-./sa.new.json}"

if [[ -z "$SA_EMAIL" || -z "$PROJECT_ID" ]]; then
  echo "FIREBASE_SA_EMAIL and GCP_PROJECT_ID must be exported in your shell (or in .env then 'source .env')." >&2
  exit 1
fi

echo "Rotating service account key for: $SA_EMAIL (project: $PROJECT_ID)"
mkdir -p "$(dirname "$OUT_JSON")"

# 1) Create a new key
gcloud iam service-accounts keys create "$OUT_JSON" \
  --iam-account="$SA_EMAIL"

# 2) Encode as base64 for easy storage in environment vars (no newlines)
B64=$(base64 -w0 "$OUT_JSON")

# 3) Optionally delete OLD keys (keep one key overlap window if desired)
# List existing keys:
echo "Existing keys:"
gcloud iam service-accounts keys list --iam-account="$SA_EMAIL"

cat <<EOF

✅ New key written to: $OUT_JSON
🔑 Base64 (export as FIREBASE_SERVICE_ACCOUNT_B64):
$B64

Next steps:
- Write FIREBASE_SERVICE_ACCOUNT_B64 into .env (or run the TypeScript rotate script to do it automatically).
- In Functions/servers, use this value to initialize Firebase Admin.
- After deploying with new key live, delete old key(s):
  gcloud iam service-accounts keys delete <KEY_ID> --iam-account="$SA_EMAIL"
EOF
