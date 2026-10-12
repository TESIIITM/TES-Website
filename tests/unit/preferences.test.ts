import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBrowserStore } from '@/lib/browser-store';
import { parseReadingList } from '@/lib/reading-list';
import { parseTheme } from '@/lib/theme';

describe('parseTheme', () => {
  it('only honours a stored light theme', () => {
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme('invalid-theme')).toBe('dark');
    expect(parseTheme(null)).toBe('dark');
  });
});

describe('parseReadingList', () => {
  it('keeps unique strings and ignores everything else', () => {
    expect(parseReadingList(JSON.stringify(['gsoc', 'gsoc', 42, null, 'go']))).toEqual(['gsoc', 'go']);
  });

  it('survives malformed storage', () => {
    expect(parseReadingList('{invalid JSON')).toEqual([]);
    expect(parseReadingList('{"a":1}')).toEqual([]);
    expect(parseReadingList(null)).toEqual([]);
  });
});

describe('createBrowserStore', () => {
  const data = new Map<string, string>();
  const storage = {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { data.set(key, value); }),
  };

  beforeEach(() => {
    data.clear();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('window', { addEventListener: vi.fn(), removeEventListener: vi.fn() });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  const makeStore = () => createBrowserStore({ key: 'k', fallback: [] as string[], parse: parseReadingList, serialize: JSON.stringify });

  it('returns a stable snapshot until the stored value changes', () => {
    const store = makeStore();
    const first = store.getSnapshot();
    expect(store.getSnapshot()).toBe(first);
    store.set(['go']);
    expect(store.getSnapshot()).toEqual(['go']);
    expect(store.getSnapshot()).not.toBe(first);
  });

  it('notifies subscribers on set', () => {
    const store = makeStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.set(['gsoc']);
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
    store.set([]);
    expect(listener).toHaveBeenCalledOnce();
  });

  it('keeps working in memory when storage throws', () => {
    storage.getItem.mockImplementation(() => { throw new DOMException('blocked', 'SecurityError'); });
    storage.setItem.mockImplementation(() => { throw new DOMException('blocked', 'SecurityError'); });
    const store = makeStore();
    expect(store.getSnapshot()).toEqual([]);
    store.set(['gsoc']);
    expect(store.getSnapshot()).toEqual(['gsoc']);
  });
});
