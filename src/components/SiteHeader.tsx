/**
 * Top bar: logo (goes home) + Menu button.
 * The fullscreen overlay lives in SiteMenu. GSAP in motion.js listens for
 * [data-menu-toggle] clicks.
 */

export function SiteHeader({ current = "home" }: { current?: string }) {
  return (
    <header className="site-nav">
      <span className="site-nav__backdrop" data-nav-backdrop aria-hidden="true" />
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
            src="/icons/logo-mark-outline.svg"
            alt=""
            width={32}
            height={32}
            decoding="async"
          />
          <img
            className="site-nav__mark-img site-nav__mark-img--hover"
            src="/icons/logo-mark.svg"
            alt=""
            width={32}
            height={32}
            decoding="async"
            aria-hidden="true"
          />
          <img
            className="site-nav__mark-img site-nav__mark-img--menu"
            src="/icons/logo-mark-dark.svg"
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
  );
}
