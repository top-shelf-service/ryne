"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = React.useState("");
  const router = useRouter();

  return (
    <div className="container max-w-sm mx-auto p-8">
      <h1 className="text-xl font-semibold mb-4">Create account</h1>
      <label className="text-sm font-medium">Email</label>
      <input className="border rounded w-full h-10 px-3 mb-3" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" />
      <button
        className="h-10 px-4 bg-black text-white rounded"
        onClick={async ()=>{
          const res = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type":"application/json" },
            body: JSON.stringify({ email, newAccount: true })
          });
          if (res.ok) location.assign("/onboarding/route?step=orgChoice");
        }}
      >Create account</button>
    </div>
  );
}
