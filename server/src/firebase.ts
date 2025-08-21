// server/src/firebase.ts
import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let app = getApps()[0];
if (!app) {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json && json.trim().length > 0) {
    app = initializeApp({ credential: cert(JSON.parse(json)) });
  } else {
    app = initializeApp({ credential: applicationDefault() });
  }
}

<<<<<<< Updated upstream
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
=======
// Export names your other files were importing:
export const auth = getAuth(app);        // <-- Admin Auth (was missing)
export const db = getFirestore(app);
export const storage = getStorage(app);
>>>>>>> Stashed changes
