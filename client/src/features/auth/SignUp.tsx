// client/src/features/auth/SignUp.tsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const nav = useNavigate();
  const [displayName, setDisplayName] = useState('Demo User');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName });
      nav('/onboarding');
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <div className="container">
      <h1>Sign Up</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="Name" value={displayName} onChange={e=>setDisplayName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Create account</button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </form>
      <p>Have an account? <Link to="/signin">Sign in</Link></p>
    </div>
  );
}
