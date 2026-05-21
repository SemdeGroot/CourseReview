import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:animate-skeleton-shimmer before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)] before:bg-[length:200%_100%] before:content-[''] motion-reduce:before:animate-none",
        className,
      )}
      {...props}
    />
  );
}
