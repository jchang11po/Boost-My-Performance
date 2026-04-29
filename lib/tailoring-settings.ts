import { db } from "@/lib/db";
import { tailoringSettingsSchema, type TailoringSettingsValues } from "@/lib/validation/resume";

const GLOBAL_TAILORING_SETTINGS_ID = "global";

export const DEFAULT_TAILORING_SETTINGS: TailoringSettingsValues = {
  updateWorkItems: true,
  updateEmploymentTitles: true,
  updateSkills: true,
  updateSummary: true,
};

function mapSettings(settings: TailoringSettingsValues): TailoringSettingsValues {
  return {
    updateWorkItems: settings.updateWorkItems,
    updateEmploymentTitles: settings.updateEmploymentTitles,
    updateSkills: settings.updateSkills,
    updateSummary: settings.updateSummary,
  };
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
