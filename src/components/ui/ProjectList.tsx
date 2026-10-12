"use client";

import { type CSSProperties, useState } from "react";
import type { Project } from "@/lib/projects";

/** Work index rows with client-side project-type filters. */
export function ProjectList({
  projects,
  limit,
}: {
  projects: Project[];
  limit?: number;
}) {
  const [activeType, setActiveType] = useState("all");
  const sortedProjects = [...projects].sort(
    (a, b) =>
      Number(b.year) - Number(a.year) ||
      b.year.localeCompare(a.year, undefined, { numeric: true })
  );
  const types = [...new Set(sortedProjects.map((project) => project.category).filter(Boolean))];
  const availableProjects =
    typeof limit === "number" ? sortedProjects.slice(0, limit) : sortedProjects;
  const list =
    activeType === "all"
      ? availableProjects
      : availableProjects.filter((project) => project.category === activeType);

  return (
    <div className="project-index">
      <nav className="project-index__filters" aria-label="Filter projects by type">
        <span className="project-index__filter-label">Type</span>
        <div className="project-index__pills">
          {["all", ...types].map((type) => (
            <button
              key={type}
              type="button"
              className={`project-index__pill${activeType === type ? " is-active" : ""}`}
              aria-pressed={activeType === type}
              onClick={() => setActiveType(type)}
            >
              {type === "all" ? "All" : type}
            </button>
          ))}
        </div>
      </nav>
      <div className="site-works" data-reveal-stagger aria-live="polite">
        {list.map((project, index) => (
          <a
            key={`${activeType}-${project.slug}`}
            href={`/work/${project.slug}`}
            className="site-works__row"
            data-nav
            style={
              { "--row-delay": `${Math.min(index * 45, 240)}ms` } as CSSProperties
            }
            {...(project.cover
              ? {
                  "data-journal-preview-link": true,
                  "data-preview-image": project.cover,
                }
              : {})}
          >
            <b className="site-works__title">{project.title}</b>
            <span className="site-works__number">
              ({String(index + 1).padStart(2, "0")})
            </span>
            <span className="site-works__category">{project.category}</span>
            <time>{project.year}</time>
          </a>
        ))}
      </div>
    </div>
  );
}
