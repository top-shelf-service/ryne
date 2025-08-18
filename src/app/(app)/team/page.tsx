import { PageHeader } from "@/components/page-header";

export default function TeamPage() {
  return (
    <div>
      <PageHeader
        title="Team Management"
        description="View and manage your staff members."
      />
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[60vh]">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Team management coming soon
          </h3>
          <p className="text-sm text-muted-foreground">
            You will be able to add, edit, and manage roles for your team here.
          </p>
        </div>
      </div>
    </div>
  );
}
