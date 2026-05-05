import { db } from "@/lib/db";
import { tailoringSettingsSchema, type TailoringSettingsValues } from "@/lib/validation/resume";

const GLOBAL_TAILORING_SETTINGS_ID = "global";

export const DEFAULT_TAILORING_SETTINGS: TailoringSettingsValues = {
  updateWorkItems: true,
  workItemUpdateMode: "replace",
  updateEmploymentTitles: true,
  updateSkills: true,
  updateSummary: true,
};

type PersistedTailoringSettings = {
  updateWorkItems?: unknown;
  workItemUpdateMode?: unknown;
  updateEmploymentTitles?: unknown;
  updateSkills?: unknown;
  updateSummary?: unknown;
};

function mapSettings(settings: PersistedTailoringSettings): TailoringSettingsValues {
  return tailoringSettingsSchema.parse({
    ...DEFAULT_TAILORING_SETTINGS,
    updateWorkItems: settings.updateWorkItems,
    workItemUpdateMode: settings.workItemUpdateMode,
    updateEmploymentTitles: settings.updateEmploymentTitles,
    updateSkills: settings.updateSkills,
    updateSummary: settings.updateSummary,
  });
}

export async function getTailoringSettings(): Promise<TailoringSettingsValues> {
  const settings = await db.tailoringSettings.findUnique({
    where: { id: GLOBAL_TAILORING_SETTINGS_ID },
  });

  if (!settings) {
    return DEFAULT_TAILORING_SETTINGS;
  }

  return mapSettings(settings);
}

export async function saveTailoringSettings(values: unknown): Promise<TailoringSettingsValues> {
  const parsedSettings = tailoringSettingsSchema.parse(values);

  const settings = await db.tailoringSettings.upsert({
    where: { id: GLOBAL_TAILORING_SETTINGS_ID },
    create: {
      id: GLOBAL_TAILORING_SETTINGS_ID,
      ...parsedSettings,
    },
    update: parsedSettings,
  });

  return mapSettings(settings);
}
