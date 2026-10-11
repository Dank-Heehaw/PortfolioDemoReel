import { html } from "../lib/html.js";
import { MENU } from "../lib/routes.js";
import { projectPath } from "../data/projects.js";
import { getWorkCategories } from "../data/work.js";

function remixIcon(path) {
  return html`<svg class="nav-menu__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${path}"/></svg>`;
}

function menuIcon(name) {
  // Official Remix Icon line glyphs (remixicon@4.6.0), inlined to avoid a CDN.
  const icons = {
    "map-pin": remixIcon("M12 20.8995L16.9497 15.9497C19.6834 13.2161 19.6834 8.78392 16.9497 6.05025C14.2161 3.31658 9.78392 3.31658 7.05025 6.05025C4.31658 8.78392 4.31658 13.2161 7.05025 15.9497L12 20.8995ZM12 23.7279L5.63604 17.364C2.12132 13.8492 2.12132 8.15076 5.63604 4.63604C9.15076 1.12132 14.8492 1.12132 18.364 4.63604C21.8787 8.15076 21.8787 13.8492 18.364 17.364L12 23.7279ZM12 13C13.1046 13 14 12.1046 14 11C14 9.89543 13.1046 9 12 9C10.8954 9 10 9.89543 10 11C10 12.1046 10.8954 13 12 13ZM12 15C9.79086 15 8 13.2091 8 11C8 8.79086 9.79086 7 12 7C14.2091 7 16 8.79086 16 11C16 13.2091 14.2091 15 12 15Z"),
    briefcase: remixIcon("M7 5V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V6C2 5.44772 2.44772 5 3 5H7ZM4 16V19H20V16H4ZM4 14H20V7H4V14ZM9 3V5H15V3H9ZM11 11H13V13H11V11Z"),
    planet: remixIcon("M3.91762 8.03672C3.32984 9.2334 3 10.5794 3 12C3 16.9705 7.02944 21 12 21C13.4216 21 14.7684 20.6697 15.9657 20.0812C16.8385 20.4545 17.6848 20.6993 18.4564 20.7622C19.3582 20.8357 20.3 20.6666 20.9818 19.9848C21.7339 19.2327 21.8625 18.169 21.7279 17.1728C21.6052 16.2639 21.2481 15.2539 20.726 14.2116C20.9051 13.5031 21 12.762 21 12C21 7.02942 16.9706 2.99998 12 2.99998C11.2389 2.99998 10.4987 3.09467 9.79103 3.27331C8.7474 2.74993 7.73605 2.39184 6.8261 2.26846C5.82897 2.13327 4.76406 2.26141 4.01121 3.01425C3.3287 3.69676 3.16001 4.63968 3.2341 5.54245C3.29752 6.31512 3.54313 7.16259 3.91762 8.03672ZM5.3224 5.96587C5.2734 5.75333 5.24204 5.55727 5.2274 5.37885C5.17928 4.79255 5.31727 4.53661 5.42543 4.42846C5.54452 4.30937 5.84797 4.15415 6.55739 4.25033C6.75482 4.2771 6.96951 4.32201 7.2 4.38559C6.50364 4.82539 5.87203 5.35796 5.3224 5.96587ZM19.6124 16.8031C19.6751 17.0317 19.7195 17.2446 19.7459 17.4405C19.8416 18.1487 19.6865 18.4516 19.5676 18.5706C19.4595 18.6786 19.204 18.8165 18.6189 18.7688C18.4419 18.7543 18.2475 18.7234 18.0368 18.6751C18.6427 18.1269 19.1736 17.4972 19.6124 16.8031ZM15.8812 17.8265C14.2046 16.9483 12.2571 15.5027 10.3752 13.6209C8.4954 11.7411 7.05092 9.79573 6.17241 8.1204C7.06357 6.78477 8.40124 5.77324 9.96933 5.29879C10.6108 5.10469 11.2923 4.99998 12 4.99998C15.866 4.99998 19 8.13399 19 12C19 12.7084 18.8951 13.3905 18.7006 14.0326C18.2261 15.5992 17.2155 16.9357 15.8812 17.8265ZM13.6052 18.8153C13.0901 18.9361 12.5528 19 12 19C8.13401 19 5 15.866 5 12C5 11.4478 5.06377 10.911 5.18429 10.3964C6.14883 11.9131 7.43475 13.5089 8.96096 15.0351C10.489 16.5631 12.0868 17.8503 13.6052 18.8153Z"),
    archive: remixIcon("M3 10H2V4.00293C2 3.44903 2.45531 3 2.9918 3H21.0082C21.556 3 22 3.43788 22 4.00293V10H21V20.0015C21 20.553 20.5551 21 20.0066 21H3.9934C3.44476 21 3 20.5525 3 20.0015V10ZM19 10H5V19H19V10ZM4 5V8H20V5H4ZM9 12H15V14H9V12Z"),
    "quill-pen": remixIcon("M6.93912 14.0328C6.7072 14.6563 6.51032 15.2331 6.33421 15.8155C7.29345 15.1189 8.43544 14.6767 9.75193 14.5121C12.2652 14.198 14.4976 12.5385 15.6279 10.4537L14.1721 8.99888L15.5848 7.58417C15.9185 7.25004 16.2521 6.91614 16.5858 6.58248C17.0151 6.15312 17.5 5.35849 18.0129 4.2149C12.4197 5.08182 8.99484 8.50647 6.93912 14.0328ZM17 8.99739L18 9.99669C17 12.9967 14 15.9967 10 16.4967C7.33146 16.8303 5.66421 18.6636 4.99824 21.9967H3C4 15.9967 6 1.99669 21 1.99669C20.0009 4.99402 19.0018 6.99313 18.0027 7.99402C17.6662 8.33049 17.3331 8.66382 17 8.99739Z"),
    chat: remixIcon("M10 3H14C18.4183 3 22 6.58172 22 11C22 15.4183 18.4183 19 14 19V22.5C9 20.5 2 17.5 2 11C2 6.58172 5.58172 3 10 3ZM12 17H14C17.3137 17 20 14.3137 20 11C20 7.68629 17.3137 5 14 5H10C6.68629 5 4 7.68629 4 11C4 14.61 6.46208 16.9656 12 19.4798V17Z"),
  };
  return icons[name] || "";
}

export function SiteNav({ current = "home" } = {}) {
  const homeActive = current === "home" ? ' aria-current="page"' : "";
  return html`<header class="site-nav">
    <span class="site-nav__backdrop" data-nav-backdrop aria-hidden="true"></span>
    <div class="site-nav__inner">
      <a class="site-nav__mark" href="/" data-nav aria-label="Waheed Khan home"${homeActive}>
        <img
          class="site-nav__mark-img site-nav__mark-img--default"
          src="/icons/logo-mark-outline.svg"
          alt=""
          width="32"
          height="32"
          decoding="async"
        />
        <img
          class="site-nav__mark-img site-nav__mark-img--hover"
          src="/icons/logo-mark.svg"
          alt=""
          width="32"
          height="32"
          decoding="async"
          aria-hidden="true"
        />
        <img
          class="site-nav__mark-img site-nav__mark-img--menu"
          src="/icons/logo-mark-dark.svg"
          alt=""
          width="32"
          height="32"
          decoding="async"
          aria-hidden="true"
        />
      </a>
      <button
        type="button"
        class="site-nav__toggle"
        data-menu-toggle
        aria-expanded="false"
        aria-controls="site-menu"
      >
        Menu
      </button>
    </div>
  </header>`;
}

function menuRow(item, current) {
  const active = item.id === current ? ' aria-current="page"' : "";
  const alignClass = item.align === "left" ? "nav-menu__row--left" : "nav-menu__row--right";
  const label = html`<span class="nav-menu__label-wrap">
    <span class="nav-menu__label reveal-line"><span class="nav-menu__label-inner reveal-line__inner">${item.label}</span></span>
    <span class="nav-menu__meta reveal-line"><span class="reveal-line__inner">/ ${item.meta}</span></span>
  </span>`;
  const icon = html`<span class="nav-menu__icon-slot">${menuIcon(item.icon)}</span>`;
  const children = item.align === "left" ? html`${label}${icon}` : html`${icon}${label}`;
  // Work expands in place; other items navigate + close.
  const workAttrs =
    item.id === "work"
      ? `data-menu-work href="${item.path}" aria-expanded="false" aria-controls="site-menu-work"`
      : `href="${item.path}" data-nav data-menu-close`;
  return html`<a
    class="nav-menu__row ${alignClass}"
    ${workAttrs}
    ${active}
  ><span class="nav-menu__row-inner">${children}</span></a>`;
}

/**
 * Full-screen black menu.
 * Choosing Work splits the list: Home exits up, later rows exit down,
 * and work categories + covers scroll into the opened center.
 */
export function SiteMenu({ current = "home" } = {}) {
  const workCategories = getWorkCategories();
  const workPanel = html`<div class="nav-menu__work" id="site-menu-work" data-menu-work-panel hidden>
    <div class="nav-menu__work-head" aria-hidden="true">
      <p class="nav-menu__work-eyebrow">Selected</p>
      <h2 class="nav-menu__work-title">Work</h2>
      <button type="button" class="nav-menu__work-back" data-menu-work-back>← Menu</button>
    </div>

    <div class="nav-menu__work-body">
      <nav class="nav-menu__work-cats" aria-label="Work categories">
        ${workCategories.map(
          (cat, index) =>
            html`<button
              type="button"
              class="nav-menu__work-cat${index === 0 ? " is-active" : ""}"
              data-work-cat="${cat.id}"
              data-work-cover="${cat.cover}"
              data-work-slug="${cat.projectSlug}"
              aria-pressed="${index === 0 ? "true" : "false"}"
            >
              <span class="nav-menu__label-wrap nav-menu__work-cat-inner">
                <span class="nav-menu__label nav-menu__work-cat-label">
                  <span class="nav-menu__label-inner">${cat.label}</span>
                </span>
                <span class="nav-menu__meta nav-menu__work-cat-meta">/ ${cat.meta}</span>
              </span>
            </button>`
        )}
      </nav>

      <div class="nav-menu__work-stage" data-work-stage>
        ${workCategories.map(
          (cat, index) =>
            html`<a
              class="nav-menu__work-card${index === 0 ? " is-active" : ""}"
              href="${projectPath(cat.projectSlug)}"
              data-work-card="${cat.id}"
              data-nav
              data-menu-close
              aria-label="Open ${cat.label} project"
            >
              <img src="${cat.cover}" alt="" loading="lazy" decoding="async" />
            </a>`
        )}
      </div>
    </div>

    <a class="nav-menu__work-cta" href="/work" data-nav data-menu-close data-menu-work-all>View all work →</a>
  </div>`;

  return html`<div class="nav-menu" id="site-menu" data-menu data-menu-panel="primary" hidden>
    <nav class="nav-menu__rows" aria-label="Primary" data-menu-primary>
      ${MENU.map((item) =>
        item.id === "work" ? html`${menuRow(item, current)}${workPanel}` : menuRow(item, current)
      )}
    </nav>
  </div>`;
}
