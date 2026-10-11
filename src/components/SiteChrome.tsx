"use client";

/**
 * Shared chrome around every page.
 *
 * Next.js still owns the URL (folders under src/app).
 * This client wrapper:
 *  1. draws header / menu / footer
 *  2. runs GSAP nav, cursor, and the first-visit loader once
 *  3. turns <a data-nav> clicks into router.push after the menu closes
 */

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteMenu } from "@/components/SiteMenu";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteLoader } from "@/components/SiteLoader";
import {
  menuCurrentFor,
  routeIdFromPath,
  shouldShowFooter,
} from "@/lib/routes";
import { syncNavTheme } from "@/lib/navTheme";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
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

    const onNavClick = async (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.("a[data-nav], a[data-menu-work-all]");
      if (!link || link.getAttribute("target") === "_blank") return;

      const href = link.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;

      event.preventDefault();

      const { closeSiteMenu } = await import("@/lib/motion.js");
      const workAll = link.closest("[data-menu-work-all]");
      const fromWorkPanel = Boolean(
        workAll && document.body.classList.contains("is-menu-work")
      );
      const origin = link.closest(".nav-menu__row");

      await closeSiteMenu({ origin, fromWorkPanel });
      if (href === window.location.pathname) return;
      router.push(href);
    };

    root.addEventListener("click", onNavClick);

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
      unbindNav();
      unbindCursor();
      unbindTips();
      unbindPreview();
    };
  }, [router]);

  const navTheme =
    routeId === "work" || routeId === "project" || routeId === "archive"
      ? "dark"
      : "light";

  return (
    <div ref={rootRef}>
      <SiteLoader />
      <div className="page" ref={pageRef}>
        <div className="site" data-site data-nav-theme={navTheme}>
          <SiteHeader current={menuCurrent} />
          <div className="site-view" data-site-view>
            {children}
          </div>
          {showFooter ? <SiteFooter /> : null}
          <SiteMenu current={menuCurrent} />
        </div>
      </div>
    </div>
  );
}
