import type { ComponentType, SVGProps } from "react";
import {
  BookOpen,
  Bug,
  Cloud,
  Code,
  Cpu,
  Database,
  GraduationCap,
  Layers,
  Lock,
  Network,
  Pencil,
  Server,
  Shield,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import {
  IconAtom,
  IconBinaryTree2,
  IconBrain,
  IconChartHistogram,
  IconCpu2,
  IconDna,
  IconFlask,
  IconMicroscope,
  IconRobot,
  IconTelescope,
} from "@tabler/icons-react";

export type IconGroup = "Computer Science" | "Science" | "General";

export type IconMeta = {
  key: string;
  label: string;
  group: IconGroup;
  component: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
};

export const iconRegistry: IconMeta[] = [
  // Computer Science
  { key: "cpu", label: "CPU", group: "Computer Science", component: Cpu },
  { key: "chip", label: "Chip", group: "Computer Science", component: IconCpu2 },
  { key: "code", label: "Code", group: "Computer Science", component: Code },
  { key: "terminal", label: "Terminal", group: "Computer Science", component: Terminal },
  { key: "database", label: "Database", group: "Computer Science", component: Database },
  { key: "server", label: "Server", group: "Computer Science", component: Server },
  { key: "cloud", label: "Cloud", group: "Computer Science", component: Cloud },
  { key: "network", label: "Network", group: "Computer Science", component: Network },
  { key: "binary-tree", label: "Binary Tree", group: "Computer Science", component: IconBinaryTree2 },
  { key: "brain", label: "Brain (AI)", group: "Computer Science", component: IconBrain },
  { key: "robot", label: "Robot", group: "Computer Science", component: IconRobot },
  { key: "bug", label: "Security", group: "Computer Science", component: Bug },
  { key: "shield", label: "Shield", group: "Computer Science", component: Shield },
  { key: "lock", label: "Crypto", group: "Computer Science", component: Lock },
  { key: "workflow", label: "Workflow", group: "Computer Science", component: Workflow },
  { key: "zap", label: "Performance", group: "Computer Science", component: Zap },
  { key: "layers", label: "Layers", group: "Computer Science", component: Layers },
  { key: "chart", label: "Data", group: "Computer Science", component: IconChartHistogram },

  // Science
  { key: "atom", label: "Atom", group: "Science", component: IconAtom },
  { key: "dna", label: "DNA", group: "Science", component: IconDna },
  { key: "flask", label: "Flask", group: "Science", component: IconFlask },
  { key: "microscope", label: "Microscope", group: "Science", component: IconMicroscope },
  { key: "telescope", label: "Telescope", group: "Science", component: IconTelescope },

  // General
  { key: "book-open", label: "Book", group: "General", component: BookOpen },
  { key: "graduation", label: "Graduation", group: "General", component: GraduationCap },
  { key: "pencil", label: "Pencil", group: "General", component: Pencil },
];

export const iconByKey: Record<string, IconMeta> = Object.fromEntries(
  iconRegistry.map((icon) => [icon.key, icon]),
);

export const DEFAULT_ICON_KEY = "book-open";

export function getIconMeta(key: string | null | undefined): IconMeta {
  if (!key) return iconByKey[DEFAULT_ICON_KEY];
  return iconByKey[key] ?? iconByKey[DEFAULT_ICON_KEY];
}
