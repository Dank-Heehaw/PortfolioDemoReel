import { getProjects } from "./data/projects.js";
import { getArchivePosts } from "./data/archive.js";
import { html, mount } from "./lib/html.js";
import {
  bindFullpage,
  bindSiteNav,
  clearScrollTriggers,
  closeSiteMenu,
  MENU_REVEAL_DELAY,
  WORK_REVEAL_DELAY,
  prepareHero,
  revealHero,
  revealJournalArticle,
  revealPanel,
  runIntro,
} from "./lib/motion.js";
import { bindContactPage, revealContact } from "./lib/contact.js";
import { bindArchivePage, revealArchive } from "./lib/archive.js";
import { syncNavTheme } from "./lib/navTheme.js";
import {
  bindCursor,
  bindExternalTips,
  bindJournalLinkPreview,
} from "./lib/cursor.js";
import { hydrateCmsFromDocument } from "./lib/cms/store.js";
import { isInternalPath, isJournalSection, isWorkSection, matchRoute } from "./lib/routes.js";
import {
  Loader,
  SiteAbout,
  SiteArchive,
  SiteContact,
  SiteFooter,
  SiteHome,
  SiteJournal,
  SiteJournalPost,
  SiteMenu,
  SiteNav,
  SiteNotFound,
  SiteProject,
  SiteWork,
} from "./components/index.js";
import "./scss/styles.scss";

/**
 * Portfolio SPA bootstrap.
 * Used by Vite (`index.html`) and by Next.js (`PortfolioApp` client mount).
 * Keeps the same markup, GSAP motion, and client routing either way.
 *
 * @param {HTMLElement} appRoot — element to mount into (usually #app)
 * @returns {() => void} cleanup
 */
export function bootstrapPortfolio(appRoot) {
  if (!appRoot) {
    console.error("bootstrapPortfolio: missing root element");
    return () => {};
  }

  hydrateCmsFromDocument();

  // Cleanup fns returned by bind* helpers; called before each route swap.
  let unbindNav = () => {};
  let unbindFullpage = () => {};
  let unbindCursor = () => {};
  let unbindExternalTips = () => {};
  let unbindJournalLinkPreview = () => {};
  let unbindContact = () => {};
  let unbindArchive = () => {};
  let motionReady = false;
  let activeRoute = matchRoute(location.pathname).id;
  let navPending = false;
  let disposed = false;

  // All navigation is client-side, so the browser should not restore an old
  // scroll position while the current view is being animated into place.
  history.scrollRestoration = "manual";

  const setTitle = (route) => {
    if (route.id === "home") {
      document.title = "Waheed Khan — Interactive Media Designer";
      return;
    }
    if (route.id === "not-found") {
      document.title = "Page not found — Waheed Khan";
      return;
    }
    document.title = `${route.label} — Waheed Khan`;
  };

  const viewFor = (route) => {
    const matched = typeof route === "string" ? { id: route } : route;
    if (matched.id === "work") return SiteWork({ projects: getProjects() });
    if (matched.id === "project") return SiteProject({ slug: matched.slug });
    if (matched.id === "about") return SiteAbout();
    if (matched.id === "archive") return SiteArchive({ items: getArchivePosts() });
    if (matched.id === "journal") return SiteJournal();
    if (matched.id === "journal-post") return SiteJournalPost({ slug: matched.slug });
    if (matched.id === "contact") return SiteContact();
    if (matched.id === "not-found") return SiteNotFound();
    return SiteHome();
  };

  const menuCurrentFor = (routeId) => {
    if (isJournalSection(routeId)) return "journal";
    if (isWorkSection(routeId)) return "work";
    return routeId;
  };

  const siteMarkup = (route) => {
    const matched = typeof route === "string" ? matchRoute(route === "home" ? "/" : route) : route;
    const routeId = matched.id;
    const navCurrent = menuCurrentFor(routeId);
    return html`
      <div class="site" data-site>
        ${SiteNav({ current: navCurrent })}
        <div class="site-view" data-site-view>${viewFor(matched)}</div>
        ${routeId === "home" ? "" : SiteFooter()}
        ${SiteMenu({ current: navCurrent })}
      </div>
    `;
  };

  // Initial mount: loader overlay + page for the current URL.
  const initialRoute = matchRoute(location.pathname);
  mount(
    appRoot,
    html`
      ${Loader()}
      <div class="page">${siteMarkup(initialRoute)}</div>
    `
  );

  const page = appRoot.querySelector(".page");
  const siteRoot = appRoot.querySelector("[data-site]");
  prepareHero(siteRoot);
  setTitle(initialRoute);
  syncNavTheme(initialRoute.id, siteRoot);

  const playSiteView = (root, routeId, { heroDelay = 0 } = {}) => {
    unbindFullpage();
    unbindContact();
    unbindArchive();

    const view = root?.querySelector("[data-site-view]");
    if (routeId === "home") {
      unbindFullpage = bindFullpage(root);
      prepareHero(root);
      revealHero(root, { delay: heroDelay });
      return;
    }
    if (routeId === "contact") {
      revealContact(view, { delay: heroDelay });
      unbindContact = bindContactPage(root);
      return;
    }
    if (routeId === "archive") {
      revealArchive(view, { delay: heroDelay });
      unbindArchive = bindArchivePage(root);
      return;
    }
    if (routeId === "journal-post" || routeId === "project") {
      revealJournalArticle(view, { delay: heroDelay });
      return;
    }
    revealPanel(view, { delay: heroDelay });
  };

  const animateSite = ({ heroDelay = 0 } = {}) => {
    clearScrollTriggers();
    unbindFullpage();
    playSiteView(appRoot.querySelector("[data-site]"), activeRoute, { heroDelay });
  };

  const syncNavState = (root, routeId) => {
    const mark = root.querySelector(".site-nav__mark");
    if (mark) {
      if (routeId === "home") mark.setAttribute("aria-current", "page");
      else mark.removeAttribute("aria-current");
    }

    const menuCurrent = menuCurrentFor(routeId);
    root.querySelectorAll(".nav-menu__row[data-nav]").forEach((row) => {
      const route = matchRoute(row.getAttribute("href") || "/");
      if (route.id === menuCurrent) row.setAttribute("aria-current", "page");
      else row.removeAttribute("aria-current");
    });
  };

  const syncFooter = (root, routeId) => {
    const menu = root.querySelector("[data-menu]");
    let footer = root.querySelector("[data-site-footer]");

    if (routeId === "home" || routeId === "contact" || routeId === "archive") {
      footer?.remove();
      return;
    }

    if (!footer && menu) {
      const wrap = document.createElement("div");
      wrap.innerHTML = SiteFooter();
      footer = wrap.firstElementChild;
      menu.before(footer);
    }
  };

  /** Soft swap keeps nav/menu alive so the close animation can finish over the new page. */
  const renderSite = (route, { revealDelay = 0 } = {}) => {
    if (disposed) return;
    const matched = typeof route === "string" ? matchRoute(route) : route;
    activeRoute = matched.id;
    const root = appRoot.querySelector("[data-site]");
    if (!root) return;

    clearScrollTriggers();
    unbindFullpage();

    const view = root.querySelector("[data-site-view]");
    if (view) mount(view, viewFor(matched));

    syncFooter(root, matched.id);
    syncNavState(root, matched.id);
    syncNavTheme(matched.id, root);
    window.scrollTo({ top: 0 });

    if (motionReady) {
      playSiteView(root, matched.id, { heroDelay: revealDelay });
    }
  };

  const go = (path, { replace = false, revealDelay = 0 } = {}) => {
    const route = matchRoute(path);
    const method = replace ? "replaceState" : "pushState";
    history[method]({}, "", route.path);
    setTitle(route);
    renderSite(route, { revealDelay });
  };

  const onAppClick = async (event) => {
    const link = event.target.closest("a[data-nav]");
    if (!link || link.target === "_blank") return;
    const href = link.getAttribute("href") || "/";
    if (!isInternalPath(href)) return;
    event.preventDefault();
    if (navPending) return;

    navPending = true;
    try {
      const workAll = link.closest("[data-menu-work-all]");
      const fromWorkPanel = Boolean(workAll && document.body.classList.contains("is-menu-work"));
      const origin = link.closest(".nav-menu__row");
      const syncWithMenu = document.body.classList.contains("is-menu-open") || Boolean(origin) || fromWorkPanel;
      await closeSiteMenu({ origin, fromWorkPanel });
      if (href === location.pathname) return;
      go(href, {
        revealDelay: fromWorkPanel
          ? WORK_REVEAL_DELAY
          : syncWithMenu
            ? MENU_REVEAL_DELAY
            : href === "/"
              ? 0.12
              : 0,
      });
    } finally {
      navPending = false;
    }
  };

  const onPopState = () => {
    const route = matchRoute(location.pathname);
    setTitle(route);
    renderSite(route);
  };

  appRoot.addEventListener("click", onAppClick);
  window.addEventListener("popstate", onPopState);

  // Intro, then chrome bindings (same sequence as the Vite entry).
  const loader = appRoot.querySelector(".loader");

  if (loader && page) {
    runIntro({
      loader,
      page,
      onDone: () => {
        if (disposed) return;
        motionReady = true;
        animateSite({ heroDelay: 0.35 });
      },
    });
  } else {
    motionReady = true;
    animateSite();
  }

  try {
    unbindNav = bindSiteNav(appRoot.querySelector("[data-site]"));
    unbindCursor = bindCursor();
    unbindExternalTips = bindExternalTips(appRoot);
    unbindJournalLinkPreview = bindJournalLinkPreview(appRoot);
  } catch (error) {
    console.error("Chrome bind failed:", error);
  }

  return () => {
    disposed = true;
    appRoot.removeEventListener("click", onAppClick);
    window.removeEventListener("popstate", onPopState);
    clearScrollTriggers();
    unbindFullpage();
    unbindContact();
    unbindArchive();
    unbindNav();
    unbindCursor();
    unbindExternalTips();
    unbindJournalLinkPreview();
    appRoot.replaceChildren();
    document.body.classList.remove("is-menu-open", "nav-theme-dark", "is-archive-viewer");
    document.documentElement.classList.remove("has-custom-cursor");
  };
}

// Vite entry: auto-boot when loaded as a module from index.html.
if (typeof document !== "undefined" && document.querySelector("#app") && !window.__PORTFOLIO_NEXT__) {
  bootstrapPortfolio(document.querySelector("#app"));
}
