import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildProfileWriteData, profileInclude } from "@/lib/profile-data";
import { profileFormSchema } from "@/lib/validation/resume";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await db.profile.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: profileInclude,
  });

  return NextResponse.json(profiles);
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const values = profileFormSchema.parse(body);

    const profile = await db.profile.create({
      data: {
        ...buildProfileWriteData(values),
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return NextResponse.json({ id: profile.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to create profile" }, { status: 400 });
  }
}
