/**
 * Calculates the total number of pages for a paged result set.
 */
export function calculateTotalPages(totalCount: number, pageSize: number): number {
  if (totalCount <= 0 || pageSize <= 0) {
    return 0;
  }

  return Math.ceil(totalCount / pageSize);
}

/**
 * Clamps a 1-based page number to the valid range for the given page count.
 */
export function clampPageNumber(page: number, totalPages: number): number {
  if (totalPages <= 0) {
    return 1;
  }

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.min(page, totalPages);
}

/**
 * Resolves total pages from API values with a client-side fallback.
 */
export function resolveTotalPages(
  totalCount: number,
  pageSize: number,
  apiTotalPages?: number,
): number {
  const fallback = calculateTotalPages(totalCount, pageSize);

  if (typeof apiTotalPages === "number" && apiTotalPages > 0) {
    return Math.max(apiTotalPages, fallback);
  }

  return fallback;
}
