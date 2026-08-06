export interface CategoryColorClasses {
  badge: string;
  border: string;
  dot: string;
  solid: string;
}

// Fixed token palette (not freeform hex) so every class name below is a literal
// string Tailwind's build-time scanner can find  a DB-stored arbitrary hex
// couldn't be turned into a class at runtime without an unsafe safelist.
export const CATEGORY_COLOR_TOKENS = [
  'blue', 'violet', 'amber', 'rose', 'emerald', 'cyan',
  'orange', 'teal', 'indigo', 'pink', 'slate', 'red',
] as const;

export type CategoryColorToken = typeof CATEGORY_COLOR_TOKENS[number];

export const CATEGORY_COLORS: Record<string, CategoryColorClasses> = {
  blue: { badge: 'bg-blue-50 text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', solid: 'bg-blue-500' },
  violet: { badge: 'bg-violet-50 text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500', solid: 'bg-violet-500' },
  amber: { badge: 'bg-amber-50 text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', solid: 'bg-amber-500' },
  rose: { badge: 'bg-rose-50 text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500', solid: 'bg-rose-500' },
  emerald: { badge: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', solid: 'bg-emerald-500' },
  cyan: { badge: 'bg-cyan-50 text-cyan-700', border: 'border-cyan-200', dot: 'bg-cyan-500', solid: 'bg-cyan-500' },
  orange: { badge: 'bg-orange-50 text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500', solid: 'bg-orange-500' },
  teal: { badge: 'bg-teal-50 text-teal-700', border: 'border-teal-200', dot: 'bg-teal-500', solid: 'bg-teal-500' },
  indigo: { badge: 'bg-indigo-50 text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500', solid: 'bg-indigo-500' },
  pink: { badge: 'bg-pink-50 text-pink-700', border: 'border-pink-200', dot: 'bg-pink-500', solid: 'bg-pink-500' },
  slate: { badge: 'bg-slate-50 text-slate-700', border: 'border-slate-200', dot: 'bg-slate-500', solid: 'bg-slate-500' },
  red: { badge: 'bg-red-50 text-red-700', border: 'border-red-200', dot: 'bg-red-500', solid: 'bg-red-500' },
};

export function getCategoryColorClasses(color: string): CategoryColorClasses {
  return CATEGORY_COLORS[color] ?? CATEGORY_COLORS.slate;
}
