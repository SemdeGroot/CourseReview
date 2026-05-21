import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminIndex() {
  const supabase = await createSupabaseServerClient();
  const [userResult, adminResult] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
  ]);
  const {
    data: { user },
  } = userResult;

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin } = adminResult;
  if (!isAdmin) {
    notFound();
  }

  redirect("/admin/courses");
}
