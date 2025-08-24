"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

export default function OnboardingRouterPage() {
  const sp = useSearchParams();
  const step = sp.get("step") ?? "account";
  const router = useRouter();

  if (step === "orgChoice") {
    return (
      <div className="container max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader><CardTitle>Create or Join Organization</CardTitle></CardHeader>
          <CardContent className="flex gap-4">
            <Button
              className="flex-1"
              onClick={async () => {
                await fetch("/api/onboarding/choice", { method: "POST", body: JSON.stringify({ choice: "create" }) });
                router.push("/onboarding/route?step=orgCreateMinimal");
              }}
            >
              Create Organization
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={async () => {
                await fetch("/api/onboarding/choice", { method: "POST", body: JSON.stringify({ choice: "join" }) });
                router.push("/onboarding/route?step=orgJoin");
              }}
            >
              Join Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "orgCreateMinimal") {
    return <OrgCreateMinimal />;
  }

  if (step === "orgJoin") {
    return <OrgJoin />;
  }

  // TODO: render other steps: account, i9AndDocs, done
  return <div className="container p-6">Onboarding step: {step}</div>;
}

function OrgCreateMinimal() {
  const [legalName, setLegalName] = React.useState("");
  const [timezone, setTimezone] = React.useState("America/Chicago");
  const [country, setCountry] = React.useState("US");
  const [result, setResult] = React.useState<any>(null);

  return (
    <div className="container max-w-xl mx-auto p-6">
      <Card>
        <CardHeader><CardTitle>Create Organization</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <label className="text-sm font-medium">Legal Name</label>
          <Input value={legalName} onChange={e=>setLegalName(e.target.value)} placeholder="Blue Bottle Coffee - SoMa" />
          <label className="text-sm font-medium">Timezone</label>
          <Input value={timezone} onChange={e=>setTimezone(e.target.value)} placeholder="America/Chicago" />
          <label className="text-sm font-medium">Country</label>
          <Input value={country} onChange={e=>setCountry(e.target.value)} placeholder="US" />
          <div className="flex gap-2">
            <Button
              onClick={async () => {
                const res = await fetch("/api/org/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ legalName, timezone, country })
                });
                const data = await res.json();
                setResult(data);

                // In your real app, you'd persist:
                // org.orgUid, org.legalName, org.timezone, org.country, org.joinCode,
                // membership.choice="create", membership.orgId=data.orgUid, membership.role="owner"
              }}
            >
              Create
            </Button>
          </div>

          {result && (
            <div className="mt-4 space-y-2">
              <div className="text-sm">Org UID: <span className="font-mono">{result.orgUid}</span></div>
              <div className="text-sm">Join Code: <span className="font-mono">{result.joinCode}</span></div>
              <div className="text-sm break-all">Invite Link: <a className="underline" href={result.inviteUrl}>{result.inviteUrl}</a></div>
              {result.inviteQrDataUrl && (
                <div className="border rounded p-3 inline-block bg-white">
                  {/* Using next/image requires domain allowance for data URLs; plain img is fine here */}
                  {/* @ts-expect-error: next/image doesn't support data URLs without config */}
                  <img src={result.inviteQrDataUrl} alt="Invite QR" width={240} height={240} />
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(result.inviteUrl)}>Copy Link</Button>
                <Button onClick={() => location.assign("/onboarding/route?step=i9AndDocs")}>Continue to I-9</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrgJoin() {
  const [orgUid, setOrgUid] = React.useState("");
  const [joinCode, setJoinCode] = React.useState("");
  const [role, setRole] = React.useState<"staff"|"manager">("staff");
  const [message, setMessage] = React.useState<string>("");

  return (
    <div className="container max-w-xl mx-auto p-6">
      <Card>
        <CardHeader><CardTitle>Join Organization</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <label className="text-sm font-medium">Org UID</label>
          <Input value={orgUid} onChange={e=>setOrgUid(e.target.value)} placeholder="bluebottle-7QZK3W" />
          <label className="text-sm font-medium">Join Code</label>
          <Input value={joinCode} onChange={e=>setJoinCode(e.target.value)} placeholder="8-char code" />
          <label className="text-sm font-medium">Role</label>
          <select className="border rounded h-9 px-3" value={role} onChange={e=>setRole(e.target.value as any)}>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>
          <div className="flex gap-2">
            <Button
              onClick={async ()=>{
                const res = await fetch("/api/org/join", {
                  method: "POST",
                  headers: { "Content-Type":"application/json" },
                  body: JSON.stringify({ orgUid, joinCode, role })
                });
                const data = await res.json();
                if (res.ok) {
                  setMessage("Joined! Continue to I-9.");
                  // Persist membership.choice="join", membership.orgId=orgUid, membership.role=role
                } else {
                  setMessage(data.error || "Join failed");
                }
              }}
            >Join</Button>
            <Button variant="secondary" onClick={()=>location.assign("/onboarding/route?step=i9AndDocs")}>Continue to I-9</Button>
          </div>
          {message && <p className="text-sm mt-2">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
