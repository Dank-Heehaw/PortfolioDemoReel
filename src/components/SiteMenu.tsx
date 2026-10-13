import { MenuIcon } from "@/components/MenuIcons";
import { MENU, type MenuItem } from "@/lib/routes";
import { projectPath } from "@/lib/paths";
import type { WorkCategory } from "@/lib/work";

function MenuRowInner({
  align,
  label,
  meta,
  icon,
}: {
  align: "left" | "right";
  label: string;
  meta: string;
  icon?: string;
}) {
  const copy = (
    <span className="nav-menu__label-wrap">
      <span className="nav-menu__label reveal-line">
        <span className="nav-menu__label-inner reveal-line__inner">{label}</span>
      </span>
      <span className="nav-menu__meta reveal-line">
        <span className="reveal-line__inner">/ {meta}</span>
      </span>
    </span>
  );
  const glyph = icon ? (
    <span className="nav-menu__icon-slot">
      <MenuIcon name={icon} />
    </span>
  ) : null;
  const inner =
    align === "left" ? (
      <>
        {copy}
        {glyph}
      </>
    ) : (
      <>
        {glyph}
        {copy}
      </>
    );

  return <span className="nav-menu__row-inner">{inner}</span>;
}

function MenuRow({ item, current }: { item: MenuItem; current: string }) {
  const active = item.id === current;
  const alignClass = item.align === "left" ? "nav-menu__row--left" : "nav-menu__row--right";

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
      <MenuRowInner align={item.align} label={item.label} meta={item.meta} icon={item.icon} />
    </a>
  );
}

function WorkPanel({ workCategories }: { workCategories: WorkCategory[] }) {
  return (
    <div className="nav-menu__work" id="site-menu-work" data-menu-work-panel hidden>
      <figure className="nav-menu__work-preview" data-work-preview aria-hidden="true">
        <span className="nav-menu__work-preview-frame">
          <img alt="" data-work-preview-layer draggable={false} decoding="async" />
          <img alt="" data-work-preview-layer draggable={false} decoding="async" />
        </span>
      </figure>
      <div className="nav-menu__work-head" aria-hidden="true">
        <p className="nav-menu__work-eyebrow">Selected</p>
        <h2 className="nav-menu__work-title">Work</h2>
        <button type="button" className="nav-menu__work-back" data-menu-work-back>
          ← Menu
        </button>
      </div>

      <nav className="nav-menu__work-cats" aria-label="Work categories">
        {workCategories.map((cat, index) => (
          <a
            key={cat.id}
            className={`nav-menu__work-cat nav-menu__row--left${index === 0 ? " is-active" : ""}`}
            href={projectPath(cat.projectSlug)}
            data-work-cat={cat.id}
            data-work-cover={cat.cover}
            data-work-slug={cat.projectSlug}
            data-nav
            data-menu-close
            aria-current={index === 0 ? true : undefined}
          >
            <MenuRowInner align="left" label={cat.label} meta={cat.meta} />
          </a>
        ))}
      </nav>

      <a
        className="nav-menu__work-cta nav-menu__row--left"
        href="/work"
        data-nav
        data-menu-close
        data-menu-work-all
      >
        <MenuRowInner align="left" label="View all work" meta="Full index" />
      </a>
    </div>
  );
}

/** Full-screen black menu. Work expands in place to category rows. */
export function SiteMenu({
  current = "home",
  workCategories = [],
}: {
  current?: string;
  workCategories?: WorkCategory[];
}) {
  return (
    <div className="nav-menu" id="site-menu" data-menu data-menu-panel="primary" hidden>
      <nav className="nav-menu__rows" aria-label="Primary" data-menu-primary>
        {MENU.map((item) =>
          item.id === "work" ? (
            <span key={item.id} style={{ display: "contents" }}>
              <MenuRow item={item} current={current} />
              <WorkPanel workCategories={workCategories} />
            </span>
          ) : (
            <MenuRow key={item.id} current={current} item={item} />
          )
        )}
      </nav>
    </div>
  );
}
