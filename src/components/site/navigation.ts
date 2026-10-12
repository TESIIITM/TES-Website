export type Panel = 'build' | 'learn' | 'gather';

/** Hash targets the site can scroll to. Panels live inside the `explore` section. */
export type Target = Panel | 'home' | 'about' | 'explore';

export type Navigate = (target: string, scroll?: boolean) => void;

export const panels: { value: Panel; label: string; number: string }[] = [
  { value: 'build', label: 'Build', number: '01' },
  { value: 'learn', label: 'Learn', number: '02' },
  { value: 'gather', label: 'Gather', number: '03' },
];

export function isPanel(target: string): target is Panel {
  return target === 'build' || target === 'learn' || target === 'gather';
}

/** Arrow, Home and End handling shared by the site's tab lists. */
export function nextTabIndex(key: string, index: number, count: number, { vertical = false } = {}): number | null {
  if (key === 'ArrowRight' || (vertical && key === 'ArrowDown')) return (index + 1) % count;
  if (key === 'ArrowLeft' || (vertical && key === 'ArrowUp')) return (index + count - 1) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}
