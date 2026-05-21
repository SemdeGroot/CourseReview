import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import type { SpecializationPill } from "@/components/specialization-badge";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase public environment variables.");
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function GET() {
  const supabase = createPublicSupabaseClient();

  const [coursesRes, mappingRes, specsRes] = await Promise.all([
    supabase
      .from("courses_with_stats")
      .select("*")
      .order("review_count", { ascending: false }),
    supabase
      .from("course_specializations")
      .select("course_id, role, specialization_id"),
    supabase
      .from("specializations")
      .select("id, code, name")
      .order("id", { ascending: true }),
  ]);

  if (coursesRes.error || mappingRes.error || specsRes.error) {
    console.error("Failed to load public course overview", {
      coursesError: coursesRes.error,
      mappingError: mappingRes.error,
      specializationsError: specsRes.error,
    });

    return NextResponse.json(
      { error: "Could not load the course catalogue." },
      { status: 500 },
    );
  }

  const specLookup = new Map<number, { code: string; name: string }>();
  for (const specialization of specsRes.data ?? []) {
    specLookup.set(specialization.id, {
      code: specialization.code,
      name: specialization.name,
    });
  }

  const specsByCourse = new Map<string, SpecializationPill[]>();
  for (const mapping of mappingRes.data ?? []) {
    const specialization = specLookup.get(mapping.specialization_id);
    if (!specialization) continue;

    const list = specsByCourse.get(mapping.course_id) ?? [];
    list.push({
      code: specialization.code,
      name: specialization.name,
      role: mapping.role as "core" | "elective",
    });
    specsByCourse.set(mapping.course_id, list);
  }

  for (const list of specsByCourse.values()) {
    list.sort((a, b) => {
      if (a.role !== b.role) return a.role === "core" ? -1 : 1;
      return a.code.localeCompare(b.code);
    });
  }

  const courses = (coursesRes.data ?? [])
    .filter((course) => course.id && course.code && course.title)
    .map((course) => ({
      id: course.id!,
      code: course.code!,
      title: course.title!,
      color: course.color ?? "#001158",
      icon: course.icon ?? "book-open",
      avg_rating: Number(course.avg_rating ?? 0),
      avg_difficulty: Number(course.avg_difficulty ?? 0),
      avg_workload: Number(course.avg_workload ?? 0),
      review_count: Number(course.review_count ?? 0),
      specializations: specsByCourse.get(course.id!) ?? [],
    }));

  return NextResponse.json({
    courses,
    specializationCount: specsRes.data?.length ?? 0,
  });
}
