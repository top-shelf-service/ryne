"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from "date-fns";

export type ShiftLite = {
  id: string;
  date: string;     // ISO YYYY-MM-DD
  role?: string;    // e.g., "FOH", "BOH", "Barista"
};

type Props = {
  month?: Date;
  onMonthChange?: (d: Date) => void;
  selected?: Date[];
  onSelect?: (dates: Date[]) => void;
  shifts?: ShiftLite[];           // used to render small dots
  disabled?: (d: Date) => boolean;
  multiple?: boolean;             // allow multi-date select
};

export function ShiftCalendar({
  month = new Date(),
  onMonthChange,
  selected = [],
  onSelect,
  shifts = [],
  disabled,
  multiple = true
}: Props) {
  const byDateIso = React.useMemo(() => {
    const map = new Map<string, ShiftLite[]>();
    for (const s of shifts) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return map;
  }, [shifts]);

  const renderDay = (day: Date) => {
    const iso = toISO(day);
    const hasShifts = byDateIso.has(iso);
    const isSelected = selected.some(d => isSameDay(d, day));

    return (
      <div className={`relative h-10 w-10 mx-auto rounded-md ${isSelected ? "bg-primary/10" : ""} flex items-center justify-center`}>
        <span className="text-sm">{day.getDate()}</span>
        {hasShifts && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 inline-flex gap-0.5">
            {(byDateIso.get(iso) ?? []).slice(0,3).map((_, i) => (
              <span key={i} className="h-1.5 w-1.5 rounded-full bg-primary" />
            ))}
          </span>
        )}
      </div>
    );
  };

  return (
    <Calendar
      mode={multiple ? "multiple" : "single"}
      month={month}
      onMonthChange={onMonthChange}
      selected={multiple ? selected : selected[0]}
      onSelect={(val: any) => {
        if (multiple) {
          onSelect?.((val as Date[]) ?? []);
        } else {
          onSelect?.(val ? [val as Date] : []);
        }
      }}
      disabled={disabled}
      components={{
        DayContent: ({ date }) => renderDay(date),
      }}
    />
  );
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
