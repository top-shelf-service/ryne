# scripts/rotate-firebase-sa.sh
#!/usr/bin/env bash
set -euo pipefail

SA_EMAIL="${FIREBASE_SA_EMAIL:-}"
PROJECT_ID="${GCP_PROJECT_ID:-}"
OUT_JSON="${1:-./sa.new.json}"

if [[ -z "$SA_EMAIL" || -z "$PROJECT_ID" ]]; then
  echo "FIREBASE_SA_EMAIL and GCP_PROJECT_ID must be set (export in shell OR in .env + 'set -a; source .env; set +a')." >&2
  exit 1
fi

echo "Rotating service account key for: $SA_EMAIL (project: $PROJECT_ID)"
mkdir -p "$(dirname "$OUT_JSON")"

# Create new key
gcloud iam service-accounts keys create "$OUT_JSON" \
  --iam-account="$SA_EMAIL"

echo "Existing keys (delete old ones after rollout):"
gcloud iam service-accounts keys list --iam-account="$SA_EMAIL"

# Cross-platform base64 (Linux/macOS)
if base64 --help 2>/dev/null | grep -q "\-w"; then
  B64=$(base64 -w0 "$OUT_JSON")
else
  B64=$(base64 "$OUT_JSON" | tr -d '\n')
fi

cat <<EOF

✅ New key written: $OUT_JSON
🔑 Base64 to store as FIREBASE_SERVICE_ACCOUNT_B64:
$B64

After deploying with the new key, delete the old key(s):
  gcloud iam service-accounts keys delete <KEY_ID> --iam-account="$SA_EMAIL"
EOF
