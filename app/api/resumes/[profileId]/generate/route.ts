import { NextResponse } from "next/server";

import { extractJsonObject, getOpenAIClient, getOpenAIModel } from "@/lib/openai";
import {
  generateTailoredResumeRequestSchema,
  generatedTailoringSchema,
  tailoredResumeSchema,
} from "@/lib/validation/resume";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { additionalInstructions, currentResume, jobDescription, targetRole } =
      generateTailoredResumeRequestSchema.parse(body);

    const client = getOpenAIClient();
    const model = getOpenAIModel();

    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "You are an expert resume writer. Tailor resume content to a target role using only truthful information from the provided source resume. Improve relevance, specificity, clarity, and impact. Do not invent employers, dates, degrees, technologies, or achievements that are not supported by the source. Return only valid JSON.",
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
                additionalInstructions ? `Additional instructions:\n${additionalInstructions}` : "",
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
                "- Keep the same employment entry count and order as the source resume.",
                "- Update only the employment title, work items, and tech stacks for each role.",
                "- Keep each work item concise, achievement-oriented, and aligned to the target role.",
                "- Return a focused skills list using only skills already present or directly supported by the source resume.",
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
      return NextResponse.json({ error: "OpenAI did not return any resume content." }, { status: 502 });
    }

    const parsedJson = JSON.parse(extractJsonObject(outputText));
    const generated = generatedTailoringSchema.parse(parsedJson);

    if (generated.employment.length !== currentResume.employment.length) {
      return NextResponse.json(
        { error: "OpenAI response did not preserve the expected employment structure." },
        { status: 502 },
      );
    }

    const mergedResume = tailoredResumeSchema.parse({
      ...currentResume,
      resumeTitle: generated.resumeTitle,
      summary: generated.summary,
      employment: currentResume.employment.map((employment, index) => ({
        ...employment,
        title: generated.employment[index]?.title || employment.title,
        workItems: generated.employment[index]?.workItems?.length
          ? generated.employment[index].workItems
          : employment.workItems,
        techStacks: generated.employment[index]?.techStacks ?? employment.techStacks,
      })),
      skills: generated.skills,
    });

    return NextResponse.json({ resume: mergedResume });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Unable to generate tailored resume content." }, { status: 400 });
  }
}
