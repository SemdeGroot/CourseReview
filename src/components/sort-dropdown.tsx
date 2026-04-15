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

type Props = {
  options: SortOption[];
  defaultValue: string;
  paramName?: string;
};

export function SortDropdown({
  options,
  defaultValue,
  paramName = "sort",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramName) ?? defaultValue;

  function handleChange(value: string) {
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
      <SelectTrigger className="w-[220px]">
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
