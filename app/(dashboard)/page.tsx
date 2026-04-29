import Link from "next/link";
import { ArrowRight, FileStack, Sparkles, WandSparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: FileStack,
    title: "Profile Library",
    description: "Save multiple source profiles and keep each resume history organized in one place.",
  },
  {
    icon: WandSparkles,
    title: "Tailor Fast",
    description: "Generate a tailored version using global controls for summary, titles, bullets, and skills.",
  },
  {
    icon: Sparkles,
    title: "Preview And Download",
    description: "Edit side-by-side with a live PDF preview before downloading the finished resume.",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-card p-8 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Dashboard</p>
          <h2 className="text-4xl font-semibold tracking-tight">Build targeted resumes from one reusable profile source.</h2>
          <p className="text-base text-muted-foreground">
            Create canonical profiles, tailor them for specific opportunities, and export polished PDFs from the same dashboard.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link className="inline-flex items-center gap-2" href="/resume">
                Open resume workspace
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <Card key={feature.title}>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="pt-3">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Start inside the Resume menu to create a profile or continue tailoring an existing one.
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
