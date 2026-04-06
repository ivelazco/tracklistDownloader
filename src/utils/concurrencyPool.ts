/**
 * Runs async work over `items` with at most `limit` tasks in flight.
 * Result indices match `items` (same contract as Promise.allSettled over a pre-built array).
 */
export const mapWithConcurrencySettled = async <T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> => {
  const n = items.length;
  if (n === 0) return [];

  const capped = Math.max(1, Math.min(n, Math.floor(Number(limit)) || 1));
  const results: PromiseSettledResult<R>[] = new Array(n);
  let next = 0;

  const worker = async (): Promise<void> => {
    for (;;) {
      const i = next++;
      if (i >= n) return;
      try {
        const value = await fn(items[i], i);
        results[i] = { status: 'fulfilled', value };
      } catch (reason) {
        results[i] = { status: 'rejected', reason };
      }
    }
  };

  await Promise.all(Array.from({ length: capped }, () => worker()));
  return results;
};
