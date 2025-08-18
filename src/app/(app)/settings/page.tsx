import { PageHeader } from "@/components/page-header";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your organization and account settings."
      />
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm h-[60vh]">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Settings page coming soon
          </h3>
          <p className="text-sm text-muted-foreground">
            You will be able to configure your organization details here.
          </p>
        </div>
      </div>
    </div>
  );
}
