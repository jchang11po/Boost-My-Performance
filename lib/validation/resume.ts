import { z } from "zod";

const emailValidator = z.string().email();
const urlValidator = z.string().url();

const draftString = z.string().trim();

const optionalEmail = z.string().trim().refine((value) => value === "" || emailValidator.safeParse(value).success, {
  message: "Enter a valid email",
});

const draftUrl = z.string().trim().refine((value) => value === "" || urlValidator.safeParse(value).success, {
  message: "Enter a valid URL",
});

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => value?.trim() || undefined);

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  label: draftString,
  url: z.string().trim().refine((value) => value === "" || urlValidator.safeParse(value).success, {
    message: "Enter a valid social link",
  }),
});

export const employmentItemSchema = z.object({
  id: z.string().optional(),
  content: draftString,
});

export const techStackSchema = z.object({
  id: z.string().optional(),
  name: draftString,
});

export const employmentSchema = z.object({
  id: z.string().optional(),
  companyName: draftString,
  period: draftString,
  title: draftString,
  logoUrl: draftUrl,
  location: draftString,
  website: draftUrl,
  workItems: z.array(employmentItemSchema).default([]),
  techStacks: z.array(techStackSchema).default([]),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  universityName: draftString,
  period: draftString,
  degree: draftString,
  summary: draftString,
});

export const skillSchema = z.object({
  id: z.string().optional(),
  name: draftString,
});

const skillsArraySchema = z.array(skillSchema).superRefine((skills, ctx) => {
  const seenSkills = new Map<string, number>();

  skills.forEach((skill, index) => {
    const normalizedName = skill.name.trim().toLowerCase();

    if (!normalizedName) {
      return;
    }

    const firstSeenIndex = seenSkills.get(normalizedName);

    if (firstSeenIndex !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "This skill is duplicated",
        path: [index, "name"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "This skill is duplicated",
        path: [firstSeenIndex, "name"],
      });
      return;
    }

    seenSkills.set(normalizedName, index);
  });
});

const skillsSchema = skillsArraySchema.default([]);

export const profileFormSchema = z.object({
  fullName: draftString,
  headline: draftString,
  email: optionalEmail,
  phone: draftString,
  address: draftString,
  summary: draftString,
  socialLinks: z.array(socialLinkSchema).default([]),
  employment: z.array(employmentSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: skillsSchema,
});

export const tailoredResumeSchema = profileFormSchema.extend({
  label: optionalString,
  resumeTitle: z.string().trim().min(1, "Resume title is required"),
});

export const generatedTailoringSchema = z.object({
  resumeTitle: z.string().trim().min(1, "Resume title is required"),
  summary: z.string().trim().min(1, "Summary is required"),
  employment: z.array(
    z.object({
      title: z.string().trim().min(1, "Title is required"),
      workItems: z.array(employmentItemSchema).default([]),
      techStacks: z.array(techStackSchema).default([]),
    }),
  ),
  skills: skillsArraySchema.default([]),
});

export const generateTailoredResumeRequestSchema = z.object({
  currentResume: tailoredResumeSchema,
  targetRole: z.string().trim().min(1, "Target role is required"),
  jobDescription: z.string().trim().min(1, "Job description is required"),
  additionalInstructions: optionalString,
});

export const tailoringSettingsSchema = z.object({
  updateWorkItems: z.boolean().default(true),
  updateEmploymentTitles: z.boolean().default(true),
  updateSkills: z.boolean().default(true),
  updateSummary: z.boolean().default(true),
});

export type ProfileFormValues = z.input<typeof profileFormSchema>;
export type TailoredResumeValues = z.input<typeof tailoredResumeSchema>;
export type GeneratedTailoringValues = z.infer<typeof generatedTailoringSchema>;
export type GenerateTailoredResumeRequest = z.input<typeof generateTailoredResumeRequestSchema>;
export type TailoringSettingsValues = z.infer<typeof tailoringSettingsSchema>;

export function createEmptyProfile(): ProfileFormValues {
  return {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
    socialLinks: [],
    employment: [
      {
        companyName: "",
        period: "",
        title: "",
        logoUrl: "",
        location: "",
        website: "",
        workItems: [{ content: "" }],
        techStacks: [{ name: "" }],
      },
    ],
    education: [
      {
        universityName: "",
        period: "",
        degree: "",
        summary: "",
      },
    ],
    skills: [{ name: "" }],
  };
}
