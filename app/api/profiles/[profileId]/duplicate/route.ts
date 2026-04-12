import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { buildProfileWriteData, mapProfileToForm, profileInclude } from "@/lib/profile-data";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  try {
    const { profileId } = await params;

    const profile = await db.profile.findUnique({
      where: { id: profileId },
      include: profileInclude,
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const values = mapProfileToForm(profile);
    values.fullName = `${values.fullName} (Copy)`;

    const duplicatedProfile = await db.profile.create({
      data: buildProfileWriteData(values),
    });

    return NextResponse.json({ id: duplicatedProfile.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to duplicate profile" }, { status: 400 });
  }
}
