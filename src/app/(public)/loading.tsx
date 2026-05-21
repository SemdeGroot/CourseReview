import { CourseBrowserSkeleton } from "@/components/course-browser-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <>
      <section className="border-b border-border site-shell-top">
        <div className="site-gutter mx-auto w-full max-w-6xl py-16 sm:py-24">
          <Skeleton className="h-4 w-56" />
          <Skeleton className="mt-4 h-12 w-full max-w-2xl" />
          <Skeleton className="mt-5 h-6 w-full max-w-xl" />
          <Skeleton className="mt-8 h-11 w-40" />
        </div>
      </section>
      <section className="site-gutter mx-auto w-full max-w-6xl py-10">
        <CourseBrowserSkeleton />
      </section>
    </>
  );
}
