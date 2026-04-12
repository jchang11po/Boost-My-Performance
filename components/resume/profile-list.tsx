"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, PencilLine, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ProfileListItem = {
  id: string;
  fullName: string;
  headline: string | null;
  email: string;
  updatedAt: string;
  skills: string[];
  employmentCount: number;
  tailoredVersionCount: number;
};

export function ProfileList({ initialProfiles }: { initialProfiles: ProfileListItem[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function deleteProfile(profileId: string) {
    setPendingId(profileId);

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Unable to delete profile");
      }

      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function duplicateProfile(profileId: string) {
    setPendingId(profileId);

    try {
      const response = await fetch(`/api/profiles/${profileId}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Unable to duplicate profile");
      }

      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  if (!initialProfiles.length) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No profiles yet</CardTitle>
          <CardDescription>Create your first canonical resume profile to start tailoring role-specific versions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="gap-2">
            <Link href="/resume/new">
              <Plus className="size-4" />
              Create profile
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {initialProfiles.map((profile) => (
        <Card key={profile.id} className="flex h-full flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle>{profile.fullName}</CardTitle>
                <CardDescription>{profile.headline || profile.email}</CardDescription>
              </div>
              <Badge variant="secondary">{profile.tailoredVersionCount} tailored</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>{profile.email}</p>
              <p>{profile.employmentCount} experience entries</p>
              <p>Updated {new Date(profile.updatedAt).toLocaleDateString()}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile.skills.slice(0, 6).map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              <Button asChild className="gap-2" variant="outline">
                <Link href={`/resume/${profile.id}`}>
                  <PencilLine className="size-4" />
                  Edit
                </Link>
              </Button>
              <Button asChild className="gap-2">
                <Link href={`/resume/${profile.id}/tailor`}>
                  <Sparkles className="size-4" />
                  Tailor
                </Link>
              </Button>
              <Button
                className="gap-2"
                disabled={pendingId === profile.id}
                variant="secondary"
                onClick={() => duplicateProfile(profile.id)}
              >
                <Copy className="size-4" />
                Duplicate
              </Button>
              <Button
                className="gap-2"
                disabled={pendingId === profile.id}
                variant="destructive"
                onClick={() => deleteProfile(profile.id)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
