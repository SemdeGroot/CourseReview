import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminIndex() {
  const supabase = await createSupabaseServerClient();
  const {
    error: userError,
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (userError) console.error("Admin index user lookup failed", userError);
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) {
    console.error("Admin index role lookup failed", adminError);
    notFound();
  }
  if (!isAdmin) {
    notFound();
  }

  redirect("/admin/courses");
}
