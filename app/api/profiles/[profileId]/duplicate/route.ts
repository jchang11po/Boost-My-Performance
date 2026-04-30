import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildProfileWriteData, mapProfileToForm, profileInclude } from "@/lib/profile-data";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> },
) {
  try {
    const { profileId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.profile.findFirst({
      where: {
        id: profileId,
        userId: user.id,
      },
      include: profileInclude,
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const values = mapProfileToForm(profile);
    values.fullName = `${values.fullName} (Copy)`;

    const duplicatedProfile = await db.profile.create({
      data: {
        ...buildProfileWriteData(values),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return NextResponse.json({ id: duplicatedProfile.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to duplicate profile" }, { status: 400 });
  }
}
