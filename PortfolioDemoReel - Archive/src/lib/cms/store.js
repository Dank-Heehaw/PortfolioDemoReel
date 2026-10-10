/**
 * CMS payload injected by the Next.js server (Directus) or empty for Vite/local.
 * Content modules read this at render time so local files remain the fallback.
 */

export const CMS_PAYLOAD_ID = "cms-payload";

/** @type {null | {
 *   source?: string,
 *   projects?: object[],
 *   journal?: object[],
 *   workCategories?: object[],
 *   archiveItems?: object[],
 * }} */
let payload = null;

export function getCmsPayload() {
  return payload;
}

export function setCmsPayload(next) {
  payload = next && typeof next === "object" ? next : null;
}

/** Read the JSON script tag written by the App Router page. */
export function hydrateCmsFromDocument() {
  if (typeof document === "undefined") return;
  const el = document.getElementById(CMS_PAYLOAD_ID);
  if (!el?.textContent?.trim()) return;
  try {
    const parsed = JSON.parse(el.textContent);
    if (parsed?.source === "directus") {
      setCmsPayload(parsed);
    }
  } catch (error) {
    console.warn("CMS payload could not be parsed; using local content.", error);
  }
}
