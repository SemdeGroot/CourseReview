"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  id?: string;
};

export function RatingInput({ value, onChange, max = 5, id }: Props) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div
      id={id}
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHover(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const active = display >= n;
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => onChange(n)}
            className={cn(
              "rounded-sm p-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "hover:bg-accent/10",
            )}
          >
            <Star
              size={28}
              className={cn(
                "transition-colors",
                active ? "fill-accent text-accent" : "fill-muted text-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 min-w-8 text-sm font-medium tabular-nums text-foreground">
        {value ? `${value} / ${max}` : ""}
      </span>
    </div>
  );
}
