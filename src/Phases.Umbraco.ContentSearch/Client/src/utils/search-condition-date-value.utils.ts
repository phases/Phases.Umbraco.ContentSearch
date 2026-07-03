const DATE_RANGE_SEPARATORS = ["..", "|", ","] as const;

export function parseDateRangeValue(value: string): { from: string; to: string } {
  const trimmed = value.trim();

  if (!trimmed) {
    return { from: "", to: "" };
  }

  for (const separator of DATE_RANGE_SEPARATORS) {
    if (!trimmed.includes(separator)) {
      continue;
    }

    const [from = "", to = ""] = trimmed.split(separator).map((part) => part.trim());
    return { from, to };
  }

  return { from: trimmed, to: "" };
}

export function encodeDateRangeValue(from: string, to: string): string {
  const normalizedFrom = from.trim();
  const normalizedTo = to.trim();

  if (!normalizedFrom && !normalizedTo) {
    return "";
  }

  if (!normalizedTo) {
    return normalizedFrom;
  }

  return `${normalizedFrom}..${normalizedTo}`;
}

export function isDateRangeValueComplete(value: string): boolean {
  const { from, to } = parseDateRangeValue(value);
  return Boolean(from && to);
}
