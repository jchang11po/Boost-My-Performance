import { notFound, redirect } from "next/navigation";

import { TailorEditor } from "@/components/resume/tailor-editor";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { mapProfileToTailoredResume, profileInclude } from "@/lib/profile-data";

export const dynamic = "force-dynamic";

export default async function TailorProfilePage({
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

  return (
    <TailorEditor
      initialValues={mapProfileToTailoredResume(profile)}
      profileId={profile.id}
      savedVersions={profile.tailoredVersions.map((version) => ({
        id: version.id,
        label: version.label,
        title: version.title,
        updatedAt: version.updatedAt.toISOString(),
      }))}
    />
  );
}
