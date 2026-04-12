import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { serializeTailoredResume } from "@/lib/profile-data";
import { tailoredResumeSchema } from "@/lib/validation/resume";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  try {
    const { profileId } = await params;
    const body = await request.json();
    const values = tailoredResumeSchema.parse(body);

    const version = await db.tailoredResumeVersion.create({
      data: {
        profileId,
        label: values.label || null,
        title: values.resumeTitle,
        snapshotJson: serializeTailoredResume(values),
      },
    });

    return NextResponse.json({ id: version.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to save tailored version" }, { status: 400 });
  }
}
