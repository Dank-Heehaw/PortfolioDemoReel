import { MenuIcon } from "@/components/MenuIcons";
import { MENU, type MenuItem } from "@/lib/routes";
import { projectPath } from "@/lib/projects";
import { getWorkCategories } from "@/lib/work";

function MenuRow({ item, current }: { item: MenuItem; current: string }) {
  const active = item.id === current;
  const alignClass = item.align === "left" ? "nav-menu__row--left" : "nav-menu__row--right";
  const label = (
    <span className="nav-menu__label-wrap">
      <span className="nav-menu__label reveal-line">
        <span className="nav-menu__label-inner reveal-line__inner">{item.label}</span>
      </span>
      <span className="nav-menu__meta reveal-line">
        <span className="reveal-line__inner">/ {item.meta}</span>
      </span>
    </span>
  );
  const icon = (
    <span className="nav-menu__icon-slot">
      <MenuIcon name={item.icon} />
    </span>
  );
  const inner = item.align === "left" ? (
    <>
      {label}
      {icon}
    </>
  ) : (
    <>
      {icon}
      {label}
    </>
  );

  // Work opens the in-menu category panel. Other rows navigate + close.
  const workProps =
    item.id === "work"
      ? {
          "data-menu-work": true,
          href: item.path,
          "aria-expanded": false,
          "aria-controls": "site-menu-work",
        }
      : {
          href: item.path,
          "data-nav": true,
          "data-menu-close": true,
        };

  return (
    <a
      className={`nav-menu__row ${alignClass}`}
      {...workProps}
      {...(active ? { "aria-current": "page" as const } : {})}
    >
      <span className="nav-menu__row-inner">{inner}</span>
    </a>
  );
}

function WorkPanel() {
  const workCategories = getWorkCategories();

  return (
    <div className="nav-menu__work" id="site-menu-work" data-menu-work-panel hidden>
      <div className="nav-menu__work-head" aria-hidden="true">
        <p className="nav-menu__work-eyebrow">Selected</p>
        <h2 className="nav-menu__work-title">Work</h2>
        <button type="button" className="nav-menu__work-back" data-menu-work-back>
          ← Menu
        </button>
      </div>

      <div className="nav-menu__work-body">
        <nav className="nav-menu__work-cats" aria-label="Work categories">
          {workCategories.map((cat, index) => (
            <button
              key={cat.id}
              type="button"
              className={`nav-menu__work-cat${index === 0 ? " is-active" : ""}`}
              data-work-cat={cat.id}
              data-work-cover={cat.cover}
              data-work-slug={cat.projectSlug}
              aria-pressed={index === 0}
            >
              <span className="nav-menu__label-wrap nav-menu__work-cat-inner">
                <span className="nav-menu__label nav-menu__work-cat-label">
                  <span className="nav-menu__label-inner">{cat.label}</span>
                </span>
                <span className="nav-menu__meta nav-menu__work-cat-meta">/ {cat.meta}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="nav-menu__work-stage" data-work-stage>
          {workCategories.map((cat, index) => (
            <a
              key={cat.id}
              className={`nav-menu__work-card${index === 0 ? " is-active" : ""}`}
              href={projectPath(cat.projectSlug)}
              data-work-card={cat.id}
              data-nav
              data-menu-close
              aria-label={`Open ${cat.label} project`}
            >
              <img src={cat.cover} alt="" loading="lazy" decoding="async" />
            </a>
          ))}
        </div>
      </div>

      <a className="nav-menu__work-cta" href="/work" data-nav data-menu-close data-menu-work-all>
        View all work →
      </a>
    </div>
  );
}

/** Full-screen black menu. Work expands in place to category cards. */
export function SiteMenu({ current = "home" }: { current?: string }) {
  return (
    <div className="nav-menu" id="site-menu" data-menu data-menu-panel="primary" hidden>
      <nav className="nav-menu__rows" aria-label="Primary" data-menu-primary>
        {MENU.map((item) =>
          item.id === "work" ? (
            <span key={item.id} style={{ display: "contents" }}>
              <MenuRow item={item} current={current} />
              <WorkPanel />
            </span>
          ) : (
            <MenuRow key={item.id} item={item} current={current} />
          )
        )}
      </nav>
    </div>
  );
}
