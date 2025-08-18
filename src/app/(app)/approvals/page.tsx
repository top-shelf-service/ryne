import { PageHeader } from "@/components/page-header";

export default function ApprovalsPage() {
  return (
    <div>
      <PageHeader
        title="Approvals"
        description="Review and approve timesheets and requests."
      />
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[60vh]">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Approval workflows coming soon
          </h3>
          <p className="text-sm text-muted-foreground">
            You will be able to manage timesheet and time-off approvals here.
          </p>
        </div>
      </div>
    </div>
  );
}
