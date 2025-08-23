"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { TimeRangeField } from "./TimeRangeField";

type DayKey = "sun"|"mon"|"tue"|"wed"|"thu"|"fri"|"sat";
type DayConfig = { enabled: boolean; start?: string; end?: string };

type Props = {
  value?: Record<DayKey, DayConfig>;
  onChange?: (v: Record<DayKey, DayConfig>) => void;
  label?: string;
};

const DAYS: { key: DayKey; label: string }[] = [
  { key: "sun", label: "Sunday" },
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
];

const DEFAULT: Record<DayKey, DayConfig> = {
  sun: { enabled: false },
  mon: { enabled: true, start: "09:00", end: "17:00" },
  tue: { enabled: true, start: "09:00", end: "17:00" },
  wed: { enabled: true, start: "09:00", end: "17:00" },
  thu: { enabled: true, start: "09:00", end: "17:00" },
  fri: { enabled: true, start: "09:00", end: "17:00" },
  sat: { enabled: false },
};

export function WeekTemplatePicker({ value, onChange, label = "Weekly Template" }: Props) {
  const [state, setState] = React.useState<Record<DayKey, DayConfig>>(value ?? DEFAULT);

  React.useEffect(() => onChange?.(state), [state, onChange]);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">{label}</h4>
      <div className="grid gap-3">
        {DAYS.map((d) => {
          const day = state[d.key];
          return (
            <div key={d.key} className="rounded-md border p-3">
              <div className="flex items-center gap-3 mb-3">
                <Checkbox
                  id={`day-${d.key}`}
                  checked={!!day.enabled}
                  onCheckedChange={(val) =>
                    setState((prev) => ({ ...prev, [d.key]: { ...prev[d.key], enabled: !!val } }))
                  }
                />
                <Label htmlFor={`day-${d.key}`}>{d.label}</Label>
              </div>
              {day.enabled && (
                <TimeRangeField
                  start={day.start}
                  end={day.end}
                  onChange={(v) =>
                    setState((prev) => ({ ...prev, [d.key]: { ...prev[d.key], ...v } }))
                  }
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
