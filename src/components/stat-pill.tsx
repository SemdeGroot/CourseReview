import { cn } from "@/lib/utils";

type StatPillProps = {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
};

export function StatPill({ label, value, hint, className }: StatPillProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground">
        {value}
        {hint && <span className="ml-1 text-sm font-normal text-muted-foreground">{hint}</span>}
      </span>
    </div>
  );
}
