export type SortOption = {
  value: string;
  label: string;
  column: string;
  ascending: boolean;
};

export const COURSE_SORT_OPTIONS: SortOption[] = [
  { value: "reviews.desc", label: "Most reviewed", column: "review_count", ascending: false },
  { value: "reviews.asc", label: "Fewest reviews", column: "review_count", ascending: true },
  { value: "rating.desc", label: "Highest rated", column: "avg_rating", ascending: false },
  { value: "rating.asc", label: "Lowest rated", column: "avg_rating", ascending: true },
  { value: "difficulty.desc", label: "Hardest", column: "avg_difficulty", ascending: false },
  { value: "difficulty.asc", label: "Easiest", column: "avg_difficulty", ascending: true },
  { value: "workload.desc", label: "Heaviest workload", column: "avg_workload", ascending: false },
  { value: "workload.asc", label: "Lightest workload", column: "avg_workload", ascending: true },
  { value: "title.asc", label: "Title A-Z", column: "title", ascending: true },
];

export const DEFAULT_COURSE_SORT = "reviews.desc";

export function resolveCourseSort(value: string | undefined | null): SortOption {
  return (
    COURSE_SORT_OPTIONS.find((option) => option.value === value) ??
    COURSE_SORT_OPTIONS.find((option) => option.value === DEFAULT_COURSE_SORT)!
  );
}

export const REVIEW_SORT_OPTIONS: SortOption[] = [
  { value: "date.desc", label: "Newest", column: "created_at", ascending: false },
  { value: "date.asc", label: "Oldest", column: "created_at", ascending: true },
  { value: "rating.desc", label: "Highest rated", column: "rating", ascending: false },
  { value: "rating.asc", label: "Lowest rated", column: "rating", ascending: true },
  { value: "difficulty.desc", label: "Hardest", column: "difficulty", ascending: false },
  { value: "difficulty.asc", label: "Easiest", column: "difficulty", ascending: true },
  { value: "workload.desc", label: "Heaviest workload", column: "workload_hours", ascending: false },
  { value: "workload.asc", label: "Lightest workload", column: "workload_hours", ascending: true },
];

export const DEFAULT_REVIEW_SORT = "date.desc";

export function resolveReviewSort(value: string | undefined | null): SortOption {
  return (
    REVIEW_SORT_OPTIONS.find((option) => option.value === value) ??
    REVIEW_SORT_OPTIONS.find((option) => option.value === DEFAULT_REVIEW_SORT)!
  );
}
