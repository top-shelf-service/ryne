// server/src/auth.ts
import { NextFunction, Request, Response } from 'express';
import { auth as adminAuth } from './firebase.js';

export async function verifyFirebaseToken(req: Request & any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing Authorization: Bearer <token>' });

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.uid = decoded.uid;
    req.user = decoded; // includes .email, .email_verified if present
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}
