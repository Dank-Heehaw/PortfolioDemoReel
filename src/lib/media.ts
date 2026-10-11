/**
 * Turn a public file path into a URL the browser can load.
 * Example: "/projects/ford/cover.jpg" stays as-is.
 * We skip CMS/CDN prefixes for now — files live in /public.
 */
export function mediaUrl(path = "") {
  const raw = String(path || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  return raw.startsWith("/") ? raw : `/${raw}`;
}

/** Encode spaces in file names so "/Ford/Cover Slim.png" still works. */
export function encodeAssetPath(pathname = "") {
  return String(pathname)
    .split("/")
    .map((segment) => (segment ? encodeURIComponent(segment) : ""))
    .join("/");
}
