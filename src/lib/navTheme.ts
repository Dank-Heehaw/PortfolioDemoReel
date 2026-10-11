/** Work, project, and archive sit on dark backgrounds — the nav flips to light-on-dark. */
const DARK_NAV_ROUTES = new Set(["archive", "work", "project"]);

export function navThemeForRoute(routeId = "") {
  return DARK_NAV_ROUTES.has(routeId) ? "dark" : "light";
}

/** Keep <body> classes in sync when the URL changes. */
export function syncNavTheme(routeId: string, root?: Element | null) {
  const theme = navThemeForRoute(routeId);
  const isDark = theme === "dark";

  document.body.classList.toggle("nav-theme-dark", isDark);

  if (!isDark) {
    document.body.classList.remove("is-archive", "is-archive-viewer");
  }

  root?.setAttribute("data-nav-theme", theme);
}
