/**
 * Top bar: logo (goes home) + Menu button.
 * The fullscreen overlay lives in SiteMenu. GSAP in motion.js listens for
 * [data-menu-toggle] clicks.
 */

import type { SiteMarks } from "@/lib/site";

const FALLBACK_MARKS: SiteMarks = {
  logo: "/icons/logo-mark-outline.svg",
  logoHover: "/icons/logo-mark.svg",
  logoMenu: "/icons/logo-mark-dark.svg",
};

export function SiteHeader({
  current = "home",
  marks = FALLBACK_MARKS,
}: {
  current?: string;
  marks?: SiteMarks;
}) {
  return (
    <>
      {/* Sibling of the controls so the black bar does not invert the page. */}
      <span className="site-nav__backdrop" data-nav-backdrop aria-hidden="true" />
      <header className="site-nav">
        <div className="site-nav__inner">
          <a
            className="site-nav__mark"
            href="/"
            data-nav
            aria-label="Waheed Khan home"
            {...(current === "home" ? { "aria-current": "page" as const } : {})}
          >
            <img
              className="site-nav__mark-img site-nav__mark-img--default"
              src={marks.logo}
              alt=""
              width={32}
              height={32}
              decoding="async"
            />
            <img
              className="site-nav__mark-img site-nav__mark-img--hover"
              src={marks.logoHover}
              alt=""
              width={32}
              height={32}
              decoding="async"
              aria-hidden="true"
            />
            <img
              className="site-nav__mark-img site-nav__mark-img--menu"
              src={marks.logoMenu}
              alt=""
              width={32}
              height={32}
              decoding="async"
              aria-hidden="true"
            />
          </a>
          <button
            type="button"
            className="site-nav__toggle"
            data-menu-toggle
            aria-expanded="false"
            aria-controls="site-menu"
          >
            Menu
          </button>
        </div>
      </header>
    </>
  );
}
