// server/src/firebase.ts
import 'dotenv/config';                 // <— ensure .env is loaded even if this runs first
import admin from 'firebase-admin';

type ServiceAccount = Record<string, any>;

function loadServiceAccount(): ServiceAccount {
  // Prefer base64 (safer for quoting); fall back to raw JSON string
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (b64) {
    try {
      const json = Buffer.from(b64, 'base64').toString('utf8');
      return JSON.parse(json);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_B64 is set but invalid (base64 or JSON parse failed).');
    }
  }
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is set but not valid JSON.');
    }
  }
  throw new Error('Missing service account: set FIREBASE_SERVICE_ACCOUNT_B64 (preferred) or FIREBASE_SERVICE_ACCOUNT_JSON.');
}

let app: admin.app.App;
let auth: admin.auth.Auth;
let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;

// Skip Firebase initialization in CI environment
if (process.env.NODE_ENV === 'ci') {
  // Create mock exports for CI
  auth = {} as any;
  db = {} as any;
  storage = {} as any;
} else {
  if (!admin.apps.length) {
    const creds = loadServiceAccount();
    app = admin.initializeApp({
      credential: admin.credential.cert(creds),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
    });
  } else {
    app = admin.app();
  }

  auth = admin.auth(app);
  db = admin.firestore(app);
  storage = admin.storage(app);
}

export { auth, db, storage };
