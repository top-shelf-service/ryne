// server/src/middleware/auth.ts
import type { Request, Response, NextFunction } from 'express';
import { auth } from '../firebase.js'; // ✅ now matches firebase.ts export

export interface AuthedRequest extends Request {
  uid?: string;
  email?: string | null;
}

export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const hdr = req.header('Authorization') ?? '';
    const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing Bearer token' });

    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    req.email = decoded.email ?? null;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
