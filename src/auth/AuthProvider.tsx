// src/auth/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

type Ctx = { user: User | null; allowed: boolean; loading: boolean };
const AuthCtx = createContext<Ctx>({ user: null, allowed: false, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Allowlist rule: Firestore doc must exist at employees/{uid}
        try {
          const snap = await getDoc(doc(db, "employees", u.uid));
          setAllowed(snap.exists());
        } catch {
          setAllowed(false);
        }
      } else {
        setAllowed(false);
      }
      setLoading(false);
    });
  }, []);

  return <AuthCtx.Provider value={{ user, allowed, loading }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
