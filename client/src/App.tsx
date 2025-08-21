// client/src/App.tsx
import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './lib/useAuth';
import SignIn from './features/auth/SignIn';
import SignUp from './features/auth/SignUp';
import OnboardingGate from './features/onboarding/OnboardingGate';
import CreateOrg from './features/onboarding/CreateOrg';
import JoinOrg from './features/onboarding/JoinOrg';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Loading…</p>;
  return user ? <>{children}</> : <Navigate to="/signin" replace />;
}

function Dashboard() {
  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p>You’re in. 🎉</p>
      <Link to="/onboarding">Onboarding</Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/onboarding" element={<RequireAuth><OnboardingGate /></RequireAuth>} />
      <Route path="/onboarding/create" element={<RequireAuth><CreateOrg /></RequireAuth>} />
      <Route path="/onboarding/join" element={<RequireAuth><JoinOrg /></RequireAuth>} />
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
