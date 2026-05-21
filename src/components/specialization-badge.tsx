import { cn } from "@/lib/utils";

type Props = {
  code: string;
  role: "core" | "elective";
  className?: string;
};

export type SpecializationPill = {
  code: string;
  name: string;
  role: "core" | "elective";
};

export function SpecializationBadge({ code, role, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide leading-none",
        role === "core"
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground",
        className,
      )}
      title={role === "core" ? `Core for ${code}` : `Elective for ${code}`}
    >
      {code}
      {role === "core" && <span className="ml-1 opacity-70">core</span>}
    </span>
  );
}
