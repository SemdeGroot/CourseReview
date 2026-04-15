import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type RatingProps = {
  value: number;
  max?: number;
  showNumber?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function Rating({
  value,
  max = 5,
  showNumber = true,
  size = "sm",
  className,
}: RatingProps) {
  const rounded = Math.round(value * 2) / 2;
  const iconSize = size === "md" ? 16 : 13;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-label={`Rating ${value.toFixed(1)} of ${max}`}>
        {Array.from({ length: max }, (_, i) => {
          const filled = i + 1 <= rounded;
          const half = !filled && i + 0.5 <= rounded;
          return (
            <Star
              key={i}
              size={iconSize}
              className={cn(
                "transition-colors",
                filled
                  ? "fill-accent text-accent"
                  : half
                    ? "fill-accent/40 text-accent"
                    : "fill-muted text-muted-foreground/40",
              )}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-medium text-foreground tabular-nums">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
