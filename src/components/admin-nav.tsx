"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/admins", label: "Admins" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 border-b border-border">
      {TABS.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "relative px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
