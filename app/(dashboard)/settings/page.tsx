import { TailoringSettingsForm } from "@/components/settings/tailoring-settings-form";
import { getTailoringSettings } from "@/lib/tailoring-settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getTailoringSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Settings</p>
        <h1 className="text-3xl font-semibold tracking-tight">Generation settings</h1>
        <p className="text-muted-foreground">
          Control which parts of a tailored resume the AI generator is allowed to change.
        </p>
      </div>

      <TailoringSettingsForm initialSettings={settings} />
    </div>
  );
}
