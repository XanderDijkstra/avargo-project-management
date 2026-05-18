"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  KanbanSquare,
  type LucideIcon,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matches: (pathname: string) => boolean;
};

const NAV: NavItem[] = [
  {
    href: "/",
    label: "Pipeline",
    icon: KanbanSquare,
    matches: (p) => p === "/",
  },
  {
    href: "/engagements",
    label: "Engasjementer",
    icon: Users,
    matches: (p) => p.startsWith("/engagements"),
  },
  {
    href: "/sops",
    label: "SOPs",
    icon: BookOpen,
    matches: (p) => p.startsWith("/sops"),
  },
];

export function Sidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <aside className="hidden border-r border-gray-200 bg-white md:flex md:w-60 md:flex-col">
      <div className="flex h-14 items-center border-b border-gray-200 px-5">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Avargo
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {NAV.map((item) => {
          const active = item.matches(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-brand"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon className={cn("h-4 w-4", active ? "text-brand" : "text-gray-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-4 text-xs text-gray-400">
        v0.2
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname() ?? "/";

  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:hidden">
      <Link href="/" className="text-base font-semibold tracking-tight">
        Avargo
      </Link>
      <nav className="flex items-center gap-1">
        {NAV.map((item) => {
          const active = item.matches(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                active
                  ? "bg-blue-50 text-brand"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <Icon className="h-4 w-4" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
