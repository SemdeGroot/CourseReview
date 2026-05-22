import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SemesterBadgeProps = {
  semester: string;
  className?: string;
};

export function SemesterBadge({ semester, className }: SemesterBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-primary/20 bg-primary/5 font-mono text-[11px] text-primary",
        className,
      )}
    >
      {semester}
    </Badge>
  );
}

export function formatSemesters(semesters: string[] | null | undefined) {
  if (!semesters?.length) return "TBA";
  return semesters.join(" / ");
}
