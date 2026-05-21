import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { Icon } from "@/lib/icons/Icon";
import { Rating } from "@/components/rating";
import {
  SpecializationBadge,
  type SpecializationPill,
} from "@/components/specialization-badge";
import { cn } from "@/lib/utils";

export type CourseListItem = {
  id: string;
  code: string;
  title: string;
  color: string;
  icon: string;
  avg_rating: number;
  avg_difficulty: number;
  avg_workload: number;
  review_count: number;
  specializations: SpecializationPill[];
};

type Props = {
  courses: CourseListItem[];
  animated?: boolean;
  listKey?: number;
};

export function CourseList({ courses, animated = false, listKey = 0 }: Props) {
  if (courses.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <h3 className="text-base font-semibold text-foreground">No courses found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Try a different search or clear the filter.
        </p>
      </div>
    );
  }

  return (
    <>
      <DesktopTable courses={courses} animated={animated} listKey={listKey} />
      <MobileCards courses={courses} animated={animated} listKey={listKey} />
    </>
  );
}

function DesktopTable({ courses, animated = false, listKey = 0 }: Props) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Course</th>
            <th className="px-3 py-3 text-left font-medium">Code</th>
            <th className="px-3 py-3 text-left font-medium">Rating</th>
            <th className="px-3 py-3 text-left font-medium">Difficulty</th>
            <th className="px-3 py-3 text-left font-medium">Workload</th>
            <th className="px-3 py-3 text-right font-medium">Reviews</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <CourseRow
              key={`${listKey}-${course.id}`}
              course={course}
              animated={animated}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CourseRow({
  course,
  animated,
}: {
  course: CourseListItem;
  animated: boolean;
}) {
  return (
    <tr
      className={cn(
        "group border-b border-border last:border-0 transition-colors hover:bg-secondary/50",
        animated && "animate-fade-up",
      )}
    >
      <td className="px-4 py-3">
        <Link href={`/courses/${course.code}`} className="flex items-start gap-3">
          <span
            className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md text-white"
            style={{ backgroundColor: course.color }}
          >
            <Icon name={course.icon} size={16} className="text-white" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-foreground group-hover:text-primary">
              {course.title}
            </span>
            <span className="mt-1 flex flex-wrap gap-1">
              {course.specializations.slice(0, 5).map((s) => (
                <SpecializationBadge key={s.code} code={s.code} role={s.role} />
              ))}
            </span>
          </span>
        </Link>
      </td>
      <td className="px-3 py-3 align-middle text-xs font-mono text-muted-foreground">
        {course.code}
      </td>
      <td className="px-3 py-3 align-middle">
        <Rating value={course.avg_rating} />
      </td>
      <td className="px-3 py-3 align-middle">
        <StatCell value={course.avg_difficulty} suffix="/ 5" />
      </td>
      <td className="px-3 py-3 align-middle">
        <StatCell value={course.avg_workload} suffix="h/wk" />
      </td>
      <td className="px-3 py-3 align-middle text-right">
        <span className="inline-flex items-center gap-1 text-sm tabular-nums text-foreground">
          <MessageSquare size={12} className="text-muted-foreground" />
          {course.review_count}
        </span>
      </td>
    </tr>
  );
}

function StatCell({ value, suffix }: { value: number; suffix: string }) {
  if (!value) return <span className="text-muted-foreground">-</span>;
  return (
    <span className="inline-flex items-baseline gap-1 tabular-nums">
      <span className="text-sm font-medium text-foreground">{value.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">{suffix}</span>
    </span>
  );
}

function MobileCards({ courses, animated = false, listKey = 0 }: Props) {
  return (
    <div className="space-y-3 md:hidden">
      {courses.map((course) => (
        <Link
          key={`${listKey}-${course.id}`}
          href={`/courses/${course.code}`}
          className={cn(
            "block rounded-lg border border-border bg-card p-4 shadow-sm transition-colors",
            "hover:border-primary/30 hover:bg-secondary/30",
            animated && "animate-fade-up",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-md text-white"
              style={{ backgroundColor: course.color }}
            >
              <Icon name={course.icon} size={20} className="text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-snug text-foreground">
                  {course.title}
                </h3>
                <span className="text-xs font-mono text-muted-foreground shrink-0">
                  {course.code}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {course.specializations.slice(0, 4).map((s) => (
                  <SpecializationBadge key={s.code} code={s.code} role={s.role} />
                ))}
              </div>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3 text-xs">
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Rating</dt>
              <dd className="mt-0.5">
                <Rating value={course.avg_rating} size="sm" />
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Diff.</dt>
              <dd className="mt-0.5 font-medium tabular-nums">
                {course.avg_difficulty ? course.avg_difficulty.toFixed(1) : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Work</dt>
              <dd className="mt-0.5 font-medium tabular-nums">
                {course.avg_workload ? `${course.avg_workload.toFixed(1)}h` : "-"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Reviews</dt>
              <dd className="mt-0.5 font-medium tabular-nums">{course.review_count}</dd>
            </div>
          </dl>
        </Link>
      ))}
    </div>
  );
}
