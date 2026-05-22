"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  paramName?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function SearchInput({
  placeholder = "Search by title or course code...",
  className,
  inputClassName,
  paramName = "q",
  value: controlledValue,
  onChange,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get(paramName) ?? "";
  const [uncontrolledValue, setUncontrolledValue] = useState(initial);
  const value = controlledValue ?? uncontrolledValue;
  const isControlled = controlledValue !== undefined;

  useEffect(() => {
    if (isControlled) return;
    // Sync local state when the URL changes externally (e.g. browser back).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUncontrolledValue(searchParams.get(paramName) ?? "");
  }, [searchParams, paramName, isControlled]);

  useEffect(() => {
    if (isControlled) return;
    const current = searchParams.get(paramName) ?? "";
    if (value === current) return;
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(paramName, value);
      } else {
        params.delete(paramName);
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    }, 250);
    return () => clearTimeout(handle);
  }, [value, paramName, router, searchParams, isControlled]);

  function updateValue(nextValue: string) {
    if (isControlled) {
      onChange?.(nextValue);
    } else {
      setUncontrolledValue(nextValue);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => updateValue(e.target.value)}
        placeholder={placeholder}
        className={cn("pl-9 pr-9", inputClassName)}
      />
      {value && (
        <button
          type="button"
          onClick={() => updateValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
