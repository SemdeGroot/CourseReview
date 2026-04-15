"use client";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  labels?: string[];
  id?: string;
};

export function LevelInput({
  value,
  onChange,
  labels = ["Very easy", "Easy", "Moderate", "Hard", "Very hard"],
  id,
}: Props) {
  return (
    <div id={id} className="flex flex-col gap-2">
      <div className="flex gap-1" role="radiogroup">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={labels[n - 1]}
              onClick={() => onChange(n)}
              className={cn(
                "h-10 flex-1 rounded-md border text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-secondary",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      {value > 0 && (
        <p className="text-xs text-muted-foreground">
          {labels[value - 1]}
        </p>
      )}
    </div>
  );
}
