"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function signOut() {
    setIsSigningOut(true);

    try {
      await fetch("/api/auth/signout", {
        method: "POST",
      });
      router.push("/signin");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <Button className="w-full justify-start" disabled={isSigningOut} variant="ghost" onClick={signOut}>
      <LogOut className="size-4" />
      {isSigningOut ? "Signing out..." : "Sign out"}
    </Button>
  );
}
