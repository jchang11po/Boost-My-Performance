import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { buildProfileWriteData, profileInclude } from "@/lib/profile-data";
import { profileFormSchema } from "@/lib/validation/resume";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  const { profileId } = await params;

  const profile = await db.profile.findUnique({
    where: { id: profileId },
    include: profileInclude,
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  try {
    const { profileId } = await params;
    const body = await request.json();
    const values = profileFormSchema.parse(body);
    const writeData = buildProfileWriteData(values);

    const profile = await db.profile.update({
      where: { id: profileId },
      data: {
        fullName: writeData.fullName,
        headline: writeData.headline,
        email: writeData.email,
        phone: writeData.phone,
        address: writeData.address,
        summary: writeData.summary,
        socialLinks: {
          deleteMany: {},
          create: writeData.socialLinks.create,
        },
        employment: {
          deleteMany: {},
          create: writeData.employment.create,
        },
        education: {
          deleteMany: {},
          create: writeData.education.create,
        },
        skills: {
          deleteMany: {},
          create: writeData.skills.create,
        },
      },
    });

    return NextResponse.json({ id: profile.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to update profile" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  try {
    const { profileId } = await params;

    await db.profile.delete({
      where: { id: profileId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to delete profile" }, { status: 400 });
  }
}
