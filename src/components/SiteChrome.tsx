"use client";

/**
 * Shared chrome around every page.
 *
 * Next.js still owns the URL (folders under src/app).
 * This client wrapper:
 *  1. draws header / menu / footer
 *  2. runs GSAP nav, cursor, and the first-visit loader once
 *  3. turns <a data-nav> clicks into router.push while the menu is still covering
 */

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteMenu } from "@/components/SiteMenu";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteLoader } from "@/components/SiteLoader";
import { MENU, menuCurrentFor, normalizePath, routeIdFromPath, shouldShowFooter } from "@/lib/routes";
import { projectPath } from "@/lib/paths";
import { syncNavTheme } from "@/lib/navTheme";
import type { WorkCategory } from "@/lib/work";
import type { SiteMarks } from "@/lib/site";

export function SiteChrome({
  children,
  workCategories = [],
  marks,
}: {
  children: React.ReactNode;
  workCategories?: WorkCategory[];
  marks?: SiteMarks;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;
  const routeId = routeIdFromPath(pathname);
  const menuCurrent = menuCurrentFor(routeId);
  const showFooter = shouldShowFooter(routeId);

  // Flip the nav between light/dark when the URL changes.
  useEffect(() => {
    const site = rootRef.current?.querySelector("[data-site]");
    syncNavTheme(routeId, site);
  }, [routeId]);

  // Bind menu, cursor, and the intro loader once per visit.
  useEffect(() => {
    const root = rootRef.current;
    const page = pageRef.current;
    if (!root || !page) return;

    const site = root.querySelector("[data-site]");
    let unbindNav = () => {};
    let unbindCursor = () => {};
    let unbindTips = () => {};
    let unbindPreview = () => {};
    let cancelled = false;

    const waitForRoute = (target: string) => {
      const wanted = normalizePath(target);
      if (normalizePath(pathnameRef.current) === wanted) return Promise.resolve();
      return new Promise<void>((resolve) => {
        const started = performance.now();
        const timer = window.setInterval(() => {
          const arrived = normalizePath(pathnameRef.current) === wanted;
          if (arrived || performance.now() - started > 8000) {
            window.clearInterval(timer);
            resolve();
          }
        }, 40);
      });
    };

    const onNavClick = async (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.("a[data-nav], a[data-menu-work-all]");
      if (!link || link.getAttribute("target") === "_blank") return;

      const href = link.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;

      event.preventDefault();
      if (root.dataset.navPending === "1") return;

      const nextPath = normalizePath(href);
      const samePage = nextPath === normalizePath(window.location.pathname);
      const menuWasOpen = document.body.classList.contains("is-menu-open");
      if (samePage && !menuWasOpen) return;

      root.dataset.navPending = "1";
      const site = root.querySelector("[data-site]");
      // Drop the outgoing page immediately. The menu already covers it when open.
      if (!samePage && !menuWasOpen) {
        site?.classList.add("is-route-pending");
        window.setTimeout(() => site?.classList.remove("is-route-pending"), 8000);
      }

      const isHomeMark = Boolean(link.closest(".site-nav__mark"));
      const workAll = link.closest("[data-menu-work-all]");
      const workCat = link.closest("[data-work-cat]");
      const fromWorkPanel = Boolean(
        (workAll || workCat) && document.body.classList.contains("is-menu-work")
      );
      const delay = fromWorkPanel ? 0.42 : menuWasOpen ? 0.32 : nextPath === "/" ? 0.12 : 0;
      document.documentElement.dataset.revealDelay = String(delay);

      if (!samePage) router.push(href);

      try {
        const motion = await import("@/lib/motion.js");
        let origin = link.closest(".nav-menu__row");
        if (!origin && workCat) {
          origin = root.querySelector("[data-menu-work]");
        }
        // Logo uses the same Home-row close as choosing Home in the menu.
        if (!origin && isHomeMark && menuWasOpen) {
          origin = root.querySelector('.nav-menu__row[href="/"]');
        }

        // Keep the menu over the old page until the next route is actually on screen.
        if (menuWasOpen && !samePage) await waitForRoute(nextPath);
        if (menuWasOpen) {
          await motion.closeSiteMenu({ origin, fromWorkPanel });
        }
      } finally {
        root.dataset.navPending = "";
      }
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.("a[data-nav], a[data-menu-work-all], a[data-menu-work]");
      const href = link?.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;
      router.prefetch(href);
    };

    root.addEventListener("click", onNavClick);
    root.addEventListener("pointerover", onPointerOver);

    Promise.all([import("@/lib/motion.js"), import("@/lib/cursor.js")]).then(
      ([motion, cursor]) => {
        if (cancelled || !rootRef.current || !pageRef.current) return;

        unbindNav = motion.bindSiteNav(site || root) || (() => {});
        unbindCursor = cursor.bindCursor() || (() => {});
        unbindTips = cursor.bindExternalTips(root) || (() => {});
        unbindPreview = cursor.bindJournalLinkPreview(root) || (() => {});

        const loader = root.querySelector(".loader");
        const alreadyPlayed = window.sessionStorage.getItem("portfolio-intro") === "1";
        if (loader && !alreadyPlayed) {
          motion.runIntro({
            loader,
            page: pageRef.current,
            onDone: () => window.sessionStorage.setItem("portfolio-intro", "1"),
          });
        } else if (loader) {
          loader.setAttribute("aria-busy", "false");
          (loader as HTMLElement).style.display = "none";
        }
      }
    );

    return () => {
      cancelled = true;
      root.removeEventListener("click", onNavClick);
      root.removeEventListener("pointerover", onPointerOver);
      unbindNav();
      unbindCursor();
      unbindTips();
      unbindPreview();
    };
  }, [router]);

  useEffect(() => {
    rootRef.current?.querySelector("[data-site]")?.classList.remove("is-route-pending");
  }, [pathname]);

  useEffect(() => {
    for (const item of MENU) router.prefetch(item.path);
    for (const cat of workCategories) router.prefetch(projectPath(cat.projectSlug));
  }, [router, workCategories]);

  const navTheme =
    routeId === "work" || routeId === "project" || routeId === "archive"
      ? "dark"
      : "light";

  return (
    <div ref={rootRef}>
      <SiteLoader />
      <div className="page" ref={pageRef}>
        <div className="site" data-site data-nav-theme={navTheme}>
          <SiteHeader current={menuCurrent} marks={marks} />
          <div className="site-view" data-site-view>
            {children}
          </div>
          {showFooter ? <SiteFooter /> : null}
          <SiteMenu current={menuCurrent} workCategories={workCategories} />
        </div>
      </div>
    </div>
  );
}
