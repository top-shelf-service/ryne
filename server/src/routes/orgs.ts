// server/src/routes/orgs.ts
import { Router } from 'express';
import { requireAuth, AuthedRequest } from '../auth.js';
import { db } from '../firebase.js';
import { randomBytes } from 'node:crypto';

export const orgs = Router();

// Create Organization
orgs.post('/', requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.uid!;
  const { name } = req.body as { name: string };
  if (!name) return res.status(400).json({ error: 'name required' });

  const orgRef = db.collection('orgs').doc();
  const batch = db.batch();
  batch.set(orgRef, { name, ownerId: uid, createdAt: new Date().toISOString() });
  batch.set(orgRef.collection('members').doc(uid), { role: 'owner', joinedAt: new Date().toISOString() });
  await batch.commit();

  res.status(201).json({ orgId: orgRef.id, name });
});

// Create invite for an org (MVP: any member)
orgs.post('/:orgId/invites', requireAuth, async (req: AuthedRequest, res) => {
  const uid = req.uid!;
  const { orgId } = req.params;

  const mem = await db.collection('orgs').doc(orgId).collection('members').doc(uid).get();
  if (!mem.exists) return res.status(403).json({ error: 'Not a member' });

  const token = randomBytes(16).toString('hex');
  await db.collection('orgs').doc(orgId).collection('invites').doc(token).set({
    createdBy: uid,
    createdAt: new Date().toISOString(),
    role: 'member',
    usedBy: null
  });

  res.status(201).json({ token });
});
