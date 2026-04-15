"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const reviewInputSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(120),
  body: z.string().trim().min(10, "Review must be at least 10 characters.").max(4000),
  rating: z.number().int().min(1).max(5),
  difficulty: z.number().int().min(1).max(5),
  workload_hours: z.number().int().min(1).max(80),
});

export type ReviewSubmitResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

export async function submitReviewAction(
  input: z.input<typeof reviewInputSchema>,
): Promise<ReviewSubmitResult> {
  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      ok: false,
      error: "Your session expired. Verify your email again.",
    };
  }

  const { courseId, ...rest } = parsed.data;

  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("code")
    .eq("id", courseId)
    .maybeSingle();
  if (courseError || !course) {
    return { ok: false, error: "Course not found." };
  }

  const { error } = await supabase.from("reviews").insert({
    course_id: courseId,
    author_id: user.id,
    ...rest,
  });
  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        error: "You already reviewed this course. Ask an admin to remove your existing review first.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath(`/courses/${course.code}`);
  return { ok: true, redirectTo: `/courses/${course.code}` };
}
