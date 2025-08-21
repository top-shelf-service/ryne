// client/src/features/onboarding/JoinOrg.tsx
import React, { useState } from 'react';
import { apiPost } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function JoinOrg() {
  const nav = useNavigate();
  const [token, setToken] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/invites/accept', { token });
      nav('/dashboard');
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <div className="container">
      <h2>Join Organization</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Invite token" value={token} onChange={e=>setToken(e.target.value)} />
        <button type="submit">Join</button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </form>
    </div>
  );
}
