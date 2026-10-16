import { useSyncExternalStore } from 'react';

type Options<T> = {
  key: string;
  /** Value used during server rendering and when nothing valid is stored. */
  fallback: T;
  /** Must tolerate `null` and untrusted input. */
  parse: (raw: string | null) => T;
  serialize: (value: T) => string;
  onChange?: (value: T) => void;
};

export type BrowserStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
};

/**
 * A localStorage-backed value for `useSyncExternalStore`. When storage is
 * blocked or full, it keeps working in memory for the rest of the visit.
 */
export function createBrowserStore<T>({ key, fallback, parse, serialize, onChange }: Options<T>): BrowserStore<T> {
  const listeners = new Set<() => void>();
  let usingMemory = false;
  let memory: string | null = null;
  let cache: { raw: string | null; value: T } | null = null;

  const readRaw = () => {
    if (usingMemory) return memory;
    try {
      return localStorage.getItem(key);
    } catch {
      usingMemory = true;
      return memory;
    }
  };

  return {
    subscribe(listener) {
      const onStorage = (event: StorageEvent) => { if (event.key === key) listener(); };
      listeners.add(listener);
      window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
      };
    },
    getSnapshot() {
      const raw = readRaw();
      // Return the same reference until the stored value changes.
      if (!cache || cache.raw !== raw) cache = { raw, value: parse(raw) };
      return cache.value;
    },
    getServerSnapshot: () => fallback,
    set(value) {
      memory = serialize(value);
      if (!usingMemory) {
        try {
          localStorage.setItem(key, memory);
        } catch {
          usingMemory = true;
        }
      }
      onChange?.(value);
      for (const listener of listeners) listener();
    },
  };
}

export function useBrowserStore<T>(store: BrowserStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
