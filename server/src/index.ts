// server/src/index.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './firebase.js';
import { verifyFirebaseToken } from './auth.js';
import { onboardingRouter } from './onboarding.js';

const app = express();
app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN?.split(',').map(s => s.trim()) ?? ['http://localhost:5173'];
app.use(cors({ origin: corsOrigin, credentials: true }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Who am I (org + role)
app.get('/api/me', verifyFirebaseToken, async (req: any, res) => {
  try {
    const uid = req.uid as string;
    const snap = await db.collection('users').doc(uid).get();
    if (!snap.exists) return res.status(404).json({ error: 'user_not_initialized' });
    const data = snap.data() || {};
    const { orgId = null, role = null, status = null, email = null } = data as any;
    return res.json({ uid, email, orgId, role, status });
  } catch (e) {
    console.error('me error', e);
    return res.status(500).json({ error: 'internal' });
  }
});

// Mount onboarding routes under /api
app.use('/api', onboardingRouter(verifyFirebaseToken));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`API listening on :${port}`));
