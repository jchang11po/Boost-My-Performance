import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getTailoringSettings, saveTailoringSettings } from "@/lib/tailoring-settings";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getTailoringSettings();

    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to load tailoring settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const settings = await saveTailoringSettings(body);

    return NextResponse.json({ settings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unable to save tailoring settings" }, { status: 400 });
  }
}
