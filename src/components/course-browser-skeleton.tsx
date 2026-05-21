import { Skeleton } from "@/components/ui/skeleton";

export function CourseBrowserSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <Skeleton className="h-10 w-full sm:max-w-md" />
        <Skeleton className="h-10 w-full sm:w-44" />
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-border bg-card md:block">
        <div className="border-b border-border bg-muted/40 px-4 py-3">
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[minmax(0,2fr)_90px_1fr_1fr_1fr_80px] gap-3 px-4 py-4"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="size-8 rounded-md" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-4 w-3/4 max-w-56" />
                  <div className="mt-2 flex gap-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-4 w-20 self-center" />
              <Skeleton className="h-4 w-24 self-center" />
              <Skeleton className="h-4 w-20 self-center" />
              <Skeleton className="h-4 w-20 self-center" />
              <Skeleton className="ml-auto h-4 w-10 self-center" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <Skeleton className="size-10 rounded-md" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
                <div className="mt-2 flex gap-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border pt-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
