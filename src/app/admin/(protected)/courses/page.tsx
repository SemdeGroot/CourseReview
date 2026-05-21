import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteButton } from "@/components/confirm-delete-button";
import { Icon } from "@/lib/icons/Icon";
import {
  SpecializationBadge,
  type SpecializationPill,
} from "@/components/specialization-badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteCourseAction } from "@/server-actions/admin";

export const metadata = { title: "Admin · Courses" };

export default async function AdminCoursesPage() {
  const supabase = await createSupabaseServerClient();

  const [coursesRes, mappingRes, specsRes] = await Promise.all([
    supabase
      .from("courses_with_stats")
      .select("*")
      .order("code", { ascending: true }),
    supabase.from("course_specializations").select("*"),
    supabase.from("specializations").select("id, code, name"),
  ]);

  const specLookup = new Map<number, { code: string; name: string }>();
  for (const s of specsRes.data ?? []) {
    specLookup.set(s.id, { code: s.code, name: s.name });
  }
  const specsByCourse = new Map<string, SpecializationPill[]>();
  for (const m of mappingRes.data ?? []) {
    const spec = specLookup.get(m.specialization_id);
    if (!spec) continue;
    const list = specsByCourse.get(m.course_id) ?? [];
    list.push({
      code: spec.code,
      name: spec.name,
      role: m.role as "core" | "elective",
    });
    specsByCourse.set(m.course_id, list);
  }

  const courses = (coursesRes.data ?? []).filter((c) => c.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Courses
          </h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} course{courses.length === 1 ? "" : "s"} in the catalog.
          </p>
        </div>
        <Button
          disabled
          title="Add course modal lands in the next step"
          className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
        >
          <Plus size={14} /> Add course
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Course</th>
              <th className="px-3 py-3 text-left font-medium">Code</th>
              <th className="px-3 py-3 text-right font-medium">Reviews</th>
              <th className="px-3 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => {
              const specs = specsByCourse.get(course.id!) ?? [];
              return (
                <tr
                  key={course.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-white"
                        style={{ backgroundColor: course.color ?? "#001158" }}
                      >
                        <Icon
                          name={course.icon}
                          size={16}
                          className="text-white"
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-foreground">
                          {course.title}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {specs.slice(0, 6).map((s) => (
                            <SpecializationBadge
                              key={s.code}
                              code={s.code}
                              role={s.role}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-middle font-mono text-xs text-muted-foreground">
                    {course.code}
                  </td>
                  <td className="px-3 py-3 text-right align-middle tabular-nums">
                    {course.review_count ?? 0}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                      >
                        <Link
                          href={`/courses/${course.code}`}
                          target="_blank"
                        >
                          <ExternalLink size={14} />
                          <span className="sr-only sm:not-sr-only">View</span>
                        </Link>
                      </Button>
                      <ConfirmDeleteButton
                        title={`Delete "${course.title}"?`}
                        description="This will permanently remove the course and cascade-delete all its reviews. This cannot be undone."
                        action={async () => deleteCourseAction(course.id!)}
                        successMessage="Course deleted."
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
