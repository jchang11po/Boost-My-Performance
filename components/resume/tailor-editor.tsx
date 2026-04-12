"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, RotateCcw, Save, Trash2, WandSparkles } from "lucide-react";
import { useFieldArray, useForm, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import { ResumePdfDocument } from "@/components/resume/resume-pdf-document";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { tailoredResumeSchema, type TailoredResumeValues } from "@/lib/validation/resume";

type SavedVersion = {
  id: string;
  label: string | null;
  title: string | null;
  updatedAt: string;
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-destructive">{message}</p> : null;
}

function InputField({
  children,
  error,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  );
}

function TailorEmploymentSection({
  control,
  errors,
  index,
  register,
  remove,
}: {
  control: Control<TailoredResumeValues>;
  errors: FieldErrors<TailoredResumeValues>;
  index: number;
  register: UseFormRegister<TailoredResumeValues>;
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
        <h3 className="font-medium">Role #{index + 1}</h3>
        <Button disabled={index === 0} size="sm" variant="ghost" onClick={() => remove(index)}>
          <Trash2 className="size-4" />
          Remove
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InputField label="Company name" error={sectionErrors?.companyName?.message}>
          <Input {...register(`employment.${index}.companyName`)} />
        </InputField>
        <InputField label="Period" error={sectionErrors?.period?.message}>
          <Input {...register(`employment.${index}.period`)} />
        </InputField>
        <InputField label="Title" error={sectionErrors?.title?.message}>
          <Input {...register(`employment.${index}.title`)} />
        </InputField>
        <InputField label="Location" error={sectionErrors?.location?.message}>
          <Input {...register(`employment.${index}.location`)} />
        </InputField>
        <InputField label="Company logo URL" error={sectionErrors?.logoUrl?.message}>
          <Input {...register(`employment.${index}.logoUrl`)} />
        </InputField>
        <InputField label="Company website" error={sectionErrors?.website?.message}>
          <Input {...register(`employment.${index}.website`)} />
        </InputField>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label>Tailored work items</Label>
          <Button size="sm" variant="outline" onClick={() => workItems.append({ content: "" })}>
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
            <Textarea {...register(`employment.${index}.workItems.${workIndex}.content`)} />
            <FieldError message={sectionErrors?.workItems?.[workIndex]?.content?.message} />
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Label>Tailored tech stacks</Label>
          <Button size="sm" variant="outline" onClick={() => techStacks.append({ name: "" })}>
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
              <Input {...register(`employment.${index}.techStacks.${techIndex}.name`)} />
              <FieldError message={sectionErrors?.techStacks?.[techIndex]?.name?.message} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TailorEditor({
  initialValues,
  profileId,
  savedVersions,
}: {
  initialValues: TailoredResumeValues;
  profileId: string;
  savedVersions: SavedVersion[];
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState("");

  const form = useForm<TailoredResumeValues>({
    resolver: zodResolver(tailoredResumeSchema),
    defaultValues: initialValues,
  });

  const employment = useFieldArray({
    control: form.control,
    name: "employment",
  });

  const skills = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const socialLinks = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  const education = useFieldArray({
    control: form.control,
    name: "education",
  });

  const watchedValues = form.watch();
  const deferredValues = useDeferredValue(watchedValues);
  const pdfDocument = useMemo(() => <ResumePdfDocument resume={deferredValues} />, [deferredValues]);

  async function generateWithOpenAI() {
    if (!targetRole.trim() || !jobDescription.trim()) {
      setError("Add a target role and job description before generating tailored content.");
      return;
    }

    const isValid = await form.trigger();
    if (!isValid) {
      setError("Please fix the highlighted resume fields before generating tailored content.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/resumes/${profileId}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentResume: form.getValues(),
          targetRole,
          jobDescription,
          additionalInstructions,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | {
            error?: string;
            resume?: TailoredResumeValues;
          }
        | null;

      if (!response.ok || !data?.resume) {
        throw new Error(data?.error || "Unable to generate tailored content");
      }

      form.reset(data.resume);
      setSaveMessage("Tailored content generated with OpenAI. Review it, then save or download.");
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Unable to generate tailored content");
    } finally {
      setIsGenerating(false);
    }
  }

  async function saveVersion() {
    const isValid = await form.trigger();
    if (!isValid) {
      setError("Please fix the highlighted fields before saving a tailored version.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaveMessage(null);

    try {
      const response = await fetch(`/api/resumes/${profileId}/versions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form.getValues()),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Unable to save tailored version");
      }

      setSaveMessage("Tailored version saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save tailored version");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Tailor resume</h1>
            <p className="text-muted-foreground">
              Edit the role-specific title, work items, tech stacks, skills, and profile content before exporting.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/resume/${profileId}`}>Back to profile</Link>
            </Button>
            <Button variant="secondary" onClick={() => form.reset(initialValues)}>
              <RotateCcw className="size-4" />
              Reset to source
            </Button>
            <Button disabled={isGenerating || isSaving} variant="outline" onClick={generateWithOpenAI}>
              <WandSparkles className="size-4" />
              {isGenerating ? "Generating..." : "Generate with OpenAI"}
            </Button>
            <Button disabled={isSaving} onClick={saveVersion}>
              <Save className="size-4" />
              {isSaving ? "Saving..." : "Save tailored version"}
            </Button>
            <PDFDownloadLink
              className={cn(buttonVariants({ variant: "default" }))}
              document={pdfDocument}
              fileName={`${deferredValues.fullName.replace(/\s+/g, "-").toLowerCase()}-resume.pdf`}
            >
              {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
            </PDFDownloadLink>
          </div>
        </div>

        {error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
        {saveMessage ? <p className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">{saveMessage}</p> : null}

        <Card>
          <CardHeader>
            <CardTitle>AI tailoring</CardTitle>
            <CardDescription>
              Paste the target role and job description, then generate tailored resume content using the OpenAI API key from
              your `.env` file.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField label="Target role">
              <Input
                placeholder="Senior Frontend Engineer"
                value={targetRole}
                onChange={(event) => setTargetRole(event.target.value)}
              />
            </InputField>
            <InputField label="Job description">
              <Textarea
                placeholder="Paste the role description, requirements, and responsibilities here."
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />
            </InputField>
            <InputField label="Additional instructions">
              <Textarea
                placeholder="Optional guidance, such as emphasizing leadership, product impact, or ATS keywords."
                value={additionalInstructions}
                onChange={(event) => setAdditionalInstructions(event.target.value)}
              />
            </InputField>
            <p className="text-sm text-muted-foreground">
              The generated output updates the resume title, summary, employment titles, work items, tech stacks, and skills
              while preserving your saved source profile structure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resume identity</CardTitle>
            <CardDescription>Update the role-facing title and core contact details for this tailored version.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InputField label="Resume label">
              <Input placeholder="Frontend role, 2026" {...form.register("label")} />
            </InputField>
            <InputField label="Resume title" error={form.formState.errors.resumeTitle?.message}>
              <Input placeholder="Senior Frontend Engineer" {...form.register("resumeTitle")} />
            </InputField>
            <InputField label="Full name" error={form.formState.errors.fullName?.message}>
              <Input {...form.register("fullName")} />
            </InputField>
            <InputField label="Email" error={form.formState.errors.email?.message}>
              <Input {...form.register("email")} />
            </InputField>
            <InputField label="Phone" error={form.formState.errors.phone?.message}>
              <Input {...form.register("phone")} />
            </InputField>
            <InputField label="Address" error={form.formState.errors.address?.message}>
              <Input {...form.register("address")} />
            </InputField>
            <div className="md:col-span-2">
              <InputField label="Summary" error={form.formState.errors.summary?.message}>
                <Textarea {...form.register("summary")} />
              </InputField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Social links</CardTitle>
                <CardDescription>Fine-tune which links appear on this exported resume.</CardDescription>
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
                <div key={field.id} className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-[1fr_2fr_auto]">
                  <InputField label="Label" error={form.formState.errors.socialLinks?.[index]?.label?.message}>
                    <Input {...form.register(`socialLinks.${index}.label`)} />
                  </InputField>
                  <InputField label="URL" error={form.formState.errors.socialLinks?.[index]?.url?.message}>
                    <Input {...form.register(`socialLinks.${index}.url`)} />
                  </InputField>
                  <div className="pt-7">
                    <Button disabled={socialLinks.fields.length === 1} variant="ghost" onClick={() => socialLinks.remove(index)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No social links selected for this tailored version.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Experience overrides</CardTitle>
                <CardDescription>Rewrite accomplishments, tighten scope, and emphasize the right stacks per role.</CardDescription>
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
                Add role
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {employment.fields.map((field, index) => (
              <TailorEmploymentSection
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
                <CardTitle>Skills</CardTitle>
                <CardDescription>Update the skills section to reflect the target opportunity.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => skills.append({ name: "" })}>
                <Plus className="size-4" />
                Add skill
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {skills.fields.map((field, index) => (
              <div key={field.id} className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-[1fr_auto]">
                <InputField label="Skill" error={form.formState.errors.skills?.[index]?.name?.message}>
                  <Input {...form.register(`skills.${index}.name`)} />
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Education</CardTitle>
                <CardDescription>Keep or adjust academic details for the exported version.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => education.append({ universityName: "", period: "", degree: "", summary: "" })}>
                <Plus className="size-4" />
                Add education
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {education.fields.map((field, index) => (
              <div key={field.id} className="grid gap-4 rounded-xl border border-border p-4 md:grid-cols-2">
                <InputField label="University" error={form.formState.errors.education?.[index]?.universityName?.message}>
                  <Input {...form.register(`education.${index}.universityName`)} />
                </InputField>
                <InputField label="Period" error={form.formState.errors.education?.[index]?.period?.message}>
                  <Input {...form.register(`education.${index}.period`)} />
                </InputField>
                <InputField label="Degree" error={form.formState.errors.education?.[index]?.degree?.message}>
                  <Input {...form.register(`education.${index}.degree`)} />
                </InputField>
                <div className="flex items-end justify-end">
                  <Button disabled={education.fields.length === 1} variant="ghost" onClick={() => education.remove(index)}>
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>
                <div className="md:col-span-2">
                  <InputField label="Summary" error={form.formState.errors.education?.[index]?.summary?.message}>
                    <Textarea {...form.register(`education.${index}.summary`)} />
                  </InputField>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Saved tailored versions</CardTitle>
            <CardDescription>Saved snapshots help you keep role-specific resume variants without changing the source profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {savedVersions.length ? (
              savedVersions.map((version) => (
                <div key={version.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">{version.label || version.title || "Untitled tailored version"}</p>
                    <p className="text-sm text-muted-foreground">
                      {version.title || "No explicit title"} · Updated {new Date(version.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="outline">Saved</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No tailored versions saved yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="sticky top-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Live PDF preview</CardTitle>
              <CardDescription>The preview uses the same document component as the downloadable PDF.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[900px] overflow-hidden rounded-xl border border-border">
                <PDFViewer className="h-full w-full">{pdfDocument}</PDFViewer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
