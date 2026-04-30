import { NextResponse } from "next/server";
import { z } from "zod";

import {
  extractJsonObject,
  getOpenAIClient,
  getOpenAIModel,
} from "@/lib/openai";
import { getCurrentUser } from "@/lib/auth";
import { profileFormSchema } from "@/lib/validation/resume";

const autofillResumeRequestSchema = z.object({
  resumeText: z.string().trim().optional(),
  file: z
    .object({
      name: z.string().trim().min(1),
      dataUrl: z.string().trim().min(1),
    })
    .optional(),
});

function emptyStringForNulls(value: unknown): unknown {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(emptyStringForNulls);
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, emptyStringForNulls(entry)]),
    );
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { file, resumeText } = autofillResumeRequestSchema.parse(body);

    if (!resumeText && !file) {
      return NextResponse.json(
        { error: "Paste resume text or upload a resume file." },
        { status: 400 },
      );
    }

    const client = getOpenAIClient();
    const model = getOpenAIModel();
    const content: Array<
      | { type: "input_text"; text: string }
      | { type: "input_file"; filename: string; file_data: string }
    > = [
      {
        type: "input_text",
        text: [
          "Convert the provided resume into canonical profile data for this resume builder.",
          "The resume may come from any source, not only this platform.",
          "Return only valid JSON. Do not wrap it in markdown.",
          "",
          "Use exactly this JSON shape:",
          JSON.stringify(
            {
              fullName: "string",
              headline: "string",
              email: "string",
              phone: "string",
              address: "string",
              summary: "string",
              socialLinks: [{ label: "string", url: "string" }],
              employment: [
                {
                  companyName: "string",
                  period: "string",
                  title: "string",
                  logoUrl: "",
                  location: "string",
                  website: "",
                  workItems: [{ content: "string" }],
                  techStacks: [{ name: "string" }],
                },
              ],
              education: [
                {
                  universityName: "string",
                  period: "string",
                  degree: "string",
                  summary: "string",
                },
              ],
              skills: [{ name: "string" }],
            },
            null,
            2,
          ),
          "",
          "Rules:",
          "- Extract only information supported by the source resume.",
          "- Use empty strings for missing scalar values.",
          "- Use empty arrays for missing repeated sections.",
          "- Keep dates and locations as written when possible.",
          "- Put achievement bullets in employment.workItems.",
          "- Put technologies from each role in employment.techStacks when clearly tied to that role.",
          "- Put broad skills and tools in skills, deduplicated and ordered by relevance.",
        ].join("\n"),
      },
    ];

    if (resumeText) {
      content.push({
        type: "input_text",
        text: `Resume text:\n${resumeText}`,
      });
    }

    if (file) {
      content.push({
        type: "input_file",
        filename: file.name,
        file_data: file.dataUrl,
      });
    }

    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are an expert resume parser. Extract structured profile data faithfully without inventing employers, dates, degrees, links, or achievements.",
            },
          ],
        },
        {
          role: "user",
          content,
        },
      ],
    });

    const outputText = response.output_text;

    if (!outputText) {
      return NextResponse.json(
        { error: "OpenAI did not return any resume data." },
        { status: 502 },
      );
    }

    const parsedJson = JSON.parse(extractJsonObject(outputText));
    const profile = profileFormSchema.parse(emptyStringForNulls(parsedJson));

    return NextResponse.json({ profile });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message.includes("OPENAI_API_KEY")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Unable to autofill profile from this resume." },
      { status: 400 },
    );
  }
}
