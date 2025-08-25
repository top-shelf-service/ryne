// src/App.tsx
import { Link } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";

export default function App() {
  const { user } = useAuth();
  return (
    <main style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <h1>Shyft (RYNE)</h1>
      <p>Vite + React + Firebase baseline is live.</p>
      <ul>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
      </ul>
      <p>Status: {user ? `Signed in as ${user.email}` : "Signed out"}</p>
    </main>
  );
}
