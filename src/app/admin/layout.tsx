import { notFound } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { AdminNav } from "@/components/admin-nav";
import { AdminSignOut } from "@/components/admin-sign-out";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-leiden-surface">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/admin/courses"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span
              className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
              aria-hidden
            >
              <ShieldCheck size={18} />
            </span>
            Admin
            <span className="ml-2 hidden text-xs font-normal text-muted-foreground sm:inline">
              CourseReview
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {user.email}
            </span>
            <AdminSignOut />
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6">
        <AdminNav />
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
