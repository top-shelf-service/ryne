"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";

type Props = {
  value?: Date | null;
  onChange?: (d: Date | null) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: (date: Date) => boolean; // e.g., holidays
  presets?: { label: string; getDate: () => Date }[];
  required?: boolean;
};

export function DatePicker({
  value,
  onChange,
  label = "Select date",
  minDate,
  maxDate,
  disabledDates,
  presets = [],
  required
}: Props) {
  const [open, setOpen] = React.useState(false);

  const disabled = (date: Date) => {
    if (minDate && date < stripTime(minDate)) return true;
    if (maxDate && date > stripTime(maxDate)) return true;
    if (disabledDates && disabledDates(date)) return true;
    return false;
  };

  const handleSelect = (d?: Date) => {
    onChange?.(d ?? null);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">{label}{required ? " *" : ""}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-between w-full">
            <span className="inline-flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {value ? format(value, "EEE, MMM d, yyyy") : "Pick a date"}
            </span>
            <ChevronDown className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {presets.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 border-b">
              {presets.map((p) => (
                <Button key={p.label} size="sm" variant="secondary" onClick={() => handleSelect(p.getDate())}>
                  {p.label}
                </Button>
              ))}
            </div>
          )}
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={handleSelect}
            disabled={disabled}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
