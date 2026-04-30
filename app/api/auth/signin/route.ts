import { NextResponse } from "next/server";

import { createUserSession, findUserByEmail, verifyPassword } from "@/lib/auth";
import { authFormSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = authFormSchema.parse(body);
    const user = await findUserByEmail(values.email);

    if (!user || !(await verifyPassword(values.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createUserSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to sign in." }, { status: 400 });
  }
}
