import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { buildProfileWriteData, profileInclude } from "@/lib/profile-data";
import { profileFormSchema } from "@/lib/validation/resume";

export async function GET() {
  const profiles = await db.profile.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: profileInclude,
  });

  return NextResponse.json(profiles);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = profileFormSchema.parse(body);

    const profile = await db.profile.create({
      data: buildProfileWriteData(values),
    });

    return NextResponse.json({ id: profile.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create profile" }, { status: 400 });
  }
}
