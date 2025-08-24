"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";

  return (
    <div className="container max-w-sm mx-auto p-8">
      <h1 className="text-xl font-semibold mb-4">Sign in</h1>
      <label className="text-sm font-medium">Email</label>
      <input className="border rounded w-full h-10 px-3 mb-3" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
      <button
        className="h-10 px-4 bg-black text-white rounded"
        onClick={async ()=>{
          // Dev-only faux auth: creates a session
          const res = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type":"application/json" },
            body: JSON.stringify({ email })
          });
          if (res.ok) router.push(next);
        }}
      >Continue</button>
      <p className="text-sm mt-4">
        New here? <a className="underline" href="/signup">Create account</a>
      </p>
    </div>
  );
}

