import { notFound } from "next/navigation";

import { ProfileForm } from "@/components/resume/profile-form";
import { db } from "@/lib/db";
import { mapProfileToForm, profileInclude } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;

  const profile = await db.profile.findUnique({
    where: { id: profileId },
    include: profileInclude,
  });

  if (!profile) {
    notFound();
  }

  return <ProfileForm initialValues={mapProfileToForm(profile)} profileId={profile.id} />;
}
