import { cn } from "@/lib/utils";
import { getIconMeta } from "./registry";

type IconProps = {
  name: string | null | undefined;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 20, className }: IconProps) {
  const meta = getIconMeta(name);
  const Component = meta.component;
  return <Component size={size} className={cn("shrink-0", className)} aria-hidden />;
}
