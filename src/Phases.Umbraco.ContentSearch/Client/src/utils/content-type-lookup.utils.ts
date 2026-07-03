import type { SearchContentTypeOption } from "../models/search-builder.models.js";

export const DEFAULT_CONTENT_TYPE_ICON = "icon-document";

export type ContentTypeLookup = ReadonlyMap<string, SearchContentTypeOption>;

export function buildContentTypeLookup(
  contentTypes: readonly SearchContentTypeOption[],
): ContentTypeLookup {
  const lookup = new Map<string, SearchContentTypeOption>();

  for (const contentType of contentTypes) {
    lookup.set(contentType.alias.toLowerCase(), contentType);
  }

  return lookup;
}

export function resolveContentType(
  lookup: ContentTypeLookup,
  alias?: string | null,
): SearchContentTypeOption | undefined {
  const normalizedAlias = alias?.trim().toLowerCase();
  if (!normalizedAlias) {
    return undefined;
  }

  return lookup.get(normalizedAlias);
}

export function resolveContentTypeIcon(
  lookup: ContentTypeLookup,
  alias?: string | null,
): string {
  return resolveContentType(lookup, alias)?.icon?.trim() || DEFAULT_CONTENT_TYPE_ICON;
}

export function resolveContentTypeName(
  lookup: ContentTypeLookup,
  alias?: string | null,
): string {
  const resolved = resolveContentType(lookup, alias);
  if (resolved?.name?.trim()) {
    return resolved.name.trim();
  }

  const trimmedAlias = alias?.trim();
  return trimmedAlias || "—";
}
