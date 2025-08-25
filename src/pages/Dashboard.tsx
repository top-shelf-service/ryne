// src/pages/Dashboard.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

export default function Dashboard() {
  const { user, allowed } = useAuth();
  const nav = useNavigate();

  if (!user) {
    nav("/login");
    return null;
  }

  if (!allowed) {
    return (
      <main style={{ padding: 24 }}>
        <h2>Access pending</h2>
        <p>
          Your account exists, but you’re not approved yet.
          An admin must add you to the <code>employees</code> allowlist in Firestore.
        </p>
        <button onClick={() => signOut(auth)}>Sign out</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      <p>Welcome, {user.email}</p>
      <button onClick={() => signOut(auth)}>Sign out</button>
    </main>
  );
}

