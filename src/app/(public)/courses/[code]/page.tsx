import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Pencil, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/icons/Icon";
import { ReviewCard, type ReviewCardData } from "@/components/review-card";
import { SortDropdown } from "@/components/sort-dropdown";
import {
  SpecializationBadge,
  type SpecializationPill,
} from "@/components/specialization-badge";
import { StatPill } from "@/components/stat-pill";
import {
  DEFAULT_REVIEW_SORT,
  REVIEW_SORT_OPTIONS,
  resolveReviewSort,
} from "@/lib/sort";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteParams = Promise<{ code: string }>;
type SearchParams = Promise<{ sort?: string }>;

export async function generateMetadata({ params }: { params: RouteParams }) {
  const { code } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("courses")
    .select("title, code")
    .eq("code", code)
    .maybeSingle();
  if (!data) return { title: "Course not found" };
  return {
    title: `${data.title} (${data.code}) · CourseReview`,
  };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: RouteParams;
  searchParams: SearchParams;
}) {
  const { code } = await params;
  const { sort } = await searchParams;
  const detail = await fetchCourseDetail(code);
  if (!detail) notFound();

  const { course, specializations } = detail;
  const reviews = await fetchReviews(course.id, sort);

  return (
    <>
      <section
        className="border-b border-border"
        style={{
          background: `linear-gradient(180deg, ${course.color}08 0%, transparent 100%)`,
        }}
      >
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> All courses
          </Link>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span
              className="flex size-14 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: course.color }}
              aria-hidden
            >
              <Icon name={course.icon} size={28} className="text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-mono uppercase tracking-wide text-muted-foreground">
                {course.code} · {course.ec} EC
              </p>
              <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl">
                {course.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {specializations.map((s) => (
                  <SpecializationBadge
                    key={s.code}
                    code={s.code}
                    role={s.role}
                  />
                ))}
              </div>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90 sm:self-start"
            >
              <Link href={`/courses/${course.code}/review`}>
                <Pencil size={16} /> Add review
              </Link>
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 rounded-lg border border-border bg-card p-5 sm:grid-cols-4">
            <StatPill
              label="Rating"
              value={course.avg_rating ? course.avg_rating.toFixed(1) : "—"}
              hint={course.avg_rating ? "/ 5" : undefined}
            />
            <StatPill
              label="Difficulty"
              value={course.avg_difficulty ? course.avg_difficulty.toFixed(1) : "—"}
              hint={course.avg_difficulty ? "/ 5" : undefined}
            />
            <StatPill
              label="Workload"
              value={course.avg_workload ? course.avg_workload.toFixed(1) : "—"}
              hint={course.avg_workload ? "h/wk" : undefined}
            />
            <StatPill label="Reviews" value={course.review_count} />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="order-2 lg:order-1">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Student reviews{" "}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  ({course.review_count})
                </span>
              </h2>
              {reviews.length > 0 && (
                <SortDropdown
                  options={REVIEW_SORT_OPTIONS}
                  defaultValue={DEFAULT_REVIEW_SORT}
                />
              )}
            </div>

            {reviews.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
                <Star size={24} className="mx-auto text-accent" />
                <h3 className="mt-2 text-base font-semibold text-foreground">
                  No reviews yet
                </h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Be the first to share your experience with this course.
                </p>
                <Button
                  asChild
                  className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  <Link href={`/courses/${course.code}/review`}>
                    <Pencil size={14} /> Write the first review
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
          </div>

          <aside className="order-1 space-y-5 lg:order-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                About this course
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {course.description}
              </p>
              <a
                href={course.studiegids_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                View in studiegids <ExternalLink size={12} />
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

async function fetchCourseDetail(code: string) {
  const supabase = await createSupabaseServerClient();
  const { data: course } = await supabase
    .from("courses_with_stats")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!course?.id) return null;

  const [{ data: mapping }, { data: specs }] = await Promise.all([
    supabase
      .from("course_specializations")
      .select("role, specialization_id")
      .eq("course_id", course.id),
    supabase.from("specializations").select("id, code, name"),
  ]);

  const specLookup = new Map<number, { code: string; name: string }>();
  for (const s of specs ?? []) {
    specLookup.set(s.id, { code: s.code, name: s.name });
  }

  const specializations: SpecializationPill[] = [];
  for (const row of mapping ?? []) {
    const spec = specLookup.get(row.specialization_id);
    if (!spec) continue;
    specializations.push({
      code: spec.code,
      name: spec.name,
      role: row.role as "core" | "elective",
    });
  }
  specializations.sort((a, b) => {
    if (a.role !== b.role) return a.role === "core" ? -1 : 1;
    return a.code.localeCompare(b.code);
  });

  return {
    course: {
      id: course.id,
      code: course.code ?? code,
      title: course.title ?? "Untitled course",
      description: course.description ?? "",
      studiegids_url: course.studiegids_url ?? "#",
      color: course.color ?? "#001158",
      icon: course.icon ?? "book-open",
      ec: Number(course.ec ?? 6),
      avg_rating: Number(course.avg_rating ?? 0),
      avg_difficulty: Number(course.avg_difficulty ?? 0),
      avg_workload: Number(course.avg_workload ?? 0),
      review_count: Number(course.review_count ?? 0),
    },
    specializations,
  };
}

async function fetchReviews(
  courseId: string,
  sort: string | undefined,
): Promise<ReviewCardData[]> {
  const supabase = await createSupabaseServerClient();
  const sortOption = resolveReviewSort(sort);
  const { data } = await supabase
    .from("reviews_public")
    .select("*")
    .eq("course_id", courseId)
    .order(sortOption.column, { ascending: sortOption.ascending });

  return (data ?? [])
    .filter((r) => r.id && r.title && r.body && r.created_at)
    .map((r) => ({
      id: r.id!,
      title: r.title!,
      body: r.body!,
      rating: Number(r.rating ?? 0),
      difficulty: Number(r.difficulty ?? 0),
      workload_hours: Number(r.workload_hours ?? 0),
      created_at: r.created_at!,
    }));
}
