"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .refine((v) => v.endsWith("@umail.leidenuniv.nl"), {
    message: "Only @umail.leidenuniv.nl addresses are allowed.",
  });

const verifySchema = z.object({
  email: emailSchema,
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code."),
});

const OPAQUE_ERROR = "Verification failed. Check your code and try again.";

async function currentAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    error: userError,
    data: { user },
  } = await supabase.auth.getUser();
  if (userError) {
    console.error("Admin user lookup failed", userError);
    return null;
  }
  if (!user) return null;
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) {
    console.error("Admin role lookup failed", adminError);
    return null;
  }
  if (!isAdmin) return null;
  return user;
}

/**
 * Verify OTP and gate admin access. On success, sets the session and reports
 * success to the client. If the verified user is not on the whitelist, the
 * session is revoked immediately and a generic error is returned so admin
 * existence does not leak.
 */
export async function verifyAdminOtpAction(
  email: string,
  code: string,
): Promise<{ ok: true; redirectTo: string } | { ok: false; error: string }> {
  const parsed = verifySchema.safeParse({ email, code });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? OPAQUE_ERROR };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "email",
  });
  if (error) {
    console.error("Admin OTP verification failed", error);
    return { ok: false, error: OPAQUE_ERROR };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error("Admin OTP verified but user lookup failed", userError);
    await supabase.auth.signOut();
    return { ok: false, error: OPAQUE_ERROR };
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");
  if (adminError) {
    console.error("Admin OTP role lookup failed", adminError);
    await supabase.auth.signOut();
    return { ok: false, error: OPAQUE_ERROR };
  }
  if (!isAdmin) {
    await supabase.auth.signOut();
    return { ok: false, error: OPAQUE_ERROR };
  }
  return { ok: true, redirectTo: "/admin/courses" };
}

export async function adminSignOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteCourseAction(
  courseId: string,
): Promise<ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: "Forbidden." };

  const supabase = await createSupabaseServerClient();
  const { data: course } = await supabase
    .from("courses")
    .select("code")
    .eq("id", courseId)
    .maybeSingle();
  const { error } = await supabase.from("courses").delete().eq("id", courseId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/courses");
  if (course?.code) revalidatePath(`/courses/${course.code}`);
  return { ok: true };
}

export async function deleteReviewAction(
  reviewId: string,
): Promise<ActionResult> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: "Forbidden." };

  const supabase = await createSupabaseServerClient();
  const { data: review } = await supabase
    .from("reviews")
    .select("course_id, courses(code)")
    .eq("id", reviewId)
    .maybeSingle();
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/reviews");
  if (review?.courses?.code) revalidatePath(`/courses/${review.courses.code}`);
  return { ok: true };
}
