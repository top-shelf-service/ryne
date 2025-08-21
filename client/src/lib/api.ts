// client/src/lib/api.ts
import { auth } from './firebase';

const BASE = '/api';

async function withAuthHeaders() {
  const u = auth.currentUser;
  const token = u ? await u.getIdToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await withAuthHeaders();
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = {
    ...(await withAuthHeaders()),
    'Content-Type': 'application/json'
  };
  const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
