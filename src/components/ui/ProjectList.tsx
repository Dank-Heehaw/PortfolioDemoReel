import type { Project } from "@/lib/projects";

/** Work index rows — title, number, year. */
export function ProjectList({
  projects,
  limit,
}: {
  projects: Project[];
  limit?: number;
}) {
  const list = typeof limit === "number" ? projects.slice(0, limit) : projects;

  return (
    <div className="site-works" data-reveal-stagger>
      {list.map((project, index) => (
        <a
          key={project.slug}
          href={`/work/${project.slug}`}
          data-nav
          {...(project.cover
            ? {
                "data-journal-preview-link": true,
                "data-preview-image": project.cover,
              }
            : {})}
        >
          <b>{project.title}</b>
          <span>({String(index + 1).padStart(2, "0")})</span>
          <time>© {project.year || "2026"}</time>
        </a>
      ))}
    </div>
  );
}
