import Link from "next/link";
import { ArrowRight, Search, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CourseList, type CourseListItem } from "@/components/course-list";
import { SearchInput } from "@/components/search-input";
import { SortDropdown } from "@/components/sort-dropdown";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  COURSE_SORT_OPTIONS,
  DEFAULT_COURSE_SORT,
  resolveCourseSort,
} from "@/lib/sort";
import type { SpecializationPill } from "@/components/specialization-badge";

type SearchParams = Promise<{ q?: string; sort?: string }>;

export default async function LandingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q, sort } = await searchParams;
  const courses = await fetchCourses({ q, sort });

  return (
    <>
      <section className="border-b border-border bg-gradient-to-b from-leiden-surface to-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Star size={14} className="text-accent" /> Anonymous reviews by Leiden CS students
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
            Pick the right courses. Skip the regrets.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Honest ratings on difficulty, workload, and teaching quality for every course in the
            MSc Computer Science program at Universiteit Leiden — written by students who actually
            took them.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="#courses">
                Browse courses <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">All courses</h2>
            <p className="text-sm text-muted-foreground">
              {courses.length} course{courses.length === 1 ? "" : "s"} across 7 specializations
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput className="w-full sm:w-64" />
            <SortDropdown
              options={COURSE_SORT_OPTIONS}
              defaultValue={DEFAULT_COURSE_SORT}
            />
          </div>
        </div>

        <CourseList courses={courses} />

        {courses.length > 0 && (
          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Search size={12} /> Click any course to read reviews or add your own.
          </p>
        )}
      </section>
    </>
  );
}

async function fetchCourses({
  q,
  sort,
}: {
  q?: string;
  sort?: string;
}): Promise<CourseListItem[]> {
  const supabase = await createSupabaseServerClient();
  const sortOption = resolveCourseSort(sort);

  let query = supabase
    .from("courses_with_stats")
    .select("*")
    .order(sortOption.column, { ascending: sortOption.ascending });

  if (q && q.trim()) {
    const pattern = `%${q.trim()}%`;
    query = query.or(`title.ilike.${pattern},code.ilike.${pattern}`);
  }

  const { data: coursesData, error: coursesError } = await query;
  if (coursesError) {
    console.error("Failed to load courses", coursesError);
    return [];
  }
  const courses = (coursesData ?? []).filter((c) => c.id && c.code && c.title);
  if (courses.length === 0) return [];

  const courseIds = courses.map((c) => c.id!) ;

  const [{ data: mappingData }, { data: specsData }] = await Promise.all([
    supabase
      .from("course_specializations")
      .select("course_id, role, specialization_id")
      .in("course_id", courseIds),
    supabase.from("specializations").select("id, code, name"),
  ]);

  const specLookup = new Map<number, { code: string; name: string }>();
  for (const s of specsData ?? []) {
    specLookup.set(s.id, { code: s.code, name: s.name });
  }

  const specsByCourse = new Map<string, SpecializationPill[]>();
  for (const m of mappingData ?? []) {
    const spec = specLookup.get(m.specialization_id);
    if (!spec) continue;
    const list = specsByCourse.get(m.course_id) ?? [];
    list.push({ code: spec.code, name: spec.name, role: m.role as "core" | "elective" });
    specsByCourse.set(m.course_id, list);
  }
  for (const list of specsByCourse.values()) {
    list.sort((a, b) => {
      if (a.role !== b.role) return a.role === "core" ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }

  return courses.map((c) => ({
    id: c.id!,
    code: c.code!,
    title: c.title!,
    color: c.color ?? "#001158",
    icon: c.icon ?? "book-open",
    avg_rating: Number(c.avg_rating ?? 0),
    avg_difficulty: Number(c.avg_difficulty ?? 0),
    avg_workload: Number(c.avg_workload ?? 0),
    review_count: Number(c.review_count ?? 0),
    specializations: specsByCourse.get(c.id!) ?? [],
  }));
}
