import { PageHeader } from "@/components/page-header";

export default function SchedulesPage() {
  return (
    <div>
      <PageHeader
        title="Schedules"
        description="Plan and view schedules for your team."
      />
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[60vh]">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Schedule management coming soon
          </h3>
          <p className="text-sm text-muted-foreground">
            You will be able to create, assign, and publish shifts here.
          </p>
        </div>
      </div>
    </div>
  );
}
