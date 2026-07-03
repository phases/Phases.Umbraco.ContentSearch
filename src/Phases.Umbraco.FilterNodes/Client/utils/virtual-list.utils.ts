export interface VirtualListWindow<T> {
  readonly items: readonly T[];
  readonly visibleCount: number;
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly truncated: boolean;
}

export function createVirtualListWindow<T>(
  items: readonly T[],
  visibleCount: number,
  maxVisible: number,
): VirtualListWindow<T> {
  const totalCount = items.length;
  const cappedVisibleCount = Math.min(
    visibleCount,
    totalCount,
    maxVisible,
  );
  const truncated = totalCount > maxVisible;

  return {
    items: items.slice(0, cappedVisibleCount),
    visibleCount: cappedVisibleCount,
    totalCount,
    hasMore: cappedVisibleCount < totalCount && cappedVisibleCount < maxVisible,
    truncated,
  };
}

export function getNextVirtualListVisibleCount(
  currentVisibleCount: number,
  totalCount: number,
  windowSize: number,
  maxVisible: number,
): number {
  return Math.min(currentVisibleCount + windowSize, totalCount, maxVisible);
}

export function shouldLoadMoreVirtualListItems(
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number,
  threshold = 48,
): boolean {
  return scrollTop + clientHeight >= scrollHeight - threshold;
}
