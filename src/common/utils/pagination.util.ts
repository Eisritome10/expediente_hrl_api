export function resolvePagination(
  page?: number,
  limit?: number,
): { skip: number; take: number } {
  const resolvedPage = Number.isFinite(page) ? Math.max(page as number, 1) : 1;
  const resolvedLimit = Number.isFinite(limit)
    ? Math.min(Math.max(limit as number, 1), 100)
    : 10;

  return {
    skip: (resolvedPage - 1) * resolvedLimit,
    take: resolvedLimit,
  };
}
