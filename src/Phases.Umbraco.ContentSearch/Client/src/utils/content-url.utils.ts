export const CONTENT_URL_NOT_PUBLISHED = "Not published";
export const CONTENT_URL_UNAVAILABLE = "—";
export const CONTENT_URL_MULTIPLE = "Multiple";

export interface ContentSearchUrlColumnValue {
  readonly display: string;
  readonly href?: string;
  readonly tooltip: string;
  readonly isMuted: boolean;
}

export function isResolvableContentUrl(url?: string | null): boolean {
  const normalized = sanitizeUrlValue(url);

  if (!normalized) {
    return false;
  }

  return (
    normalized !== CONTENT_URL_NOT_PUBLISHED &&
    normalized !== CONTENT_URL_UNAVAILABLE &&
    normalized !== CONTENT_URL_MULTIPLE &&
    (normalized.startsWith("http://") ||
      normalized.startsWith("https://") ||
      normalized.startsWith("/"))
  );
}

export function toRelativeUrlDisplay(url: string): string {
  const normalized = url.trim();

  if (!normalized || normalized.startsWith("/")) {
    return normalized || CONTENT_URL_UNAVAILABLE;
  }

  try {
    const parsed = new URL(normalized);
    const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;

    return relative || "/";
  } catch {
    return normalized;
  }
}

export function buildUrlColumnValue(
  url?: string | null,
  urlDisplay?: string | null,
): ContentSearchUrlColumnValue {
  const rawUrl = sanitizeUrlValue(url);
  const href = rawUrl && isResolvableContentUrl(rawUrl) ? rawUrl : undefined;

  if (!href) {
    return {
      display: CONTENT_URL_UNAVAILABLE,
      href: undefined,
      tooltip: resolveUnavailableUrlTooltip(urlDisplay, rawUrl),
      isMuted: true,
    };
  }

  const display = sanitizeUrlDisplay(urlDisplay) ?? toRelativeUrlDisplay(href);

  return {
    display,
    href,
    tooltip: href,
    isMuted: false,
  };
}

function sanitizeUrlValue(url?: string | null): string | undefined {
  const normalized = url?.trim();

  if (!normalized || isNullLikeValue(normalized)) {
    return undefined;
  }

  return normalized;
}

function sanitizeUrlDisplay(urlDisplay?: string | null): string | undefined {
  const normalized = urlDisplay?.trim();

  if (
    !normalized ||
    isNullLikeValue(normalized) ||
    normalized === CONTENT_URL_UNAVAILABLE ||
    normalized === CONTENT_URL_NOT_PUBLISHED ||
    normalized === CONTENT_URL_MULTIPLE
  ) {
    return undefined;
  }

  return normalized;
}

function resolveUnavailableUrlTooltip(
  urlDisplay?: string | null,
  rawUrl?: string | null,
): string {
  const display = urlDisplay?.trim();

  if (display && !isNullLikeValue(display) && display !== CONTENT_URL_UNAVAILABLE) {
    return display;
  }

  const raw = sanitizeUrlValue(rawUrl);

  if (raw === CONTENT_URL_NOT_PUBLISHED || raw === CONTENT_URL_MULTIPLE) {
    return raw;
  }

  return CONTENT_URL_UNAVAILABLE;
}

function isNullLikeValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();

  return normalized === "null" || normalized === "undefined";
}
