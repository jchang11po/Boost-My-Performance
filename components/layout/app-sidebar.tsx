"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Menu, Settings, Sparkles, X } from "lucide-react";
import { useState } from "react";

import { SignOutButton } from "@/components/auth/signout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/resume",
    label: "Resume",
    icon: Sparkles,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

type SidebarUser = {
  email: string;
  name: string | null;
};

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
            href={item.href}
            onClick={onNavigate}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function UserPanel({ user }: { user: SidebarUser }) {
  return (
    <div className="space-y-3 border-t border-border p-4">
      <div>
        <p className="text-sm font-medium">{user.name || user.email}</p>
        {user.name ? <p className="text-xs text-muted-foreground">{user.email}</p> : null}
      </div>
      <SignOutButton />
    </div>
  );
}

export function AppSidebar({ user }: { user: SidebarUser }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card/60 md:flex md:flex-col">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Boost My Performance</p>
            <h1 className="mt-1 text-lg font-semibold">Tailored Resume Tool</h1>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex-1 px-4 py-4">
          <SidebarNav />
        </div>
        <UserPanel user={user} />
      </aside>

      <div className="border-b border-border bg-card/80 px-4 py-4 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Boost My Performance</p>
            <h1 className="text-base font-semibold">Tailored Resume Tool</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button size="icon" variant="outline" onClick={() => setOpen(true)}>
              <Menu className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
          <div className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <h2 className="text-base font-semibold">Navigation</h2>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 px-4 py-4">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
            <UserPanel user={user} />
          </div>
        </div>
      ) : null}
    </>
  );
}
