import { notFound, redirect } from "next/navigation";

import { ProfileForm } from "@/components/resume/profile-form";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { mapProfileToForm, profileInclude } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/signin");
  }

  const profile = await db.profile.findFirst({
    where: {
      id: profileId,
      userId: user.id,
    },
    include: profileInclude,
  });

  if (!profile) {
    notFound();
  }

  return <ProfileForm initialValues={mapProfileToForm(profile)} profileId={profile.id} />;
}
