#!/usr/bin/env bash
set -euo pipefail

# ========== Settings ==========
BACKUP_ROOT="secrets/backups/$(date -u +%Y%m%dT%H%M%SZ)"
MANIFEST_TXT="$BACKUP_ROOT/manifest.sha256"
MANIFEST_JSON="$BACKUP_ROOT/manifest.json"
NUISANCE_REGEX='Name of Subreddit to watch: reddit\.com/r/'
# Limit scanning to repo-tracked files to avoid surprises
TRACKED_FILES="$(git ls-files | grep -Ev '^(node_modules/|dist/|build/|\.next/|out/|\.git/)$' || true)"

# ========== Helpers ==========
hash_file() {
  sha256sum "$1" | awk '{print $1}'
}

backup_file() {
  local src="$1"
  local dest="$BACKUP_ROOT/$src"
  mkdir -p "$(dirname "$dest")"
  # Preserve path, mode, and timestamps
  cp -p "$src" "$dest"
  local h
  h=$(hash_file "$src")
  printf "%s  %s\n" "$h" "$src" >> "$MANIFEST_TXT"
  # Append JSON entry
  printf '%s\n' "{\"path\":\"$src\",\"sha256\":\"$h\"}," >> "$MANIFEST_JSON.tmp"
}

redact_env_kv_inplace() {
  # KEY=VALUE -> KEY=<REDACTED_SHA256:hash>  (only for values length >=16)
  local f="$1" tmp
  tmp="$(mktemp)"
  awk '
    BEGIN { }
    /^[#[:space:]]*$/ { print; next }
    /^[A-Za-z_][A-Za-z0-9_]*\s*=/ {
      key=$1; sub(/\s*=.*/,"",key)
      val=$0; sub(/^[^=]*=\s*/,"",val)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", val)
      gsub(/^"|"$/, "", val)
      gsub(/^'\''|'\''$/, "", val)
      if (length(val) >= 16) {
        cmd="printf \"%s\" \"" val "\" | sha256sum"
        cmd | getline h
        close(cmd)
        split(h, parts, " "); h=parts[1]
        print key "=<REDACTED_SHA256:" h ">"
      } else {
        print
      }
      next
    }
    { print }
  ' "$f" > "$tmp" && mv "$tmp" "$f"
}

redact_json_inplace() {
  local f="$1" tmp
  tmp="$(mktemp)"
  # Redact common secret-ish fields (case-insensitive)
  perl -0777 -pe '
    sub hashit {
      use Digest::SHA qw(sha256_hex);
      return "<REDACTED_SHA256:" . sha256_hex($_[0]) . ">";
    }
    s/("(?i:(apiKey|apikey|token|accessToken|authToken|secret|clientSecret|password|privateKey|key))"\s*:\s*)"(.*?)"/$1 . "\"" . hashit($3) . "\""/ges;
  ' "$f" > "$tmp" && mv "$tmp" "$f"
}

remove_nuisance_lines() {
  local f="$1"
  sed -i "/$NUISANCE_REGEX/d" "$f"
}

# ========== Prepare ==========
mkdir -p "$BACKUP_ROOT"
: > "$MANIFEST_TXT"
echo '[' > "$MANIFEST_JSON.tmp" # we'll trim the trailing comma later

# Files we may modify
ENV_LIKE=$(echo "$TRACKED_FILES" | grep -E '\.env($|\.)' || true)
JSON_LIKE=$(echo "$TRACKED_FILES" | grep -E '\.json$' || true)
NUISANCE_HITS=$(grep -RIl --null -E "$NUISANCE_REGEX" -- $TRACKED_FILES | tr -d '\000' || true)

# Build a unique list to backup before any edits
CANDIDATES=$(printf "%s\n%s\n%s\n" "$ENV_LIKE" "$JSON_LIKE" "$NUISANCE_HITS" | sed '/^$/d' | sort -u || true)

echo "[sanitize] Backing up to $BACKUP_ROOT"
if [ -n "$CANDIDATES" ]; then
  while IFS= read -r f; do
    [ -f "$f" ] || continue
    backup_file "$f"
  done <<< "$CANDIDATES"
else
  echo "[sanitize] No candidate files found to backup."
fi

# Close JSON manifest properly
# remove last trailing comma if exists
if [ -s "$MANIFEST_JSON.tmp" ]; then
  sed '$ s/,$//' "$MANIFEST_JSON.tmp" > "$MANIFEST_JSON.body"
  echo ']' >> "$MANIFEST_JSON.body"
  mv "$MANIFEST_JSON.body" "$MANIFEST_JSON"
else
  echo ']' > "$MANIFEST_JSON"
fi
rm -f "$MANIFEST_JSON.tmp"

# Create a convenience tarball of this backup snapshot
tar -C secrets/backups -czf "secrets/latest-backup.tgz" "$(basename "$BACKUP_ROOT")"

echo "[sanitize] Backup completed. Manifest:"
echo " - $MANIFEST_TXT"
echo " - $MANIFEST_JSON"
echo " - tar: secrets/latest-backup.tgz"

# ========== Sanitize ==========
# 1) Remove nuisance line everywhere (tracked files only)
if [ -n "$NUISANCE_HITS" ]; then
  echo "[sanitize] Removing nuisance template lines…"
  while IFS= read -r f; do
    [ -f "$f" ] && remove_nuisance_lines "$f"
  done <<< "$NUISANCE_HITS"
fi

# 2) Redact ENV-like files
if [ -n "$ENV_LIKE" ]; then
  echo "[sanitize] Redacting ENV-like files…"
  while IFS= read -r f; do
    [ -f "$f" ] && redact_env_kv_inplace "$f"
  done <<< "$ENV_LIKE"
fi

# 3) Redact JSON-like files
if [ -n "$JSON_LIKE" ]; then
  echo "[sanitize] Redacting JSON-like files…"
  while IFS= read -r f; do
    [ -f "$f" ] && redact_json_inplace "$f"
  done <<< "$JSON_LIKE"
fi

echo "[sanitize] Done."
