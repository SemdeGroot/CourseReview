"use client";

import { useDeferredValue, useState } from "react";

import { CourseList, type CourseListItem } from "@/components/course-list";
import { SearchInput } from "@/components/search-input";
import { SortDropdown } from "@/components/sort-dropdown";
import { Button } from "@/components/ui/button";
import {
  COURSE_SORT_OPTIONS,
  DEFAULT_COURSE_SORT,
  resolveCourseSort,
} from "@/lib/sort";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE_COURSES = 20;
const VISIBLE_COURSE_INCREMENT = 20;

type Props = {
  courses: CourseListItem[];
};

export function CourseBrowser({ courses }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(DEFAULT_COURSE_SORT);
  const [sortAnimationVersion, setSortAnimationVersion] = useState(0);
  const [shouldAnimateList, setShouldAnimateList] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COURSES);
  const deferredQuery = useDeferredValue(query);

  const sortOption = resolveCourseSort(sort);

  function handleSort(value: string) {
    setSort(value);
    setSortAnimationVersion((version) => version + 1);
    setShouldAnimateList(true);
    setVisibleCount(INITIAL_VISIBLE_COURSES);
  }

  function handleQuery(value: string) {
    setQuery(value);
    setShouldAnimateList(false);
    setVisibleCount(INITIAL_VISIBLE_COURSES);
  }

  const filteredCourses = courses.filter((course) => {
    const needle = deferredQuery.trim().toLowerCase();
    if (!needle) return true;

    return [
      course.title,
      course.code,
      ...course.specializations.map((specialization) => specialization.name),
      ...course.specializations.map((specialization) => specialization.code),
    ].some((value) => value.toLowerCase().includes(needle));
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    const left = a[sortOption.column as keyof CourseListItem];
    const right = b[sortOption.column as keyof CourseListItem];

    if (typeof left === "number" && typeof right === "number") {
      return sortOption.ascending ? left - right : right - left;
    }

    const leftText = String(left ?? "");
    const rightText = String(right ?? "");
    return sortOption.ascending
      ? leftText.localeCompare(rightText, "en")
      : rightText.localeCompare(leftText, "en");
  });
  const visibleCourses = sortedCourses.slice(0, visibleCount);
  const hasMoreCourses = visibleCourses.length < sortedCourses.length;
  const shouldUseScrollContainer = sortedCourses.length > 8;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <SearchInput className="w-full sm:max-w-md" value={query} onChange={handleQuery} />
        <SortDropdown options={COURSE_SORT_OPTIONS} value={sort} onChange={handleSort} />
      </div>
      <div
        className={cn(
          shouldUseScrollContainer && "max-h-[560px] overflow-y-auto rounded-lg border border-border pr-1",
        )}
      >
        <CourseList
          courses={visibleCourses}
          animated={shouldAnimateList}
          listKey={sortAnimationVersion}
        />
        {hasMoreCourses ? (
          <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <p className="text-xs text-muted-foreground">
              Showing {visibleCourses.length} of {sortedCourses.length} courses
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hover:bg-secondary hover:text-foreground"
              onClick={() => setVisibleCount((current) => current + VISIBLE_COURSE_INCREMENT)}
            >
              Show more
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
