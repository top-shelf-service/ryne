// client/src/features/onboarding/OnboardingGate.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../lib/useAuth';
import { apiGet } from '../../lib/api';
import { Link, useNavigate } from 'react-router-dom';

type Me = { uid: string; email: string | null; orgs: Array<{ orgId: string; role: string }>; };

export default function OnboardingGate() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav('/signin');
      return;
    }
    apiGet<Me>('/me').then(setMe).catch(() => setMe({ uid: user.uid, email: user.email, orgs: [] }));
  }, [user, loading, nav]);

  if (loading || !user || !me) return <p>Loading…</p>;

  if (me.orgs.length > 0) {
    // already onboarded – go to dashboard
    nav('/dashboard');
    return null;
  }

  return (
    <div className="container">
      <h1>Welcome, let’s set up your workspace</h1>
      <div style={{ display:'flex', gap: 16 }}>
        <Link to="/onboarding/create">Create Organization</Link>
        <Link to="/onboarding/join">Join with Invite</Link>
      </div>
    </div>
  );
}
