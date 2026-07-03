import type { EditableFilterCondition } from "../controllers/filter-nodes-workspace.models.js";
import {
  NAME_HIGHLIGHT_OPERATORS,
  NODE_NAME_PROPERTY_ALIAS,
} from "../constants/filter-nodes.constants.js";
import type {
  FilterOperator,
  FilterablePropertyMetadata,
} from "../models/filter-models.js";
import {
  getPropertyMetadata,
  getPropertyFilterType,
} from "./filter-condition.utils.js";

export interface NameHighlightSegment {
  readonly text: string;
  readonly highlight: boolean;
}

export interface NameHighlightRule {
  readonly term: string;
  readonly operator: FilterOperator;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getNameHighlightRules(
  conditions: readonly EditableFilterCondition[],
  propertyMetadataByContentType: Readonly<
    Record<string, readonly FilterablePropertyMetadata[]>
  >,
  contentTypeAlias?: string,
): readonly NameHighlightRule[] {
  const rules: NameHighlightRule[] = [];

  for (const condition of conditions) {
    const term = condition.propertyValue.trim();
    const filterOperator = condition.filterOperator;

    if (!term || !filterOperator) {
      continue;
    }

    if (!NAME_HIGHLIGHT_OPERATORS.includes(filterOperator)) {
      continue;
    }

    if (
      contentTypeAlias &&
      condition.contentTypeAlias &&
      condition.contentTypeAlias !== contentTypeAlias
    ) {
      continue;
    }

    const propertyMetadata = getPropertyMetadata(
      propertyMetadataByContentType,
      condition.contentTypeAlias,
      condition.propertyAlias,
    );

    if (!isNameHighlightProperty(condition.propertyAlias, propertyMetadata)) {
      continue;
    }

    rules.push({
      term,
      operator: filterOperator,
    });
  }

  return rules;
}

function isNameHighlightProperty(
  propertyAlias: string,
  propertyMetadata: FilterablePropertyMetadata | undefined,
): boolean {
  if (propertyAlias === NODE_NAME_PROPERTY_ALIAS) {
    return true;
  }

  return getPropertyFilterType(propertyMetadata) === "Text";
}

export function buildHighlightedNameSegments(
  name: string,
  rules: readonly NameHighlightRule[],
): readonly NameHighlightSegment[] {
  if (!name || rules.length === 0) {
    return [{ text: name, highlight: false }];
  }

  const ranges = mergeHighlightRanges(
    rules.flatMap((rule) => getHighlightRanges(name, rule)),
  );

  if (ranges.length === 0) {
    return [{ text: name, highlight: false }];
  }

  const segments: NameHighlightSegment[] = [];
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (cursor < start) {
      segments.push({ text: name.slice(cursor, start), highlight: false });
    }

    segments.push({ text: name.slice(start, end), highlight: true });
    cursor = end;
  }

  if (cursor < name.length) {
    segments.push({ text: name.slice(cursor), highlight: false });
  }

  return segments;
}

function getHighlightRanges(
  name: string,
  rule: NameHighlightRule,
): Array<[number, number]> {
  const term = rule.term;

  if (!term) {
    return [];
  }

  const nameLower = name.toLowerCase();
  const termLower = term.toLowerCase();

  switch (rule.operator) {
    case "Contains": {
      const ranges: Array<[number, number]> = [];
      let index = 0;

      while (index < name.length) {
        const matchIndex = nameLower.indexOf(termLower, index);

        if (matchIndex === -1) {
          break;
        }

        ranges.push([matchIndex, matchIndex + term.length]);
        index = matchIndex + term.length;
      }

      return ranges;
    }
    case "StartsWith":
      return nameLower.startsWith(termLower) ? [[0, term.length]] : [];
    case "EndsWith":
      return nameLower.endsWith(termLower)
        ? [[name.length - term.length, name.length]]
        : [];
    case "Equals":
      return nameLower === termLower ? [[0, name.length]] : [];
    default:
      return [];
  }
}

function mergeHighlightRanges(
  ranges: Array<[number, number]>,
): Array<[number, number]> {
  if (ranges.length === 0) {
    return [];
  }

  const sorted = [...ranges].sort((left, right) => left[0] - right[0]);
  const merged: Array<[number, number]> = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    const previous = merged[merged.length - 1];

    if (current[0] <= previous[1]) {
      previous[1] = Math.max(previous[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}
