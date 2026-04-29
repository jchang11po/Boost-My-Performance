import { NextResponse } from "next/server";

import {
  extractJsonObject,
  getOpenAIClient,
  getOpenAIModel,
} from "@/lib/openai";
import {
  generateTailoredResumeRequestSchema,
  generatedTailoringSchema,
  tailoredResumeSchema,
} from "@/lib/validation/resume";
import { getTailoringSettings } from "@/lib/tailoring-settings";

function getAllowedUpdateSummary(settings: Awaited<ReturnType<typeof getTailoringSettings>>) {
  const allowedUpdates = [
    settings.updateSummary ? "summary" : null,
    settings.updateEmploymentTitles ? "employment titles" : null,
    settings.updateWorkItems ? "employment work items" : null,
    settings.updateSkills ? "employment tech stacks and skills section" : null,
  ].filter(Boolean);

  return allowedUpdates.length ? allowedUpdates.join(", ") : "no resume sections";
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      additionalInstructions,
      currentResume,
      jobDescription,
      targetRole,
    } = generateTailoredResumeRequestSchema.parse(body);

    const client = getOpenAIClient();
    const model = getOpenAIModel();
    const settings = await getTailoringSettings();
    const allowedUpdateSummary = getAllowedUpdateSummary(settings);

    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are an expert resume writer. Tailor resume content to a target role using only truthful information from the provided source resume. Improve relevance, specificity, clarity, and impact. Do not invent employers, dates, degrees, technologies, or achievements that are not supported by the source. Return only valid JSON.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `Target role: ${targetRole}`,
                "",
                "Job description:",
                jobDescription,
                "",
                additionalInstructions
                  ? `Additional instructions:\n${additionalInstructions}`
                  : "",
                "",
                "Source resume JSON:",
                JSON.stringify(currentResume, null, 2),
                "",
                "Return JSON with exactly this shape:",
                JSON.stringify(
                  {
                    resumeTitle: "string",
                    summary: "string",
                    employment: currentResume.employment.map(() => ({
                      title: "string",
                      workItems: [{ content: "string" }],
                      techStacks: [{ name: "string" }],
                    })),
                    skills: [{ name: "string" }],
                  },
                  null,
                  2,
                ),
                "",
                "Requirements:",
                "- Keep the same employment entry count, and order as the source resume.",
                `- Global settings allow updates to: ${allowedUpdateSummary}.`,
                "- For any field not allowed by global settings, return the source value unchanged.",
                settings.updateEmploymentTitles
                  ? "- Update employment titles to better match the target role."
                  : "- Keep employment titles unchanged.",
                settings.updateWorkItems
                  ? "- Keep each work item concise, achievement-oriented, and aligned to the target role."
                  : "- Keep employment work items unchanged.",
                settings.updateEmploymentTitles || settings.updateWorkItems || settings.updateSkills
                  ? "- Focus employment-specific updates on the three most recent companies in the source order; keep older roles closer to the source unless they strongly support the target role."
                  : "",
                settings.updateSkills
                  ? "- Return focused employment tech stacks and a skills list using only skills already present or directly supported by the source resume. Keep tech stacks that are related to the job or broadly relevant, add supported related tech stacks where they fit, and order each stack from most to least important for the target role."
                  : "- Keep employment tech stacks and the skills section unchanged.",
                settings.updateSummary
                  ? "- Update the summary to reflect the target role."
                  : "- Keep the summary unchanged.",
                "- Keep the output ATS-friendly and professional.",
              ]
                .filter(Boolean)
                .join("\n"),
            },
          ],
        },
      ],
    });

    const outputText = response.output_text;

    if (!outputText) {
      return NextResponse.json(
        { error: "OpenAI did not return any resume content." },
        { status: 502 },
      );
    }

    const parsedJson = JSON.parse(extractJsonObject(outputText));
    const generated = generatedTailoringSchema.parse(parsedJson);

    if (generated.employment.length !== currentResume.employment.length) {
      return NextResponse.json(
        {
          error:
            "OpenAI response did not preserve the expected employment structure.",
        },
        { status: 502 },
      );
    }

    const mergedResume = tailoredResumeSchema.parse({
      ...currentResume,
      resumeTitle: generated.resumeTitle,
      summary: settings.updateSummary ? generated.summary : currentResume.summary,
      employment: currentResume.employment.map((employment, index) => ({
        ...employment,
        title: settings.updateEmploymentTitles
          ? generated.employment[index]?.title || employment.title
          : employment.title,
        workItems: settings.updateWorkItems && generated.employment[index]?.workItems?.length
          ? generated.employment[index].workItems
          : employment.workItems,
        techStacks:
          settings.updateSkills
            ? generated.employment[index]?.techStacks ?? employment.techStacks
            : employment.techStacks,
      })),
      skills: settings.updateSkills ? generated.skills : currentResume.skills,
    });

    return NextResponse.json({ resume: mergedResume });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Unable to generate tailored resume content." },
      { status: 400 },
    );
  }
}
