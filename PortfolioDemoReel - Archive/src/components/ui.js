import { html } from "../lib/html.js";

export function Container({ className = "", children = "" } = {}) {
  return html`<div class="container ${className}">${children}</div>`;
}

export function Grid({ className = "", children = "" } = {}) {
  return html`<div class="grid ${className}">${children}</div>`;
}

export function Col({ span = 12, md, sm, className = "", children = "" } = {}) {
  const cls = [
    `col-${span}`,
    md ? `col-md-${md}` : "",
    sm ? `col-sm-${sm}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return html`<div class="${cls}">${children}</div>`;
}

export function SectionLabel({ text = "" } = {}) {
  return html`<p class="section-label">${text}</p>`;
}

export function ProjectList({ projects = [], limit } = {}) {
  const list = typeof limit === "number" ? projects.slice(0, limit) : projects;

  return html`<div class="site-works" data-reveal-stagger>
    ${list.map((p, i) => {
      const preview = p.cover
        ? ` data-journal-preview-link data-preview-image="${p.cover}"`
        : "";
      return html`<a href="/work/${p.slug}" data-nav${preview}>
        <b>${p.title}</b>
        <span>(${String(i + 1).padStart(2, "0")})</span>
        <time>© ${p.year || "2026"}</time>
      </a>`;
    })}
  </div>`;
}

export function PhaseCards({ items = [], className = "site-phases", itemClass = "" } = {}) {
  return html`<div class="${className}">
    ${items.map(
      (item) => html`<article class="${itemClass}">
        <span>${item.num}</span>
        <h4>${item.title}</h4>
        <p>${item.body}</p>
      </article>`
    )}
  </div>`;
}
