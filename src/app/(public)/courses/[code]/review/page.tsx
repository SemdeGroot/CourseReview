import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ReviewFlow } from "@/components/review-flow";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteParams = Promise<{ code: string }>;

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: RouteParams }) {
  const { code } = await params;
  return { title: `Review ${code} · CourseReview` };
}

export default async function AddReviewPage({ params }: { params: RouteParams }) {
  const { code } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, code, title")
    .eq("code", code)
    .maybeSingle();
  if (!course) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={`/courses/${course.code}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to {course.code}
      </Link>
      <ReviewFlow
        course={{ id: course.id, code: course.code, title: course.title }}
        initialEmail={user?.email ?? null}
      />
    </div>
  );
}
