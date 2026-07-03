export function formatSearchDuration(executionTimeMs: number): string {
  const milliseconds = Math.max(0, Math.round(executionTimeMs));

  if (milliseconds < 1000) {
    return `${milliseconds} ms`;
  }

  const seconds = milliseconds / 1000;
  const formatted =
    seconds >= 10 ? seconds.toFixed(0) : Number(seconds.toFixed(1)).toString();

  return `${formatted} s`;
}

export function formatSearchResultsSummary(
  totalCount: number,
  executionTimeMs: number,
): string {
  const countLabel = totalCount === 1 ? "1 result" : `${totalCount} results`;

  return `${countLabel} • ${formatSearchDuration(executionTimeMs)}`;
}
