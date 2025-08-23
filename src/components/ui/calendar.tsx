"use client";

import * as React from "react";
import { DayPicker, DayPickerProps } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/lib/utils";

/**
 * Calendar: thin wrapper around react-day-picker with sane defaults.
 * - Keyboard accessible
 * - Locale-agnostic (provide via props.locale)
 * - Works for single, range, multiple
 */
export function Calendar({ className, ...props }: DayPickerProps) {
  return (
    <DayPicker
      className={cn("p-2 sm:p-3", className)}
      showOutsideDays
      weekStartsOn={0}
      {...props}
    />
  );
}
