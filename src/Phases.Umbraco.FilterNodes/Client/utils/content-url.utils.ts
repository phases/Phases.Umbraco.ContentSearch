export const CONTENT_URL_NOT_PUBLISHED = "(Not Published)";

export const CONTENT_URL_UNAVAILABLE = "(Unavailable)";

const LEGACY_CONTENT_URL_NOT_PUBLISHED = "(Not published)";

export function isResolvableContentUrl(url?: string): boolean {
  const trimmed = url?.trim();

  if (!trimmed || trimmed === "—") {
    return false;
  }

  return (
    trimmed !== CONTENT_URL_NOT_PUBLISHED &&
    trimmed !== LEGACY_CONTENT_URL_NOT_PUBLISHED &&
    trimmed !== CONTENT_URL_UNAVAILABLE
  );
}

export function formatResultUrlDisplay(url?: string): string {
  const trimmed = url?.trim();

  if (!trimmed) {
    return CONTENT_URL_UNAVAILABLE;
  }

  if (trimmed === LEGACY_CONTENT_URL_NOT_PUBLISHED) {
    return CONTENT_URL_NOT_PUBLISHED;
  }

  return trimmed;
}
