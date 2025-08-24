# docs/security/secrets-matrix.md
## Shyft / RYNE Secrets Exposure Matrix

| Variable                         | Purpose                                  | Public OK? | Why / Notes                                                                                       | Where it may live                                     |
|----------------------------------|------------------------------------------|------------|----------------------------------------------------------------------------------------------------|-------------------------------------------------------|
| **FIREBASE_SERVICE_ACCOUNT_B64** | Admin SDK private key (JSON, base64)     | **NO**     | Grants server‑side admin access to Firestore/Auth/Storage.                                         | .env (server), CF Worker secret, GitHub Actions secret |
| **GEMINI_API_KEY**               | Calls Gemini models via Google AI Studio | **NO**     | Billable API; key abuse → charges & quota drain.                                                   | .env (server), CF Worker secret, GitHub Actions secret |
| **JWT_SECRET**                   | Signs/verifies tokens                    | **NO**     | Leaks = token forgery / account takeover.                                                          | .env (server), CF Worker secret, GitHub Actions secret |
| **SESSION_SECRET**               | Session encryption/CSRF/nonce            | **NO**     | Leaks = session hijack/forgery.                                                                    | .env (server), CF Worker secret, GitHub Actions secret |
| **NEXTAUTH_SECRET**              | NextAuth crypto                          | **NO**     | Leaks = auth integrity loss.                                                                       | .env (server), GitHub Actions secret                  |
| **GCP_PROJECT_ID**               | GCP project wiring                       | Yes        | Not a credential; useful for debugging.                                                            | code, CI, .env                                        |
| **FIREBASE_SA_EMAIL**            | SA principal name                        | Yes        | Identity only; not a key.                                                                          | code, CI, .env                                        |
| **CF_ACCOUNT_ID**                | Cloudflare account id                    | Yes*       | Not a secret, but avoid printing unnecessarily (*low sensitivity*).                                 | code, CI, .env                                        |
| **CF_WORKER_NAME**               | Worker resource name                     | Yes        | Public by design.                                                                                  | code, CI, .env                                        |
| **Firebase Web config**          | Client SDK config (apiKey, projectId…)   | **Yes**    | Firebase client `apiKey` is an **identifier**, not a secret (documented by Firebase).              | client code                                           |

**Golden rule:** If the server reads it to prove identity or sign/encrypt, it’s a secret. If the browser needs it to merely talk to a public API endpoint or initialize the Firebase Web SDK, it’s fine to be public.
