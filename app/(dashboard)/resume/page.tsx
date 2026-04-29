import Link from "next/link";
import { Plus } from "lucide-react";

import { ProfileList } from "@/components/resume/profile-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const profiles = await db.profile.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      skills: {
        orderBy: { sortOrder: "asc" },
      },
      employment: true,
      tailoredVersions: true,
    },
  });

  const totalTailoredVersions = profiles.reduce((count, profile) => count + profile.tailoredVersions.length, 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="bg-gradient-to-br from-primary/10 via-card to-card">
          <CardHeader>
            <CardTitle className="text-3xl">Resume workspace</CardTitle>
            <CardDescription>
              Manage reusable profiles, tailor role-specific resume variants, and export polished PDFs.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/resume/new">
                <Plus className="size-4" />
                Create profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Profiles</CardDescription>
              <CardTitle>{profiles.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tailored versions</CardDescription>
              <CardTitle>{totalTailoredVersions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Skills captured</CardDescription>
              <CardTitle>{profiles.reduce((count, profile) => count + profile.skills.length, 0)}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>

      <ProfileList
        initialProfiles={profiles.map((profile) => ({
          id: profile.id,
          fullName: profile.fullName,
          headline: profile.headline,
          email: profile.email,
          updatedAt: profile.updatedAt.toISOString(),
          skills: profile.skills.map((skill) => skill.name),
          employmentCount: profile.employment.length,
          tailoredVersionCount: profile.tailoredVersions.length,
        }))}
      />
    </div>
  );
}
