import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => value?.trim() || undefined)
  .pipe(z.string().url().optional());

const optionalString = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => value?.trim() || undefined);

export const socialLinkSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Add a platform name"),
  url: z.string().trim().url("Enter a valid social link"),
});

export const employmentItemSchema = z.object({
  id: z.string().optional(),
  content: z.string().trim().min(1, "Add a work item"),
});

export const techStackSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Add a tech stack item"),
});

export const employmentSchema = z.object({
  id: z.string().optional(),
  companyName: z.string().trim().min(1, "Company name is required"),
  period: z.string().trim().min(1, "Period is required"),
  title: z.string().trim().min(1, "Title is required"),
  logoUrl: optionalUrl,
  location: optionalString,
  website: optionalUrl,
  workItems: z.array(employmentItemSchema).min(1, "Add at least one work item"),
  techStacks: z.array(techStackSchema).default([]),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  universityName: z.string().trim().min(1, "University name is required"),
  period: z.string().trim().min(1, "Period is required"),
  degree: z.string().trim().min(1, "Degree is required"),
  summary: optionalString,
});

export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Skill is required"),
});

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  headline: optionalString,
  email: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(1, "Phone number is required"),
  address: z.string().trim().min(1, "Address is required"),
  summary: z.string().trim().min(1, "Summary is required"),
  socialLinks: z.array(socialLinkSchema).default([]),
  employment: z.array(employmentSchema).min(1, "Add at least one employment entry"),
  education: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).min(1, "Add at least one skill"),
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
      workItems: z.array(employmentItemSchema).min(1, "Add at least one work item"),
      techStacks: z.array(techStackSchema).default([]),
    }),
  ),
  skills: z.array(skillSchema).min(1, "Add at least one skill"),
});

export const generateTailoredResumeRequestSchema = z.object({
  currentResume: tailoredResumeSchema,
  targetRole: z.string().trim().min(1, "Target role is required"),
  jobDescription: z.string().trim().min(1, "Job description is required"),
  additionalInstructions: optionalString,
});

export type ProfileFormValues = z.input<typeof profileFormSchema>;
export type TailoredResumeValues = z.input<typeof tailoredResumeSchema>;
export type GeneratedTailoringValues = z.infer<typeof generatedTailoringSchema>;
export type GenerateTailoredResumeRequest = z.input<typeof generateTailoredResumeRequestSchema>;

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
