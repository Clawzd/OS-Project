const PROCESS_COLORS = [
  { bg: '#6366f1', text: '#ffffff', label: 'Indigo' },
  { bg: '#06b6d4', text: '#ffffff', label: 'Cyan' },
  { bg: '#f59e0b', text: '#000000', label: 'Amber' },
  { bg: '#ec4899', text: '#ffffff', label: 'Pink' },
  { bg: '#8b5cf6', text: '#ffffff', label: 'Violet' },
  { bg: '#10b981', text: '#ffffff', label: 'Emerald' },
  { bg: '#f97316', text: '#ffffff', label: 'Orange' },
  { bg: '#14b8a6', text: '#ffffff', label: 'Teal' },
  { bg: '#e11d48', text: '#ffffff', label: 'Rose' },
  { bg: '#3b82f6', text: '#ffffff', label: 'Blue' },
  { bg: '#a855f7', text: '#ffffff', label: 'Purple' },
  { bg: '#84cc16', text: '#000000', label: 'Lime' },
];

export function getProcessColor(index) {
  return PROCESS_COLORS[index % PROCESS_COLORS.length];
}

export const FREE_BLOCK_COLOR = { bg: '#374151', text: '#9ca3af', label: 'Free' };
export const FREE_BLOCK_COLOR_LIGHT = { bg: '#e5e7eb', text: '#6b7280', label: 'Free' };
