import { getJournalPost } from "../data/journal.js";
import { getProject } from "../data/projects.js";

// The menu is the single source of truth for the top-level URL structure.
export const MENU = [
  { id: "home", path: "/", label: "Home", align: "right", meta: "Toronto, ON", icon: "map-pin" },
  { id: "work", path: "/work", label: "Work", align: "right", meta: "Featured projects", icon: "briefcase" },
  { id: "about", path: "/about", label: "About me", align: "left", meta: "Behind the orbit", icon: "planet" },
  { id: "archive", path: "/archive", label: "Archive", align: "left", meta: "Past work", icon: "archive" },
  { id: "journal", path: "/journal", label: "Journal", align: "left", meta: "Notes & process", icon: "quill-pen" },
  { id: "contact", path: "/contact", label: "Contact", align: "left", meta: "Let's talk", icon: "chat" },
];

export const ROUTES = MENU;

export const NAV_LINKS = ROUTES.filter((route) => route.id !== "home");

/** Remove trailing slashes so equivalent URLs match the same route. */
export function normalizePath(pathname = "/") {
  const path = pathname.replace(/\/+$/, "");
  return path === "" ? "/" : path;
}

export function matchRoute(pathname = "/") {
  const path = normalizePath(pathname);
  const exact = ROUTES.find((route) => route.path === path);
  if (exact) return exact;

  // Detail pages are validated against their data source before they become routes.
  const workMatch = path.match(/^\/work\/([^/]+)$/);
  if (workMatch) {
    const project = getProject(workMatch[1]);
    if (project) {
      return {
        id: "project",
        path,
        label: project.title,
        slug: project.slug,
        parent: "work",
      };
    }
  }

  const journalMatch = path.match(/^\/journal\/([^/]+)$/);
  if (journalMatch) {
    const post = getJournalPost(journalMatch[1]);
    if (post && !post.externalUrl) {
      return {
        id: "journal-post",
        path,
        label: post.title,
        slug: post.slug,
        parent: "journal",
      };
    }
  }

  return {
    id: "not-found",
    path,
    label: "Page not found",
  };
}

export function isInternalPath(href = "") {
  if (!href.startsWith("/")) return false;
  return !href.startsWith("//");
}

export function isJournalSection(routeId = "") {
  return routeId === "journal" || routeId === "journal-post";
}

export function isWorkSection(routeId = "") {
  return routeId === "work" || routeId === "project";
}
