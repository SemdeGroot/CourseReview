/**
 * Curated color palette for the course icon/color picker.
 * Navy variants plus a few tasteful accents. No full rainbow — keeps the
 * Leiden aesthetic coherent across course cards.
 */
export const COURSE_COLORS = [
  "#001158", // Leiden navy (default)
  "#0c2577", // navy hover
  "#1e3a8a", // deep blue
  "#2563eb", // blue
  "#0891b2", // cyan
  "#0f766e", // teal
  "#15803d", // green
  "#a16207", // amber
  "#f46e32", // Leiden orange
  "#dc2626", // red
  "#9333ea", // purple
  "#be185d", // pink
  "#334155", // slate
  "#0c1229", // almost black
] as const;

export const DEFAULT_COURSE_COLOR = COURSE_COLORS[0];
