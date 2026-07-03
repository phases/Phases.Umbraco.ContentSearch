export interface ContentSearchDateColumnValue {
  readonly display: string;
  readonly tooltip: string;
  readonly isMuted: boolean;
}

function isSameCalendarDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfCalendarDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFullDateTime(date: Date): string {
  return date.toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  });
}

export function buildContentSearchDateColumnValue(
  value?: string | null,
): ContentSearchDateColumnValue {
  const normalized = value?.trim();

  if (!normalized) {
    return {
      display: "—",
      tooltip: "—",
      isMuted: true,
    };
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return {
      display: normalized,
      tooltip: normalized,
      isMuted: false,
    };
  }

  const now = new Date();
  const tooltip = formatFullDateTime(date);

  if (isSameCalendarDay(date, now)) {
    return {
      display: "Today",
      tooltip,
      isMuted: false,
    };
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameCalendarDay(date, yesterday)) {
    return {
      display: "Yesterday",
      tooltip,
      isMuted: false,
    };
  }

  const dayDiff = Math.round(
    (startOfCalendarDay(now).getTime() - startOfCalendarDay(date).getTime()) /
      86_400_000,
  );

  if (dayDiff > 1 && dayDiff < 7) {
    return {
      display: `${dayDiff} days ago`,
      tooltip,
      isMuted: false,
    };
  }

  return {
    display: formatShortDate(date),
    tooltip,
    isMuted: false,
  };
}
