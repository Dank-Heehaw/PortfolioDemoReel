/**
 * Server-only CMS load. Used by the App Router catch-all page.
 * Never import this from client components — it reads DIRECTUS_TOKEN.
 */

import { fetchDirectusPayload } from "./directus.js";

export async function loadCmsPayload() {
  try {
    const payload = await fetchDirectusPayload();
    if (!payload) return { source: "local" };
    return payload;
  } catch (error) {
    console.warn("Directus CMS unavailable; using local content.", error);
    return { source: "local" };
  }
}

export function serializeCmsPayload(payload) {
  return JSON.stringify(payload ?? { source: "local" }).replace(/</g, "\\u003c");
}
