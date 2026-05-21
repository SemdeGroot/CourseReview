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
  defaultValue?: string;
  paramName?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function SortDropdown({
  options,
  defaultValue = options[0]?.value ?? "",
  paramName = "sort",
  value,
  onChange,
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
