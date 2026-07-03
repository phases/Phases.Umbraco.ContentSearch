import type { SearchCondition, SearchConditionOperator } from "../models/search-builder.models.js";

export const NODE_NAME_PROPERTY_ALIAS = "nodeName";

const NAME_HIGHLIGHT_OPERATORS = new Set<SearchConditionOperator>([
  "contains",
  "equals",
  "startsWith",
  "endsWith",
]);

export interface HighlightTextSegment {
  readonly text: string;
  readonly highlight: boolean;
}

/**
 * Collects node-name filter values that can be highlighted in result names.
 */
export function extractNameHighlightTerms(
  conditions: readonly SearchCondition[],
): readonly string[] {
  const terms = new Set<string>();

  for (const condition of conditions) {
    if (condition.propertyAlias !== NODE_NAME_PROPERTY_ALIAS) {
      continue;
    }

    if (!NAME_HIGHLIGHT_OPERATORS.has(condition.operator)) {
      continue;
    }

    const value = condition.value?.trim();
    if (!value) {
      continue;
    }

    terms.add(value);
  }

  return [...terms];
}

/**
 * Splits display text into plain and highlighted segments for the given terms.
 */
export function splitTextByHighlightTerms(
  text: string,
  terms: readonly string[],
): readonly HighlightTextSegment[] {
  if (!text || terms.length === 0) {
    return [{ text, highlight: false }];
  }

  const normalizedTerms = [
    ...new Set(terms.map((term) => term.trim()).filter(Boolean)),
  ].sort((left, right) => right.length - left.length);

  if (normalizedTerms.length === 0) {
    return [{ text, highlight: false }];
  }

  const lowerText = text.toLowerCase();
  const ranges: Array<{ start: number; end: number }> = [];

  for (const term of normalizedTerms) {
    const lowerTerm = term.toLowerCase();
    let index = 0;

    while (index < lowerText.length) {
      const found = lowerText.indexOf(lowerTerm, index);
      if (found === -1) {
        break;
      }

      ranges.push({ start: found, end: found + term.length });
      index = found + term.length;
    }
  }

  if (ranges.length === 0) {
    return [{ text, highlight: false }];
  }

  ranges.sort((left, right) => left.start - right.start || left.end - right.end);

  const merged: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end) {
      merged.push({ ...range });
      continue;
    }

    last.end = Math.max(last.end, range.end);
  }

  const segments: HighlightTextSegment[] = [];
  let cursor = 0;

  for (const range of merged) {
    if (range.start > cursor) {
      segments.push({ text: text.slice(cursor, range.start), highlight: false });
    }

    segments.push({ text: text.slice(range.start, range.end), highlight: true });
    cursor = range.end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlight: false });
  }

  return segments;
}
