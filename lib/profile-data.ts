import { Prisma } from "@prisma/client";

import type { ProfileFormValues, TailoredResumeValues } from "@/lib/validation/resume";

export const profileInclude = {
  socialLinks: {
    orderBy: { sortOrder: "asc" as const },
  },
  employment: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      workItems: {
        orderBy: { sortOrder: "asc" as const },
      },
      techStacks: {
        orderBy: { sortOrder: "asc" as const },
      },
    },
  },
  education: {
    orderBy: { sortOrder: "asc" as const },
  },
  skills: {
    orderBy: { sortOrder: "asc" as const },
  },
  tailoredVersions: {
    orderBy: { updatedAt: "desc" as const },
  },
} satisfies Prisma.ProfileInclude;

export type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: typeof profileInclude;
}>;

export function mapProfileToForm(profile: ProfileWithRelations): ProfileFormValues {
  return {
    fullName: profile.fullName,
    headline: profile.headline ?? "",
    email: profile.email,
    phone: profile.phone,
    address: profile.address,
    summary: profile.summary,
    socialLinks: profile.socialLinks.map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
    })),
    employment: profile.employment.map((employment) => ({
      id: employment.id,
      companyName: employment.companyName,
      period: employment.period,
      title: employment.title,
      logoUrl: employment.logoUrl ?? "",
      location: employment.location ?? "",
      website: employment.website ?? "",
      workItems: employment.workItems.map((item) => ({
        id: item.id,
        content: item.content,
      })),
      techStacks: employment.techStacks.map((stack) => ({
        id: stack.id,
        name: stack.name,
      })),
    })),
    education: profile.education.map((education) => ({
      id: education.id,
      universityName: education.universityName,
      period: education.period,
      degree: education.degree,
      summary: education.summary ?? "",
    })),
    skills: profile.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
    })),
  };
}

export function mapProfileToTailoredResume(profile: ProfileWithRelations): TailoredResumeValues {
  const profileValues = mapProfileToForm(profile);

  return {
    ...profileValues,
    label: "",
    resumeTitle: profile.headline || profile.employment[0]?.title || `${profile.fullName} Resume`,
  };
}

export function buildProfileWriteData(values: ProfileFormValues) {
  const socialLinks = values.socialLinks ?? [];
  const employment = values.employment ?? [];
  const education = values.education ?? [];
  const skills = values.skills ?? [];

  return {
    fullName: values.fullName,
    headline: values.headline || null,
    email: values.email,
    phone: values.phone,
    address: values.address,
    summary: values.summary,
    socialLinks: {
      create: socialLinks.map((link, index) => ({
        label: link.label,
        url: link.url,
        sortOrder: index,
      })),
    },
    employment: {
      create: employment.map((employment, index) => ({
        companyName: employment.companyName,
        period: employment.period,
        title: employment.title,
        logoUrl: employment.logoUrl || null,
        location: employment.location || null,
        website: employment.website || null,
        sortOrder: index,
        workItems: {
          create: (employment.workItems ?? []).map((item, itemIndex) => ({
            content: item.content,
            sortOrder: itemIndex,
          })),
        },
        techStacks: {
          create: (employment.techStacks ?? []).map((stack, stackIndex) => ({
            name: stack.name,
            sortOrder: stackIndex,
          })),
        },
      })),
    },
    education: {
      create: education.map((education, index) => ({
        universityName: education.universityName,
        period: education.period,
        degree: education.degree,
        summary: education.summary || null,
        sortOrder: index,
      })),
    },
    skills: {
      create: skills.map((skill, index) => ({
        name: skill.name,
        sortOrder: index,
      })),
    },
  } satisfies Prisma.ProfileCreateInput;
}

export function serializeTailoredResume(values: TailoredResumeValues) {
  return JSON.stringify(values);
}

export function parseTailoredResume(snapshotJson: string): TailoredResumeValues {
  return JSON.parse(snapshotJson) as TailoredResumeValues;
}
