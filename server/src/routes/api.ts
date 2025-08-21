// server/src/routes/api.ts
import { Router } from 'express';
import { requireAuth, AuthedRequest } from '../auth.js';
import { db } from '../firebase.js';
import { orgs } from './orgs.js';

export const api = Router();

api.use('/orgs', orgs);

// Me + memberships summary
api.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.uid!;
  const userDoc = await db.collection('users').doc(uid).get();
  const user = userDoc.exists ? userDoc.data() : null;

  // Minimal membership scan (MVP)
  const orgsSnap = await db.collection('orgs').get();
  const memberships: Array<{ orgId: string; role: string }> = [];
  for (const doc of orgsSnap.docs) {
    const mem = await doc.ref.collection('members').doc(uid).get();
    if (mem.exists) memberships.push({ orgId: doc.id, role: (mem.data()?.role as string) ?? 'member' });
  }

  res.json({ uid, email: req.email, user, orgs: memberships });
});

// Accept invite
api.post('/invites/accept', requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.uid!;
  const { token } = req.body as { token: string };
  if (!token) return res.status(400).json({ error: 'token required' });

  const orgsSnap = await db.collection('orgs').get();
  for (const orgDoc of orgsSnap.docs) {
    const invDoc = await orgDoc.ref.collection('invites').doc(token).get();
    if (invDoc.exists) {
      const inv = invDoc.data()!;
      if (inv.usedBy) return res.status(400).json({ error: 'Invite already used' });
      const batch = db.batch();
      batch.set(orgDoc.ref.collection('members').doc(uid), { role: inv.role ?? 'member', joinedAt: new Date().toISOString() });
      batch.update(invDoc.ref, { usedBy: uid, usedAt: new Date().toISOString() });
      await batch.commit();
      return res.json({ orgId: orgDoc.id, role: inv.role ?? 'member' });
    }
  }
  res.status(404).json({ error: 'Invite not found' });
});
