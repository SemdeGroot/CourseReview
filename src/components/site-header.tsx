import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/user-menu";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
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
          <span className="text-base">
            CourseReview
            <span className="ml-2 hidden text-xs font-normal text-muted-foreground sm:inline">
              Leiden MSc CS
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                asChild
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/">Add review</Link>
              </Button>
              <UserMenu email={user.email ?? ""} />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/login?redirect=/">Add review</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
