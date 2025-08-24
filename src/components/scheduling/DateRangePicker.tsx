"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

type Props = {
  value?: DateRange | undefined;
  onChange?: (r: DateRange | undefined) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
};

const fmt = (d: Date) => format(d, "MMM d, yyyy");

export function DateRangePicker({
  value,
  onChange,
  label = "Select date range",
  minDate,
  maxDate,
  required
}: Props) {
  const [open, setOpen] = React.useState(false);

  const disabled = (date: Date) => {
    if (minDate && date < stripTime(minDate)) return true;
    if (maxDate && date > stripTime(maxDate)) return true;
    return false;
  };

  const summary = value?.from && value?.to
    ? `${fmt(value.from)} → ${fmt(value.to)}`
    : "Pick a date range";

  const presets = [
    { label: "This Week", get: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
    { label: "Last 7 Days", get: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
    { label: "Next 14 Days", get: () => ({ from: new Date(), to: subDays(new Date(), -13) }) },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}{required ? " *" : ""}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-between w-full">
            <span className="inline-flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {summary}
            </span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center gap-2 p-2 border-b flex-wrap">
            {presets.map(p => (
              <Button
                key={p.label}
                size="sm"
                variant="secondary"
                onClick={() => {
                  const next = p.get();
                  onChange?.(next);
                  setOpen(false);
                }}>
                {p.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={value}
            onSelect={(r) => onChange?.(r)}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
