import type { EditableFilterOperator } from "../models/filter-models.js";

export type DateShortcutId =
  | ""
  | "custom"
  | "today"
  | "yesterday"
  | "last7Days"
  | "last30Days"
  | "thisMonth"
  | "lastMonth";

export interface DateShortcutOption {
  readonly id: DateShortcutId;
  readonly label: string;
}

export interface DateShortcutRange {
  readonly fromDate: string;
  readonly toDate: string;
  readonly isSingleDay: boolean;
}

export const DATE_RANGE_PLACEHOLDER = "Select date range...";

export const DATE_SHORTCUT_OPTIONS: readonly DateShortcutOption[] = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last7Days", label: "Last 7 Days" },
  { id: "last30Days", label: "Last 30 Days" },
  { id: "thisMonth", label: "This Month" },
  { id: "lastMonth", label: "Last Month" },
  { id: "custom", label: "Custom Range" },
] as const;

export function showsCustomDateRangePickers(
  shortcutId: DateShortcutId,
): boolean {
  return shortcutId === "custom";
}

export function formatDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function resolveDateShortcutRange(
  shortcutId: DateShortcutId,
  referenceDate: Date = new Date(),
): DateShortcutRange | undefined {
  const today = startOfDay(referenceDate);

  switch (shortcutId) {
    case "custom":
      return undefined;
    case "today":
      return toRange(today, today);
    case "yesterday": {
      const yesterday = addDays(today, -1);
      return toRange(yesterday, yesterday);
    }
    case "last7Days":
      return toRange(addDays(today, -6), today);
    case "last30Days":
      return toRange(addDays(today, -29), today);
    case "thisMonth":
      return toRange(
        new Date(today.getFullYear(), today.getMonth(), 1),
        today,
      );
    case "lastMonth": {
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      return toRange(firstDay, lastDay);
    }
    default:
      return undefined;
  }
}

export function detectDateShortcut(
  fromDate: string,
  toDate: string,
  propertyValue: string,
  filterOperator: EditableFilterOperator,
  mode: "system" | "custom",
): DateShortcutId {
  const normalizedFrom = fromDate.trim();
  const normalizedTo = toDate.trim();
  const normalizedValue = propertyValue.trim();

  if (mode === "custom" && filterOperator !== "Between") {
    if (!normalizedValue) {
      return "";
    }

    for (const option of DATE_SHORTCUT_OPTIONS) {
      if (option.id === "custom") {
        continue;
      }

      const range = resolveDateShortcutRange(option.id);

      if (
        range?.isSingleDay &&
        range.fromDate === normalizedValue
      ) {
        return option.id;
      }
    }

    return "custom";
  }

  if (!normalizedFrom && !normalizedTo) {
    return "";
  }

  for (const option of DATE_SHORTCUT_OPTIONS) {
    if (option.id === "custom") {
      continue;
    }

    const range = resolveDateShortcutRange(option.id);

    if (
      range &&
      range.fromDate === normalizedFrom &&
      range.toDate === normalizedTo
    ) {
      return option.id;
    }
  }

  return "custom";
}

export function toDateShortcutSelectOptions(
  selectedShortcut: DateShortcutId,
  placeholder = DATE_RANGE_PLACEHOLDER,
): Array<{ name: string; value: string; selected?: boolean }> {
  return [
    { name: placeholder, value: "", selected: !selectedShortcut },
    ...DATE_SHORTCUT_OPTIONS.map((option) => ({
      name: option.label,
      value: option.id,
      selected: option.id === selectedShortcut,
    })),
  ];
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return startOfDay(result);
}

function toRange(from: Date, to: Date): DateShortcutRange {
  const fromDate = formatDateInputValue(from);
  const toDate = formatDateInputValue(to);

  return {
    fromDate,
    toDate,
    isSingleDay: fromDate === toDate,
  };
}
