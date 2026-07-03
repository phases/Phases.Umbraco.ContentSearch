export const CONTENT_SEARCH_PATH_SEGMENT_SEPARATOR = " > ";

export const CONTENT_SEARCH_PATH_TRUNCATION_SUFFIX = " > ...";

const APPROXIMATE_CHARACTER_WIDTH_PX = 6.5;

const MIN_BREADCRUMB_DISPLAY_LENGTH = 12;

export interface ContentSearchPathColumnValue {
  readonly display: string;
  readonly tooltip: string;
  readonly segments: readonly string[];
  readonly isMuted: boolean;
}

export interface ContentSearchPathTruncationResult {
  readonly displaySegments: readonly string[];
  readonly showEllipsis: boolean;
}

export function splitContentSearchPathSegments(path: string): readonly string[] {
  return path
    .split(CONTENT_SEARCH_PATH_SEGMENT_SEPARATOR)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

export function estimateContentSearchPathDisplayLength(containerWidthPx: number): number {
  if (containerWidthPx <= 0) {
    return 40;
  }

  return Math.max(
    MIN_BREADCRUMB_DISPLAY_LENGTH,
    Math.floor(containerWidthPx / APPROXIMATE_CHARACTER_WIDTH_PX),
  );
}

export function truncateContentSearchBreadcrumb(
  segments: readonly string[],
  maxLength: number,
): ContentSearchPathTruncationResult {
  if (segments.length === 0) {
    return { displaySegments: [], showEllipsis: false };
  }

  const fullPath = segments.join(CONTENT_SEARCH_PATH_SEGMENT_SEPARATOR);

  if (fullPath.length <= maxLength) {
    return { displaySegments: segments, showEllipsis: false };
  }

  if (segments.length === 1) {
    return {
      displaySegments: [truncateToLength(segments[0], maxLength)],
      showEllipsis: false,
    };
  }

  const suffixLength = CONTENT_SEARCH_PATH_TRUNCATION_SUFFIX.length;
  let visibleCount = 1;

  while (visibleCount < segments.length) {
    const candidate =
      segments.slice(0, visibleCount).join(CONTENT_SEARCH_PATH_SEGMENT_SEPARATOR) +
      CONTENT_SEARCH_PATH_TRUNCATION_SUFFIX;

    if (candidate.length > maxLength) {
      break;
    }

    visibleCount++;
  }

  visibleCount = Math.max(1, visibleCount - 1);

  const displaySegments = segments.slice(0, visibleCount);
  const showEllipsis = visibleCount < segments.length;

  if (
    showEllipsis &&
    displaySegments.join(CONTENT_SEARCH_PATH_SEGMENT_SEPARATOR).length + suffixLength > maxLength
  ) {
    const firstSegmentBudget = Math.max(1, maxLength - suffixLength);
    return {
      displaySegments: [truncateToLength(displaySegments[0] ?? segments[0], firstSegmentBudget)],
      showEllipsis: true,
    };
  }

  return { displaySegments, showEllipsis };
}

export function buildContentSearchPathColumnValue(
  pathDisplay?: string | null,
  rawPath?: string | null,
): ContentSearchPathColumnValue {
  const resolved = resolvePathDisplay(pathDisplay, rawPath);

  if (!resolved) {
    return {
      display: "—",
      tooltip: "—",
      segments: [],
      isMuted: true,
    };
  }

  return {
    display: resolved,
    tooltip: resolved,
    segments: splitContentSearchPathSegments(resolved),
    isMuted: false,
  };
}

function resolvePathDisplay(
  pathDisplay?: string | null,
  rawPath?: string | null,
): string | undefined {
  const display = pathDisplay?.trim();

  if (display) {
    return display;
  }

  const normalized = rawPath?.trim();

  if (!normalized) {
    return undefined;
  }

  const segments = normalized
    .split(",")
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0 && !isNumericPathSegment(segment));

  if (segments.length === 0) {
    return undefined;
  }

  return segments.join(CONTENT_SEARCH_PATH_SEGMENT_SEPARATOR);
}

function isNumericPathSegment(segment: string): boolean {
  return /^\d+$/.test(segment);
}

function truncateToLength(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  if (maxLength <= 1) {
    return "…";
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
