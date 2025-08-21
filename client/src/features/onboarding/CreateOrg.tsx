// client/src/features/onboarding/CreateOrg.tsx
import React, { useState } from 'react';
import { apiPost } from '../../lib/api';
import { useNavigate } from 'react-router-dom';

export default function CreateOrg() {
  const nav = useNavigate();
  const [name, setName] = useState('My Company');
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { orgId } = await apiPost<{ orgId: string }>('/orgs', { name });
      nav('/dashboard');
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <div className="container">
      <h2>Create Organization</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Organization name" value={name} onChange={e=>setName(e.target.value)} />
        <button type="submit">Create</button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </form>
    </div>
  );
}
