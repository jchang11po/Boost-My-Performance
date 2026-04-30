import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { createUserSession, hashPassword, toStoredEmail } from "@/lib/auth";
import { db } from "@/lib/db";
import { signupFormSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = signupFormSchema.parse(body);
    const passwordHash = await hashPassword(values.password);

    const user = await db.$transaction(async (transaction) => {
      const existingUserCount = await transaction.user.count();
      const createdUser = await transaction.user.create({
        data: {
          email: toStoredEmail(values.email),
          name: values.name || null,
          passwordHash,
        },
      });

      if (existingUserCount === 0) {
        await transaction.profile.updateMany({
          where: {
            userId: null,
          },
          data: {
            userId: createdUser.id,
          },
        });
      }

      return createdUser;
    });

    await createUserSession(user.id);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account already exists for this email." }, { status: 409 });
    }

    console.error(error);
    return NextResponse.json({ error: "Unable to create account." }, { status: 400 });
  }
}
