# scripts/purge-secret-from-history.sh
#!/usr/bin/env bash
set -euo pipefail

if ! command -v git-filter-repo >/dev/null 2>&1; then
  echo "Install git-filter-repo first: https://github.com/newren/git-filter-repo" >&2
  exit 1
fi

SECRET_NAME="${1:-}"
if [[ -z "$SECRET_NAME" ]]; then
  echo "Usage: $0 SECRET_NAME" >&2
  echo "Example: $0 GEMINI_API_KEY" >&2
  exit 1
fi

echo "🚨 Purging $SECRET_NAME from git history…"
git filter-repo --invert-paths --path-glob "*$SECRET_NAME*" || true

echo "⚠️ Force-push required to rewrite remote history:"
echo "  git push --force --all"
echo "  git push --force --tags"
