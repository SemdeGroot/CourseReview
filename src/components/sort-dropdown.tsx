"use client";

import { ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SortOption } from "@/lib/sort";
import { cn } from "@/lib/utils";

type Props = {
  options: SortOption[];
  defaultValue?: string;
  paramName?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export function SortDropdown({
  options,
  defaultValue = options[0]?.value ?? "",
  paramName = "sort",
  value,
  onChange,
  className,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = value ?? searchParams.get(paramName) ?? defaultValue;

  function handleChange(value: string) {
    if (onChange) {
      onChange(value);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (value === defaultValue) {
      params.delete(paramName);
    } else {
      params.set(paramName, value);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className={cn("w-[220px]", className)}>
        <ArrowUpDown size={14} className="text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
