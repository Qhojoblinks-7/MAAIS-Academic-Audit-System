export const DEPARTMENT_PALETTE = [
  { id: 0, name: 'Emerald',  hex: '#10b981', bg: 'bg-emerald-500',   text: 'text-emerald-600',   light: 'bg-emerald-50',  lightText: 'text-emerald-700',  border: 'border-emerald-200', dark: 'bg-emerald-900', darkText: 'text-emerald-100' },
  { id: 1, name: 'Sky',      hex: '#0ea5e9', bg: 'bg-sky-500',       text: 'text-sky-600',       light: 'bg-sky-50',      lightText: 'text-sky-700',      border: 'border-sky-200',      dark: 'bg-sky-900',      darkText: 'text-sky-100' },
  { id: 2, name: 'Violet',   hex: '#8b5cf6', bg: 'bg-violet-500',    text: 'text-violet-600',    light: 'bg-violet-50',   lightText: 'text-violet-700',   border: 'border-violet-200',   dark: 'bg-violet-900',   darkText: 'text-violet-100' },
  { id: 3, name: 'Pink',     hex: '#ec4899', bg: 'bg-pink-500',      text: 'text-pink-600',      light: 'bg-pink-50',     lightText: 'text-pink-700',     border: 'border-pink-200',     dark: 'bg-pink-900',     darkText: 'text-pink-100' },
  { id: 4, name: 'Orange',   hex: '#f97316', bg: 'bg-orange-500',    text: 'text-orange-600',    light: 'bg-orange-50',   lightText: 'text-orange-700',   border: 'border-orange-200',   dark: 'bg-orange-900',   darkText: 'text-orange-100' },
  { id: 5, name: 'Cyan',     hex: '#06b6d4', bg: 'bg-cyan-500',      text: 'text-cyan-600',      light: 'bg-cyan-50',     lightText: 'text-cyan-700',     border: 'border-cyan-200',     dark: 'bg-cyan-900',     darkText: 'text-cyan-100' },
  { id: 6, name: 'Fuchsia',  hex: '#d946ef', bg: 'bg-fuchsia-500',   text: 'text-fuchsia-600',   light: 'bg-fuchsia-50',  lightText: 'text-fuchsia-700',  border: 'border-fuchsia-200',  dark: 'bg-fuchsia-900',  darkText: 'text-fuchsia-100' },
  { id: 7, name: 'Yellow',   hex: '#eab308', bg: 'bg-yellow-500',    text: 'text-yellow-600',    light: 'bg-yellow-50',   lightText: 'text-yellow-700',   border: 'border-yellow-200',   dark: 'bg-yellow-700',   darkText: 'text-yellow-100' },
  { id: 8, name: 'Green',    hex: '#16a34a', bg: 'bg-green-600',     text: 'text-green-700',     light: 'bg-green-50',    lightText: 'text-green-700',    border: 'border-green-200',    dark: 'bg-green-900',    darkText: 'text-green-100' },
  { id: 9, name: 'Red',      hex: '#dc2626', bg: 'bg-red-600',       text: 'text-red-700',       light: 'bg-red-50',      lightText: 'text-red-700',      border: 'border-red-200',      dark: 'bg-red-900',      darkText: 'text-red-100' },
];

export function getDepartmentColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % DEPARTMENT_PALETTE.length;
  const palette = DEPARTMENT_PALETTE[idx];
  return {
    color: palette.bg,
    iconColor: palette.text,
    hex: palette.hex,
    light: palette.light,
    lightText: palette.lightText,
    border: palette.border,
    dark: palette.dark,
    darkText: palette.darkText,
    palette,
  };
}

export function getDepartmentColorHex(seed) {
  return getDepartmentColor(seed).hex;
}
