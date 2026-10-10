/** Routes whose page background sits behind a light-on-dark nav treatment. */
const DARK_NAV_ROUTES = new Set(["archive", "work", "project"]);

export function navThemeForRoute(routeId = "") {
  return DARK_NAV_ROUTES.has(routeId) ? "dark" : "light";
}

/** Keep body/site nav theme in sync on every route change (and as a fallback cleanup). */
export function syncNavTheme(routeId, root = document.querySelector("[data-site]")) {
  const theme = navThemeForRoute(routeId);
  const isDark = theme === "dark";

  document.body.classList.toggle("nav-theme-dark", isDark);

  if (!isDark) {
    document.body.classList.remove("is-archive", "is-archive-viewer");
  }

  root?.setAttribute("data-nav-theme", theme);
}
