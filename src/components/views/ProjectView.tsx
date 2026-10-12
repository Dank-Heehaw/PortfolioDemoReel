import { Container } from "@/components/ui/Container";
import { FigmaPrototype } from "@/components/ui/FigmaPrototype";
import { ProjectVideoPlayer } from "@/components/ui/ProjectVideoPlayer";
import { ProjectSoftware } from "@/components/ui/ProjectSoftware";
import { getProjects, projectPath, type Project } from "@/lib/projects";

function formatTopicLine(tags: string[] = []) {
  if (!tags.length) return "";
  return tags.join(" · ");
}

function ProjectGallery({ gallery }: { gallery: Project["gallery"] }) {
  if (!gallery.length) return null;

  const chunks = [];
  for (let i = 0; i < gallery.length; ) {
    const item = gallery[i];
    const next = gallery[i + 1];
    if (item.layout === "half" && next?.layout === "half") {
      chunks.push(
        <div className="project-gallery__pair" data-reveal key={`${item.src}-${next.src}`}>
          <figure className="project-gallery__figure">
            <img src={item.src} alt={item.alt || ""} loading="lazy" decoding="async" />
          </figure>
          <figure className="project-gallery__figure">
            <img src={next.src} alt={next.alt || ""} loading="lazy" decoding="async" />
          </figure>
        </div>
      );
      i += 2;
      continue;
    }

    chunks.push(
      <figure
        className="project-gallery__figure project-gallery__figure--full"
        data-reveal
        key={item.src}
      >
        <img src={item.src} alt={item.alt || ""} loading="lazy" decoding="async" />
      </figure>
    );
    i += 1;
  }

  return <div className="project-gallery">{chunks}</div>;
}

async function ProjectRelated({ project }: { project: Project }) {
  const projects = await getProjects();
  const nextProject = projects.find((item) => item.slug === project.nextProjectSlug);
  const related = nextProject
    ? [nextProject]
    : projects
    .filter((item) => {
      if (item.slug === project.slug) return false;
      if (item.moreWork === false) return false;
      if (item.moreWork === true) return true;
      return item.hasCaseStudy;
    })
    .slice(0, 3);

  if (!related.length) return null;

  return (
    <nav className="project-related" aria-label={nextProject ? "Next project" : "More projects"} data-reveal>
      <p className="project-related__label">{nextProject ? "Next project" : "More work"}</p>
      <ul className="project-related__list">
        {related.map((item) => (
          <li key={item.slug}>
            <a
              className="project-related__row"
              href={projectPath(item)}
              data-nav
              {...(item.cover
                ? {
                    "data-journal-preview-link": true,
                    "data-preview-image": item.cover,
                  }
                : {})}
            >
              <span className="project-related__tag">{item.category}</span>
              <span className="project-related__title">{item.title}</span>
              <span className="project-related__year">{item.year}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export async function ProjectView({ project }: { project: Project }) {
  const topics = formatTopicLine(project.tags);
  const bodyParagraphs = project.body
    ? project.body
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="site-page site-page--project">
      <Container className="container--project">
        <article className="project-case">
          <div className="project-case__toolbar" data-reveal>
            <a className="project-case__back" href="/work" data-nav>
              ← Work
            </a>
            <p className="project-case__toolbar-meta">
              {project.year || ""} · {project.role || project.category}
            </p>
          </div>

          <header className="project-case__hero" data-reveal>
            <div className="project-case__hero-copy">
              <p className="project-case__eyebrow">
                <a href="/work" data-nav>
                  Work
                </a>
                <span aria-hidden="true"> / </span>
                {project.category}
              </p>
              <h1 className="project-case__title">{project.title}</h1>
              {project.summary ? <p className="project-case__summary">{project.summary}</p> : null}
              <dl className="project-case__meta">
                {project.role ? (
                  <div>
                    <dt>Role</dt>
                    <dd>{project.role}</dd>
                  </div>
                ) : null}
                {project.year ? (
                  <div>
                    <dt>Year</dt>
                    <dd>{project.year}</dd>
                  </div>
                ) : null}
                {topics ? (
                  <div>
                    <dt>Focus</dt>
                    <dd>{topics}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <figure className="project-case__hero-media">
              <img
                src={project.hero || project.cover}
                alt={project.title}
                width={1600}
                height={1000}
              />
            </figure>
          </header>

          {bodyParagraphs.length ? (
            <div className="project-case__body" data-reveal>
              {bodyParagraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {project.designer || project.contribution ? (
            <dl className="project-case__credits" data-reveal>
              {project.designer ? (
                <div>
                  <dt>Designer</dt>
                  <dd>{project.designer}</dd>
                </div>
              ) : null}
              {project.contribution ? (
                <div>
                  <dt>Role</dt>
                  <dd>{project.contribution}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}

          <ProjectSoftware software={project.software} />

          {project.devices?.length ? (
            <section className="project-devices" data-reveal>
              <h2 className="project-section__title">Across devices</h2>
              <div className="project-devices__grid">
                {project.devices.map((device) => (
                  <figure className="project-devices__item" key={device.src}>
                    <img
                      src={device.src}
                      alt={device.label || project.title}
                      loading="lazy"
                      decoding="async"
                    />
                    {device.label ? <figcaption>{device.label}</figcaption> : null}
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          {project.video ? (
            <section className="project-video" data-reveal>
              <h2 className="project-section__title">{project.video.label || "Walkthrough"}</h2>
              <ProjectVideoPlayer
                src={project.video.src}
                poster={project.video.poster}
                label={project.video.label || project.title}
              />
            </section>
          ) : null}

          {project.shortVideo ? (
            <section className="project-video" data-reveal>
              <h2 className="project-section__title">
                {project.shortVideo.label || "Short film"}
              </h2>
              <ProjectVideoPlayer
                src={project.shortVideo.src}
                poster={project.shortVideo.poster}
                label={project.shortVideo.label || `${project.title} short film`}
                orientation="portrait"
              />
            </section>
          ) : null}

          {project.prototypeUrl ? (
            <FigmaPrototype src={project.prototypeUrl} title={project.title} />
          ) : null}

          <ProjectGallery gallery={project.gallery} />
          <ProjectRelated project={project} />
        </article>
      </Container>
    </div>
  );
}
