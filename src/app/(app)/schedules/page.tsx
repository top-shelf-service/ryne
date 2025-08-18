'use client';

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SchedulesPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Staff';

  const createHrefWithRole = (href: string) => {
    return `${href}?role=${role}`;
  }

  return (
    <div>
      <PageHeader
        title="Schedules"
        description="Plan and view schedules for your team."
      >
        {role === 'Admin' && (
           <Button asChild>
             <Link href={createHrefWithRole("/schedule-assistant")}>AI Assistant</Link>
           </Button>
        )}
      </PageHeader>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[60vh]">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Schedule management coming soon
          </h3>
          <p className="text-sm text-muted-foreground">
            You will be able to create, assign, and publish shifts here.
          </p>
           {role === 'Staff' && (
            <p className="text-sm text-muted-foreground max-w-md mt-2">
              This page is currently read-only. You can view your schedule, but you cannot make changes. Please contact your manager for any schedule modifications.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
