"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { CourseBrowser } from "@/components/course-browser";
import { CourseBrowserSkeleton } from "@/components/course-browser-skeleton";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourseListItem } from "@/components/course-list";

type CourseOverviewResponse = {
  courses: CourseListItem[];
  specializationCount: number;
};

export function PublicCourseOverview() {
  const [data, setData] = useState<CourseOverviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      setError(null);

      try {
        const response = await fetch("/api/public/course-overview", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Could not load courses.");
        }

        setData(await response.json());
      } catch (caughtError) {
        if (controller.signal.aborted) return;
        console.error("Failed to load public course overview", caughtError);
        setError("Could not load the course catalogue. Refresh the page or try again.");
      }
    }

    loadCourses();

    return () => controller.abort();
  }, [retryKey]);

  if (error) {
    return (
      <section id="courses" className="site-gutter mx-auto w-full max-w-6xl py-10">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-xl font-semibold text-foreground">Courses</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => setRetryKey((current) => current + 1)}
          >
            Try again
          </Button>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section id="courses" className="site-gutter mx-auto w-full max-w-6xl py-10">
        <CourseOverviewSkeleton />
      </section>
    );
  }

  return (
    <section id="courses" className="site-gutter animate-fade-up-d3 mx-auto w-full max-w-6xl py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">All courses</h2>
          <p className="text-sm text-muted-foreground">
            {data.courses.length} courses across {data.specializationCount} specializations
          </p>
        </div>
      </div>

      <CourseBrowser courses={data.courses} />

      {data.courses.length > 0 && (
        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Search size={12} /> Open a course to read reviews or share your experience.
        </p>
      )}
    </section>
  );
}

function CourseOverviewSkeleton() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
      </div>
      <CourseBrowserSkeleton />
    </>
  );
}
