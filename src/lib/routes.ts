/**
 * Top-level menu — the labels people see in the fullscreen Menu overlay.
 * The actual URLs come from folders under src/app/ (Next.js App Router).
 */

export type MenuItem = {
  id: string;
  path: string;
  label: string;
  align: "left" | "right";
  meta: string;
  icon: string;
};

export const MENU: MenuItem[] = [
  { id: "home", path: "/", label: "Home", align: "right", meta: "Toronto, ON", icon: "map-pin" },
  { id: "work", path: "/work", label: "Work", align: "right", meta: "Featured projects", icon: "briefcase" },
  { id: "about", path: "/about", label: "About me", align: "left", meta: "Behind the orbit", icon: "planet" },
  { id: "archive", path: "/archive", label: "Archive", align: "left", meta: "Past work", icon: "archive" },
  { id: "journal", path: "/journal", label: "Journal", align: "left", meta: "Notes & process", icon: "quill-pen" },
  { id: "contact", path: "/contact", label: "Contact", align: "left", meta: "Let's talk", icon: "chat" },
];

export const NAV_LINKS = MENU.filter((route) => route.id !== "home");

/** Turn "/work/ford/" into a clean path we can switch on. */
export function normalizePath(pathname = "/") {
  const path = pathname.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

/**
 * Map the current URL to a short id used by the menu, footer, and nav theme.
 * Next.js already did the real routing — this is only for chrome (header/footer).
 */
export function routeIdFromPath(pathname = "/") {
  const path = normalizePath(pathname);
  if (path === "/") return "home";
  if (path === "/work") return "work";
  if (path.startsWith("/work/")) return "project";
  if (path === "/about") return "about";
  if (path === "/archive") return "archive";
  if (path === "/journal") return "journal";
  if (path.startsWith("/journal/")) return "journal-post";
  if (path === "/contact") return "contact";
  return "not-found";
}

/** Journal index + a journal article should both highlight "Journal" in the menu. */
export function isJournalSection(routeId = "") {
  return routeId === "journal" || routeId === "journal-post";
}

/** Work index + a case study should both highlight "Work" in the menu. */
export function isWorkSection(routeId = "") {
  return routeId === "work" || routeId === "project";
}

export function menuCurrentFor(routeId = "") {
  if (isJournalSection(routeId)) return "journal";
  if (isWorkSection(routeId)) return "work";
  return routeId;
}

/** Footer stays off the full-bleed pages (home, contact, archive, about). */
export function shouldShowFooter(routeId = "") {
  return routeId !== "home" && routeId !== "contact" && routeId !== "archive" && routeId !== "about";
}
