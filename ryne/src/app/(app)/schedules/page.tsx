"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/scheduling/DatePicker";
import { DateRangePicker } from "@/components/scheduling/DateRangePicker";
import { WeekTemplatePicker } from "@/components/scheduling/WeekTemplatePicker";
import { ShiftCalendar, ShiftLite } from "@/components/scheduling/ShiftCalendar";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

export default function SchedulesPage() {
  // Single date (e.g., publish date)
  const [publishDate, setPublishDate] = React.useState<Date | null>(new Date());

  // Range (e.g., pay period / schedule window)
  const [windowRange, setWindowRange] = React.useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 13),
  });

  // Weekly template (recurring availability or base shift template)
  const [template, setTemplate] = React.useState<any>();

  // Shift calendar state
  const [selectedDates, setSelectedDates] = React.useState<Date[]>([]);
  const [month, setMonth] = React.useState<Date>(new Date());

  // Demo shifts for dots
  const demoShifts: ShiftLite[] = [
    { id: "1", date: toISO(addDays(new Date(), 1)), role: "Barista" },
    { id: "2", date: toISO(addDays(new Date(), 1)), role: "Cashier" },
    { id: "3", date: toISO(addDays(new Date(), 2)), role: "Cook" },
    { id: "4", date: toISO(addDays(new Date(), 5)), role: "Barista" },
  ];

  return (
    <>
      <PageHeader
        title="Schedules"
        description="Plan schedule windows, set weekly patterns, and select days to assign shifts."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Window</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DateRangePicker
              value={windowRange}
              onChange={setWindowRange}
              label="Scheduling Window"
              minDate={new Date(2020, 0, 1)}
              required
            />
            <DatePicker
              value={publishDate}
              onChange={setPublishDate}
              label="Publish Date"
              presets={[
                { label: "Today", getDate: () => new Date() },
                { label: "Tomorrow", getDate: () => addDays(new Date(), 1) },
              ]}
              required
            />
            <div className="flex gap-2">
              <Button onClick={() => console.log({ windowRange, publishDate })}>
                Save Window
              </Button>
              <Button variant="secondary" onClick={() => {
                setWindowRange(undefined);
                setPublishDate(null);
              }}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WeekTemplatePicker value={template} onChange={setTemplate} />
            <div className="flex gap-2">
              <Button onClick={() => console.log("Template saved:", template)}>Save Template</Button>
              <Button variant="secondary" onClick={() => setTemplate(undefined)}>Reset</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Shift Calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ShiftCalendar
              month={month}
              onMonthChange={setMonth}
              selected={selectedDates}
              onSelect={setSelectedDates}
              shifts={demoShifts}
              multiple
              disabled={(d) => windowRange?.from && windowRange?.to
                ? d < strip(windowRange.from) || d > strip(windowRange.to)
                : false
              }
            />
            <div className="flex gap-2">
              <Button onClick={() => console.log("Selected days", selectedDates)}>
                Assign Shifts to Selected Days
              </Button>
              <Button variant="secondary" onClick={() => setSelectedDates([])}>
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function toISO(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
function strip(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
