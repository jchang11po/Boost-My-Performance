import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";

function safeNextPath(next?: string) {
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/resume";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    redirect(safeNextPath(next));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <AuthForm mode="signin" nextPath={next} />
    </main>
  );
}
