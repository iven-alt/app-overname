/**
 * Shared pillar visual metadata.
 * Imported by every page that needs to display pillar identity (icon + color).
 * The values here must stay in sync with the PILLARS keys in app/page.tsx.
 */

export const PILLAR_META: Record<string, { icon: string; color: string }> = {
  "Omzetgroei":               { icon: "📈", color: "#3B82F6" },
  "Operationele efficiëntie": { icon: "⚙️",  color: "#6366F1" },
  "Kostenbesparing":          { icon: "💰", color: "#10B981" },
  "Klantwaardecreatie":       { icon: "❤️",  color: "#F59E0B" },
  "Innovatie en groei":       { icon: "🚀", color: "#8B5CF6" },
  "Human capital":            { icon: "👥", color: "#EC4899" },
  "Duurzaamheid":             { icon: "🌱", color: "#22C55E" },
  "Financiële optimalisatie": { icon: "💹", color: "#14B8A6" },
};

/**
 * Pre-built display-label map used in the Pillar dropdown.
 * e.g. "Omzetgroei" → "📈  Omzetgroei"
 */
export const PILLAR_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(PILLAR_META).map(([p, { icon }]) => [p, `${icon}  ${p}`])
);
