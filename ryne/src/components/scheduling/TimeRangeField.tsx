"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Props = {
  startLabel?: string;
  endLabel?: string;
  start?: string; // "09:00"
  end?: string;   // "17:00"
  onChange?: (v: { start: string; end: string }) => void;
  requireEndAfterStart?: boolean;
};

export function TimeRangeField({
  startLabel = "Start",
  endLabel = "End",
  start,
  end,
  onChange,
  requireEndAfterStart = true
}: Props) {
  const [s, setS] = React.useState(start ?? "");
  const [e, setE] = React.useState(end ?? "");
  const invalid = requireEndAfterStart && s && e && e <= s;

  React.useEffect(() => {
    onChange?.({ start: s, end: e });
  }, [s, e, onChange]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <Label>{startLabel}</Label>
        <Input type="time" value={s} onChange={(ev) => setS(ev.target.value)} />
      </div>
      <div>
        <Label>{endLabel}</Label>
        <Input type="time" value={e} onChange={(ev) => setE(ev.target.value)} className={invalid ? "border-destructive" : ""}/>
        {invalid && <p className="text-xs text-destructive mt-1">End must be after start.</p>}
      </div>
    </div>
  );
}

