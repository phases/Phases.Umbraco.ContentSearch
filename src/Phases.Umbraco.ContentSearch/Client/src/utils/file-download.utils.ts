/**
 * Triggers a browser download for the supplied blob using a temporary anchor element.
 */
export function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);

  // Dispatch a non-bubbling click so the backoffice router's document-level
  // anchor handler does not intercept the blob URL and attempt to navigate.
  anchor.dispatchEvent(
    new MouseEvent("click", { bubbles: false, cancelable: true, view: window }),
  );

  // Keep the object URL alive long enough for the download to start.
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }, 0);
}

/**
 * Extracts a file name from a Content-Disposition header when present.
 */
export function getFileNameFromContentDisposition(
  header: string | null,
  fallback: string,
): string {
  if (!header) {
    return fallback;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      // Fall through to the plain filename match below.
    }
  }

  const quotedMatch = /filename="?([^";]+)"?/i.exec(header);
  if (quotedMatch?.[1]) {
    return quotedMatch[1].trim();
  }

  return fallback;
}
