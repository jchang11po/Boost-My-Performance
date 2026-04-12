"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
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

  return (
    <div className="space-y-4 rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-medium">Employment #{index + 1}</h3>
        <Button disabled={index === 0} size="sm" variant="ghost" onClick={() => remove(index)}>
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>

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
        <div className="flex items-center justify-between gap-4">
          <Label>Work items</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => workItems.append({ content: "" })}
          >
            <Plus className="size-4" />
            Add item
          </Button>
        </div>
        {workItems.fields.map((field, workIndex) => (
          <div key={field.id} className="space-y-2 rounded-lg border border-border p-3">
            <div className="flex justify-end">
              <Button
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
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label>Tech stacks</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => techStacks.append({ name: "" })}
          >
            <Plus className="size-4" />
            Add stack
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {techStacks.fields.map((field, techIndex) => (
            <div key={field.id} className="space-y-2 rounded-lg border border-border p-3">
              <div className="flex justify-end">
                <Button
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
      </div>
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Profile basics</CardTitle>
          <CardDescription>Primary identity, contact details, and a concise professional introduction.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
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
          <div className="md:col-span-2">
            <InputField id="summary" label="Summary" error={form.formState.errors.summary?.message}>
              <Textarea id="summary" placeholder="Write a short summary of your experience and value." {...form.register("summary")} />
            </InputField>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Social links</CardTitle>
              <CardDescription>Add optional links like LinkedIn, GitHub, portfolio, or X.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => socialLinks.append({ label: "", url: "" })}>
              <Plus className="size-4" />
              Add link
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
                  <Button disabled={socialLinks.fields.length === 1} variant="ghost" onClick={() => socialLinks.remove(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No social links added yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Employment history</CardTitle>
              <CardDescription>Add company context, impact-driven work items, and core tech stacks.</CardDescription>
            </div>
            <Button
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {employment.fields.map((field, index) => (
            <EmploymentSection
              key={field.id}
              control={form.control}
              errors={form.formState.errors}
              index={index}
              register={form.register}
              remove={employment.remove}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Education history</CardTitle>
              <CardDescription>Add degrees, dates, and optional academic summary notes.</CardDescription>
            </div>
            <Button
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {education.fields.map((field, index) => (
            <div key={field.id} className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-2">
              <InputField
                id={`education-university-${index}`}
                label="University name"
                error={form.formState.errors.education?.[index]?.universityName?.message}
              >
                <Input id={`education-university-${index}`} {...form.register(`education.${index}.universityName`)} />
              </InputField>
              <InputField id={`education-period-${index}`} label="Period" error={form.formState.errors.education?.[index]?.period?.message}>
                <Input id={`education-period-${index}`} placeholder="2016 - 2020" {...form.register(`education.${index}.period`)} />
              </InputField>
              <InputField id={`education-degree-${index}`} label="Degree" error={form.formState.errors.education?.[index]?.degree?.message}>
                <Input id={`education-degree-${index}`} {...form.register(`education.${index}.degree`)} />
              </InputField>
              <div className="flex items-end justify-end">
                <Button disabled={education.fields.length === 1} variant="ghost" onClick={() => education.remove(index)}>
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
              <div className="md:col-span-2">
                <InputField id={`education-summary-${index}`} label="Summary" error={form.formState.errors.education?.[index]?.summary?.message}>
                  <Textarea id={`education-summary-${index}`} {...form.register(`education.${index}.summary`)} />
                </InputField>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Skills</CardTitle>
              <CardDescription>List the skills and tools you want available for tailoring.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={() => skills.append({ name: "" })}>
              <Plus className="size-4" />
              Add skill
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {skills.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_auto] md:items-start">
              <InputField id={`skill-${index}`} label="Skill" error={form.formState.errors.skills?.[index]?.name?.message}>
                <Input id={`skill-${index}`} placeholder="TypeScript" {...form.register(`skills.${index}.name`)} />
              </InputField>
              <div className="pt-7">
                <Button disabled={skills.fields.length === 1} variant="ghost" onClick={() => skills.remove(index)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  );
}
