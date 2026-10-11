/** Reuse a read across navigations so the next page is not blocked on a fresh query. */
export function memoCms<T>(load: () => Promise<T>, ttlMs = 10_000) {
  let pending: Promise<T> | null = null;
  let storedAt = 0;

  return () => {
    if (!pending || Date.now() - storedAt > ttlMs) {
      storedAt = Date.now();
      const run = load().catch((error) => {
        if (pending === run) {
          pending = null;
          storedAt = 0;
        }
        throw error;
      });
      pending = run;
    }
    return pending;
  };
}
