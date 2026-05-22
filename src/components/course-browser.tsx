"use client";

import type { ReactNode } from "react";
import { useDeferredValue, useEffect, useRef, useState } from "react";

import { CourseList, type CourseListItem } from "@/components/course-list";
import { SearchInput } from "@/components/search-input";
import { SortDropdown } from "@/components/sort-dropdown";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  COURSE_SORT_OPTIONS,
  DEFAULT_COURSE_SORT,
  resolveCourseSort,
} from "@/lib/sort";
import { cn } from "@/lib/utils";

const INITIAL_VISIBLE_COURSES = 20;
const VISIBLE_COURSE_INCREMENT = 20;
const ALL_SPECIALIZATIONS = "all-specializations";
const ALL_SEMESTERS = "all-semesters";

type Props = {
  courses: CourseListItem[];
};

export function CourseBrowser({ courses }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(DEFAULT_COURSE_SORT);
  const [specialization, setSpecialization] = useState(ALL_SPECIALIZATIONS);
  const [semester, setSemester] = useState(ALL_SEMESTERS);
  const [sortAnimationVersion, setSortAnimationVersion] = useState(0);
  const [shouldAnimateList, setShouldAnimateList] = useState(false);
  const [highlightFromIndex, setHighlightFromIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COURSES);
  const deferredQuery = useDeferredValue(query);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const sortOption = resolveCourseSort(sort);
  const specializationOptions = Array.from(
    courses.reduce((options, course) => {
      for (const courseSpecialization of course.specializations) {
        options.set(
          courseSpecialization.code,
          `${courseSpecialization.code.toUpperCase()} - ${courseSpecialization.name}`,
        );
      }
      return options;
    }, new Map<string, string>()),
  ).sort((a, b) => a[0].localeCompare(b[0]));
  const activeFilterCount =
    (specialization !== ALL_SPECIALIZATIONS ? 1 : 0) +
    (semester !== ALL_SEMESTERS ? 1 : 0);

  function handleSort(value: string) {
    setSort(value);
    setSortAnimationVersion((version) => version + 1);
    setShouldAnimateList(true);
    setHighlightFromIndex(null);
    setVisibleCount(INITIAL_VISIBLE_COURSES);
  }

  function handleQuery(value: string) {
    setQuery(value);
    setShouldAnimateList(false);
    setHighlightFromIndex(null);
    setVisibleCount(INITIAL_VISIBLE_COURSES);
  }

  function handleSpecialization(value: string) {
    setSpecialization(value);
    setShouldAnimateList(false);
    setHighlightFromIndex(null);
    setVisibleCount(INITIAL_VISIBLE_COURSES);
  }

  function handleSemester(value: string) {
    setSemester(value);
    setShouldAnimateList(false);
    setHighlightFromIndex(null);
    setVisibleCount(INITIAL_VISIBLE_COURSES);
  }

  function clearFilters() {
    setSpecialization(ALL_SPECIALIZATIONS);
    setSemester(ALL_SEMESTERS);
    setShouldAnimateList(false);
    setHighlightFromIndex(null);
    setVisibleCount(INITIAL_VISIBLE_COURSES);
  }

  const filteredCourses = courses.filter((course) => {
    const needle = deferredQuery.trim().toLowerCase();
    const matchesSearch =
      !needle ||
      [
        course.title,
        course.code,
        ...course.specializations.map((courseSpecialization) => courseSpecialization.name),
        ...course.specializations.map((courseSpecialization) => courseSpecialization.code),
      ].some((value) => value.toLowerCase().includes(needle));
    const matchesSpecialization =
      specialization === ALL_SPECIALIZATIONS ||
      course.specializations.some(
        (courseSpecialization) => courseSpecialization.code === specialization,
      );
    const matchesSemester =
      semester === ALL_SEMESTERS || course.offered_semesters.includes(semester);

    return matchesSearch && matchesSpecialization && matchesSemester;
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

  useEffect(() => {
    if (highlightFromIndex === null) return;

    const timeoutId = window.setTimeout(() => {
      setHighlightFromIndex(null);
    }, 1100);

    return () => window.clearTimeout(timeoutId);
  }, [highlightFromIndex]);

  useEffect(() => {
    if (highlightFromIndex === null) return;

    const newCourse = Array.from(
      listContainerRef.current?.querySelectorAll<HTMLElement>(
        "[data-new-course='true']",
      ) ?? [],
    ).find((element) => element.offsetParent !== null);
    newCourse?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightFromIndex, visibleCourses.length]);

  function handleShowMore() {
    setHighlightFromIndex(visibleCourses.length);
    setVisibleCount((current) => current + VISIBLE_COURSE_INCREMENT);
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
        <SearchInput className="w-full sm:max-w-md" value={query} onChange={handleQuery} />
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_180px_220px_auto]">
          <FilterSelect
            label="Specialization"
            value={specialization}
            onChange={handleSpecialization}
          >
            <SelectItem value={ALL_SPECIALIZATIONS}>All specializations</SelectItem>
            {specializationOptions.map(([code, label]) => (
              <SelectItem key={code} value={code}>
                {label}
              </SelectItem>
            ))}
          </FilterSelect>
          <FilterSelect label="Semester" value={semester} onChange={handleSemester}>
            <SelectItem value={ALL_SEMESTERS}>All semesters</SelectItem>
            <SelectItem value="S1">Semester 1</SelectItem>
            <SelectItem value="S2">Semester 2</SelectItem>
          </FilterSelect>
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Sort by</span>
            <SortDropdown
              options={COURSE_SORT_OPTIONS}
              value={sort}
              onChange={handleSort}
              className="w-full"
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={activeFilterCount === 0}
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </div>
      <div
        ref={listContainerRef}
        className={cn(
          shouldUseScrollContainer && "max-h-[560px] overflow-y-auto rounded-lg border border-border pr-1",
        )}
      >
        <CourseList
          courses={visibleCourses}
          animated={shouldAnimateList}
          highlightFromIndex={highlightFromIndex}
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
              onClick={handleShowMore}
            >
              Show more
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}
