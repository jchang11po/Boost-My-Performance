"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TailoringSettingsValues } from "@/lib/validation/resume";

const settingOptions: Array<{
  description: string;
  key: keyof TailoringSettingsValues;
  label: string;
}> = [
  {
    key: "updateWorkItems",
    label: "Work items",
    description: "Allow OpenAI to rewrite the bullet list for each employment entry.",
  },
  {
    key: "updateEmploymentTitles",
    label: "Employment titles",
    description: "Allow OpenAI to update the role title for each employment entry.",
  },
  {
    key: "updateSkills",
    label: "Employment skills and skills section",
    description: "Allow OpenAI to update employment tech stacks and the main skills section.",
  },
  {
    key: "updateSummary",
    label: "Summary",
    description: "Allow OpenAI to rewrite the resume summary.",
  },
];

export function TailoringSettingsForm({
  initialSettings,
}: {
  initialSettings: TailoringSettingsValues;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveSettings() {
    setIsSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/settings/tailoring", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            error?: string;
            settings?: TailoringSettingsValues;
          }
        | null;

      if (!response.ok || !data?.settings) {
        throw new Error(data?.error || "Unable to save tailoring settings");
      }

      setSettings(data.settings);
      setMessage("Tailoring settings saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save tailoring settings");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tailored Resume Settings</CardTitle>
        <CardDescription>
          Choose which sections AI generation may update. These settings apply globally to every resume profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {error ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">{message}</p>
        ) : null}

        <div className="space-y-3">
          {settingOptions.map((option) => (
            <label
              key={option.key}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-accent/50"
            >
              <input
                checked={settings[option.key]}
                className="mt-1 size-4 accent-primary"
                type="checkbox"
                onChange={(event) =>
                  setSettings((currentSettings) => ({
                    ...currentSettings,
                    [option.key]: event.target.checked,
                  }))
                }
              />
              <span className="space-y-1">
                <span className="block font-medium">{option.label}</span>
                <span className="block text-sm text-muted-foreground">{option.description}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="flex justify-end">
          <Button disabled={isSaving} onClick={saveSettings}>
            {isSaving ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
