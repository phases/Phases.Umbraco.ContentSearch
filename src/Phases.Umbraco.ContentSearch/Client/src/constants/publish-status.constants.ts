export const PUBLISH_STATUS_PROPERTY_ALIAS = "publishStatus";

export const PUBLISH_STATUS_VALUE_OPTIONS = [
  { value: "1", label: "Published" },
  { value: "0", label: "Unpublished" },
] as const;

export function isPublishStatusPropertyAlias(alias: string): boolean {
  return alias.trim().toLowerCase() === PUBLISH_STATUS_PROPERTY_ALIAS;
}
