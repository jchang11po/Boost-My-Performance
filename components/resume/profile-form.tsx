"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEmptyProfile, type ProfileFormValues, profileFormSchema } from "@/lib/validation/resume";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}

function InputField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

type FormSectionKey = "basics" | "summary" | "socialLinks" | "employment" | "education" | "skills";

function SectionCard({
  children,
  description,
  headerAction,
  isOpen,
  onToggle,
  title,
}: {
  children: React.ReactNode;
  description: string;
  headerAction?: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-expanded={isOpen}
              aria-label={isOpen ? `Collapse ${title}` : `Expand ${title}`}
              onClick={onToggle}
            >
              <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </Button>
          </div>
          {headerAction ? <div className="flex items-center gap-2">{headerAction}</div> : null}
        </div>
      </CardHeader>
      {isOpen ? <CardContent>{children}</CardContent> : null}
    </Card>
  );
}

function EmploymentSection({
  control,
  errors,
  index,
  register,
  remove,
}: {
  control: Control<ProfileFormValues>;
  errors: FieldErrors<ProfileFormValues>;
  index: number;
  register: UseFormRegister<ProfileFormValues>;
  remove: (index: number) => void;
}) {
  const workItems = useFieldArray({
    control,
    name: `employment.${index}.workItems`,
  });

  const techStacks = useFieldArray({
    control,
    name: `employment.${index}.techStacks`,
  });

  const sectionErrors = errors.employment?.[index];
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={isOpen}
            aria-label={isOpen ? `Collapse employment ${index + 1}` : `Expand employment ${index + 1}`}
            onClick={() => setIsOpen((current) => !current)}
          >
            <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
          <h3 className="font-medium">Employment #{index + 1}</h3>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={() => remove(index)}>
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>
      {isOpen ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <InputField id={`company-${index}`} label="Company name" error={sectionErrors?.companyName?.message}>
              <Input id={`company-${index}`} {...register(`employment.${index}.companyName`)} />
            </InputField>
            <InputField id={`period-${index}`} label="Period" error={sectionErrors?.period?.message}>
              <Input id={`period-${index}`} placeholder="2022 - Present" {...register(`employment.${index}.period`)} />
            </InputField>
            <InputField id={`title-${index}`} label="Title" error={sectionErrors?.title?.message}>
              <Input id={`title-${index}`} {...register(`employment.${index}.title`)} />
            </InputField>
            <InputField id={`location-${index}`} label="Company location" error={sectionErrors?.location?.message}>
              <Input id={`location-${index}`} {...register(`employment.${index}.location`)} />
            </InputField>
            <InputField id={`logo-${index}`} label="Company logo URL" error={sectionErrors?.logoUrl?.message}>
              <Input id={`logo-${index}`} placeholder="https://..." {...register(`employment.${index}.logoUrl`)} />
            </InputField>
            <InputField id={`website-${index}`} label="Company website" error={sectionErrors?.website?.message}>
              <Input id={`website-${index}`} placeholder="https://..." {...register(`employment.${index}.website`)} />
            </InputField>
          </div>

          <div className="space-y-3">
            <Label>Work items</Label>
            {workItems.fields.map((field, workIndex) => (
              <div key={field.id} className="space-y-2 rounded-lg border border-border p-3">
                <div className="flex justify-end">
                  <Button
                    type="button"
                    disabled={workItems.fields.length === 1}
                    size="sm"
                    variant="ghost"
                    onClick={() => workItems.remove(workIndex)}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>
                <Textarea
                  placeholder="Describe an impact-driven achievement"
                  {...register(`employment.${index}.workItems.${workIndex}.content`)}
                />
                <FieldError message={sectionErrors?.workItems?.[workIndex]?.content?.message} />
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-fit"
              onClick={() => workItems.append({ content: "" })}
            >
              <Plus className="size-4" />
              Add item
            </Button>
          </div>

          <div className="space-y-3">
            <Label>Tech stacks</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {techStacks.fields.map((field, techIndex) => (
                <div key={field.id} className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      disabled={techStacks.fields.length === 1}
                      size="sm"
                      variant="ghost"
                      onClick={() => techStacks.remove(techIndex)}
                    >
                      <Trash2 className="size-4" />
                      Remove
                    </Button>
                  </div>
                  <Input placeholder="Next.js" {...register(`employment.${index}.techStacks.${techIndex}.name`)} />
                  <FieldError message={sectionErrors?.techStacks?.[techIndex]?.name?.message} />
                </div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-fit"
              onClick={() => techStacks.append({ name: "" })}
            >
              <Plus className="size-4" />
              Add stack
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function EducationSection({
  errors,
  itemCount,
  index,
  register,
  remove,
}: {
  errors: FieldErrors<ProfileFormValues>;
  itemCount: number;
  index: number;
  register: UseFormRegister<ProfileFormValues>;
  remove: (index: number) => void;
}) {
  const sectionErrors = errors.education?.[index];
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-expanded={isOpen}
            aria-label={isOpen ? `Collapse education ${index + 1}` : `Expand education ${index + 1}`}
            onClick={() => setIsOpen((current) => !current)}
          >
            <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
          <h3 className="font-medium">Education #{index + 1}</h3>
        </div>
        <Button type="button" disabled={itemCount === 1} variant="ghost" onClick={() => remove(index)}>
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>
      {isOpen ? (
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            id={`education-university-${index}`}
            label="University name"
            error={sectionErrors?.universityName?.message}
          >
            <Input id={`education-university-${index}`} {...register(`education.${index}.universityName`)} />
          </InputField>
          <InputField id={`education-period-${index}`} label="Period" error={sectionErrors?.period?.message}>
            <Input id={`education-period-${index}`} placeholder="2016 - 2020" {...register(`education.${index}.period`)} />
          </InputField>
          <InputField id={`education-degree-${index}`} label="Degree" error={sectionErrors?.degree?.message}>
            <Input id={`education-degree-${index}`} {...register(`education.${index}.degree`)} />
          </InputField>
          <div className="md:col-span-2">
            <InputField id={`education-summary-${index}`} label="Summary" error={sectionErrors?.summary?.message}>
              <Textarea id={`education-summary-${index}`} {...register(`education.${index}.summary`)} />
            </InputField>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ProfileForm({
  initialValues,
  profileId,
}: {
  initialValues?: ProfileFormValues;
  profileId?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [autofillError, setAutofillError] = useState<string | null>(null);
  const [autofillMessage, setAutofillMessage] = useState<string | null>(null);
  const [isAutofilling, setIsAutofilling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [openSections, setOpenSections] = useState<Record<FormSectionKey, boolean>>({
    basics: true,
    summary: true,
    socialLinks: true,
    employment: true,
    education: true,
    skills: true,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialValues ?? createEmptyProfile(),
  });

  const socialLinks = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const employment = useFieldArray({
    control: form.control,
    name: "employment",
  });

  const education = useFieldArray({
    control: form.control,
    name: "education",
  });

  const skills = useFieldArray({
    control: form.control,
    name: "skills",
  });

  function toggleSection(section: FormSectionKey) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener("load", () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
          return;
        }

        reject(new Error("Unable to read the selected file"));
      });
      reader.addEventListener("error", () => reject(new Error("Unable to read the selected file")));
      reader.readAsDataURL(file);
    });
  }

  async function handleAutofill() {
    const trimmedResumeText = resumeText.trim();

    if (!trimmedResumeText && !resumeFile) {
      setAutofillError("Paste resume text or upload a resume file first.");
      setAutofillMessage(null);
      return;
    }

    if (resumeFile && resumeFile.size > 8 * 1024 * 1024) {
      setAutofillError("Upload a resume file smaller than 8 MB.");
      setAutofillMessage(null);
      return;
    }

    setIsAutofilling(true);
    setAutofillError(null);
    setAutofillMessage(null);

    try {
      const response = await fetch("/api/profiles/autofill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: trimmedResumeText || undefined,
          file: resumeFile
            ? {
                name: resumeFile.name,
                dataUrl: await readFileAsDataUrl(resumeFile),
              }
            : undefined,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Unable to autofill profile");
      }

      const data = (await response.json()) as { profile: ProfileFormValues };
      form.reset(data.profile);
      setOpenSections({
        basics: true,
        summary: true,
        socialLinks: true,
        employment: true,
        education: true,
        skills: true,
      });
      setAutofillMessage("Profile fields were autofilled from the resume. Review them before saving.");
    } catch (autofillError) {
      setAutofillError(autofillError instanceof Error ? autofillError.message : "Unable to autofill profile");
    } finally {
      setIsAutofilling(false);
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(profileId ? `/api/profiles/${profileId}` : "/api/profiles", {
        method: profileId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Unable to save profile");
      }

      const data = (await response.json()) as { id: string };

      router.push(`/resume/${data.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to save profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{profileId ? "Edit profile" : "Create profile"}</h1>
          <p className="text-muted-foreground">
            Capture the canonical resume data that you will later tailor for specific opportunities.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/resume">Back to profiles</Link>
          </Button>
          {profileId ? (
            <Button asChild variant="secondary">
              <Link href={`/resume/${profileId}/tailor`}>Tailor resume</Link>
            </Button>
          ) : null}
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </div>

      {!profileId ? (
        <Card>
          <CardHeader>
            <CardTitle>Autofill from existing resume</CardTitle>
            <CardDescription>
              Paste resume text or upload a resume file to populate the profile fields, even if it was created outside this app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <InputField id="resume-import-file" label="Resume file">
                <Input
                  id="resume-import-file"
                  type="file"
                  accept=".pdf,.txt,.md,text/plain,application/pdf"
                  onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
                />
              </InputField>
              <div className="flex items-end">
                <Button type="button" variant="secondary" disabled={isAutofilling} onClick={handleAutofill}>
                  <Upload className="size-4" />
                  {isAutofilling ? "Autofilling..." : "Autofill profile"}
                </Button>
              </div>
            </div>
            <InputField id="resume-import-text" label="Resume text">
              <Textarea
                id="resume-import-text"
                placeholder="Paste your existing resume here if you do not have a PDF or text file."
                value={resumeText}
                onChange={(event) => setResumeText(event.target.value)}
              />
            </InputField>
            {autofillError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{autofillError}</p>
            ) : null}
            {autofillMessage ? (
              <p className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">{autofillMessage}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      <SectionCard
        title="Profile basics"
        description="Primary identity and contact details."
        isOpen={openSections.basics}
        onToggle={() => toggleSection("basics")}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <InputField id="fullName" label="Full name" error={form.formState.errors.fullName?.message}>
            <Input id="fullName" {...form.register("fullName")} />
          </InputField>
          <InputField id="headline" label="Resume title / headline" error={form.formState.errors.headline?.message}>
            <Input id="headline" placeholder="Senior Full-Stack Engineer" {...form.register("headline")} />
          </InputField>
          <InputField id="email" label="Email" error={form.formState.errors.email?.message}>
            <Input id="email" type="email" {...form.register("email")} />
          </InputField>
          <InputField id="phone" label="Phone number" error={form.formState.errors.phone?.message}>
            <Input id="phone" {...form.register("phone")} />
          </InputField>
          <div className="md:col-span-2">
            <InputField id="address" label="Address" error={form.formState.errors.address?.message}>
              <Input id="address" placeholder="San Francisco, CA" {...form.register("address")} />
            </InputField>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Summary"
        description="Write a concise professional introduction."
        isOpen={openSections.summary}
        onToggle={() => toggleSection("summary")}
      >
        <InputField id="summary" label="Summary" error={form.formState.errors.summary?.message}>
          <Textarea id="summary" placeholder="Write a short summary of your experience and value." {...form.register("summary")} />
        </InputField>
      </SectionCard>

      <SectionCard
        title="Social links"
        description="Add optional links like LinkedIn, GitHub, portfolio, or X."
        isOpen={openSections.socialLinks}
        onToggle={() => toggleSection("socialLinks")}
        headerAction={
          <Button type="button" size="sm" variant="outline" onClick={() => socialLinks.append({ label: "", url: "" })}>
            <Plus className="size-4" />
            Add link
          </Button>
        }
      >
        <div className="space-y-4">
          {socialLinks.fields.length ? (
            socialLinks.fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-[1fr_2fr_auto] md:items-start">
                <InputField
                  id={`social-label-${index}`}
                  label="Label"
                  error={form.formState.errors.socialLinks?.[index]?.label?.message}
                >
                  <Input id={`social-label-${index}`} placeholder="LinkedIn" {...form.register(`socialLinks.${index}.label`)} />
                </InputField>
                <InputField id={`social-url-${index}`} label="URL" error={form.formState.errors.socialLinks?.[index]?.url?.message}>
                  <Input id={`social-url-${index}`} placeholder="https://..." {...form.register(`socialLinks.${index}.url`)} />
                </InputField>
                <div className="pt-7">
                  <Button type="button" disabled={socialLinks.fields.length === 1} variant="ghost" onClick={() => socialLinks.remove(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No social links added yet.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Employment history"
        description="Add company context, impact-driven work items, and core tech stacks."
        isOpen={openSections.employment}
        onToggle={() => toggleSection("employment")}
        headerAction={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              employment.append({
                companyName: "",
                period: "",
                title: "",
                logoUrl: "",
                location: "",
                website: "",
                workItems: [{ content: "" }],
                techStacks: [{ name: "" }],
              })
            }
          >
            <Plus className="size-4" />
            Add employment
          </Button>
        }
      >
        <div className="space-y-4">
          {employment.fields.length ? (
            employment.fields.map((field, index) => (
              <EmploymentSection
                key={field.id}
                control={form.control}
                errors={form.formState.errors}
                index={index}
                register={form.register}
                remove={employment.remove}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No employment history added yet.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Education history"
        description="Add degrees, dates, and optional academic summary notes."
        isOpen={openSections.education}
        onToggle={() => toggleSection("education")}
        headerAction={
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              education.append({
                universityName: "",
                period: "",
                degree: "",
                summary: "",
              })
            }
          >
            <Plus className="size-4" />
            Add education
          </Button>
        }
      >
        <div className="space-y-4">
          {education.fields.map((field, index) => (
            <EducationSection
              key={field.id}
              errors={form.formState.errors}
              itemCount={education.fields.length}
              index={index}
              register={form.register}
              remove={education.remove}
            />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Skills"
        description="List the skills and tools you want available for tailoring."
        isOpen={openSections.skills}
        onToggle={() => toggleSection("skills")}
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {skills.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_auto] md:items-start">
                <InputField id={`skill-${index}`} label="Skill" error={form.formState.errors.skills?.[index]?.name?.message}>
                  <Input id={`skill-${index}`} placeholder="TypeScript" {...form.register(`skills.${index}.name`)} />
                </InputField>
                <div className="pt-7">
                  <Button type="button" disabled={skills.fields.length === 1} variant="ghost" onClick={() => skills.remove(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Button type="button" size="sm" variant="outline" className="w-fit" onClick={() => skills.append({ name: "" })}>
            <Plus className="size-4" />
            Add skill
          </Button>
        </div>
      </SectionCard>
    </form>
  );
}
