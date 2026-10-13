"use client";

import { type CSSProperties, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
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
  const filtersRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const hasPositionedIndicator = useRef(false);
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

  useLayoutEffect(() => {
    const filters = filtersRef.current;
    const indicator = indicatorRef.current;
    if (!filters || !indicator) return;

    const positionIndicator = (animate: boolean) => {
      const activeButton = filters.querySelector<HTMLButtonElement>(
        '[aria-pressed="true"]'
      );
      if (!activeButton) return;

      const nextPosition = {
        x: activeButton.offsetLeft,
        y: activeButton.offsetTop,
        width: activeButton.offsetWidth,
        height: activeButton.offsetHeight,
        autoAlpha: 1,
      };
      gsap.killTweensOf(indicator);

      if (
        !animate ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        gsap.set(indicator, nextPosition);
        return;
      }

      gsap.to(indicator, {
        ...nextPosition,
        duration: 0.48,
        ease: "power3.inOut",
        overwrite: "auto",
      });
    };
    const handleResize = () => positionIndicator(false);

    positionIndicator(hasPositionedIndicator.current);
    hasPositionedIndicator.current = true;

    const observer = new ResizeObserver(handleResize);
    observer.observe(filters);
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      gsap.killTweensOf(indicator);
    };
  }, [activeType]);

  return (
    <div className="project-index">
      <nav className="project-index__filters" aria-label="Filter projects by type">
        <span className="project-index__filter-label">Type</span>
        <div ref={filtersRef} className="project-index__pills">
          <span
            ref={indicatorRef}
            className="project-index__pill-indicator"
            aria-hidden="true"
          />
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
