/**
 * Public media URLs.
 *
 * Production media is uploaded in Directus and served as
 * `{DIRECTUS_URL}/assets/{file-id}` (bytes live on local Docker disk or
 * Cloudflare R2 — see docs/directus-media.md). This helper only prefixes
 * leftover site-relative paths. Do not put large files in Git or LFS.
 */

export function mediaBaseUrl() {
  const value =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_MEDIA_BASE_URL) ||
    "";
  return String(value).trim().replace(/\/+$/, "");
}

export function isFileUuid(value = "") {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(value).trim()
  );
}

/** Absolute Directus asset URL for a file id, path, or expanded file object. */
export function directusAssetUrl(origin = "", file) {
  const base = String(origin || "").replace(/\/+$/, "");
  if (!file || !base) return "";
  if (typeof file === "string") {
    const value = file.trim();
    if (!value) return "";
    if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
    if (isFileUuid(value)) return `${base}/assets/${value}`;
    if (value.startsWith("/assets/")) return `${base}${value}`;
    return "";
  }
  if (typeof file === "object") {
    if (file.filename_download && /^https?:\/\//i.test(file.filename_download)) {
      return file.filename_download;
    }
    if (file.id) return directusAssetUrl(base, file.id);
  }
  return "";
}

/** Prefix a site-root path (`/projects/...`) with an optional CDN, or pass https through. */
export function mediaUrl(path = "") {
  const raw = String(path || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  if (isFileUuid(raw)) return raw;
  const pathname = raw.startsWith("/") ? raw : `/${raw}`;
  const base = mediaBaseUrl();
  return base ? `${base}${pathname}` : pathname;
}
