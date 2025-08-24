// scripts/post-rotation-notes.cjs
console.log(`
Post-rotation rollout checklist:

1) Local dev:
   - Restart local servers to pick up the new .env
   - Validate: npm run dev (PWA), wrangler dev (Worker)

2) Cloudflare Worker:
   - If you synced secrets: wrangler deploy --env $WRANGLER_ENV
   - Smoke test your endpoint(s)

3) Firebase Admin SDK users (Functions/servers):
   - Redeploy services that read FIREBASE_SERVICE_ACCOUNT_B64
   - After confirming healthy, delete the OLD SA key:
     gcloud iam service-accounts keys list --iam-account $FIREBASE_SA_EMAIL
     gcloud iam service-accounts keys delete <OLD_KEY_ID> --iam-account $FIREBASE_SA_EMAIL

4) GitHub Actions:
   - If you synced secrets, trigger a workflow run (or push) to validate

5) Audit:
   - Commit .env.example changes if any (NEVER commit .env)
   - Run your secret scanner (e.g., gitleaks) to ensure nothing leaked
`);
