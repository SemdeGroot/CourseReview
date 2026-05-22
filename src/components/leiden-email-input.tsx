"use client";

import { Input } from "@/components/ui/input";

export const LEIDEN_EMAIL_DOMAIN = "@umail.leidenuniv.nl";
export const LEIDEN_EMAIL_PREFIX_ERROR =
  "Enter only the part before @umail.leidenuniv.nl.";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function normalizeLeidenEmailPrefix(value: string) {
  return value.trim().toLowerCase();
}

export function validateLeidenEmailPrefix(value: string) {
  const prefix = normalizeLeidenEmailPrefix(value);
  if (!prefix) return "Please enter your name part of the email.";
  if (prefix.includes("@")) return LEIDEN_EMAIL_PREFIX_ERROR;
  return null;
}

export function LeidenEmailInput({ id, value, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-input bg-background shadow-xs transition-shadow focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 sm:flex-row sm:items-center">
      <Input
        id={id}
        type="text"
        autoComplete="username"
        required
        placeholder="e.g. s1234567"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-10 min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <span className="pointer-events-none select-none border-t border-input bg-muted px-3 py-2 font-mono text-xs text-muted-foreground sm:border-l sm:border-t-0 sm:text-sm">
        {LEIDEN_EMAIL_DOMAIN}
      </span>
    </div>
  );
}
