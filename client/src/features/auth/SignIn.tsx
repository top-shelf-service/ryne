// client/src/features/auth/SignIn.tsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Link, useNavigate } from 'react-router-dom';

export default function SignIn() {
  const nav = useNavigate();
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [err, setErr] = useState<string | null>(null);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      nav('/onboarding');
    } catch (e: any) {
      setErr(e.message);
    }
  };
  return (
    <div className="container">
      <h1>Sign In</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Sign In</button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </form>
      <p>No account? <Link to="/signup">Sign up</Link></p>
    </div>
  );
}
