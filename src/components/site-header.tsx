import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-secondary">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span
            className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
            aria-hidden
          >
            <GraduationCap size={18} />
          </span>
          <span className="flex items-baseline gap-2 text-base">
            <span className="sm:hidden">
              LeidenCS{" "}
              <span className="text-xs font-normal text-muted-foreground">
                MSCS Reviews
              </span>
            </span>
            <span className="hidden sm:inline">LeidenCS</span>
            <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
              MSc Computer Science Reviews
            </span>
          </span>
        </Link>
        <Button
          asChild
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Link href="/#courses">Browse courses</Link>
        </Button>
      </div>
    </header>
  );
}
