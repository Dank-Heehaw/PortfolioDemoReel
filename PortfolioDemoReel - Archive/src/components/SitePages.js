import { html } from "../lib/html.js";
import { Col, Container, ProjectList, SectionLabel } from "./ui.js";
import { journalPostPath, getJournalPosts, getJournalPost } from "../data/journal.js";
import { archiveCategories, getArchivePosts } from "../data/archive.js";
import { getProject, projectPath, getProjects } from "../data/projects.js";
import { CONTACT_EMAIL } from "../lib/contact.js";

/** Work page — project index (featured drill-down lives in the nav menu only). */
export function SiteWork({ projects = [] } = {}) {
  return html`<div class="site-page site-page--work">
    ${Container({
      children: html`
        <div class="grid">
          ${Col({
            span: 12,
            children: html`
              <header class="site-page__head" data-reveal>
                ${SectionLabel({ text: "© Featured Projects プロジェクト · (WDX® — 02)" })}
                <h2 class="work-list__title">All projects</h2>
              </header>
              ${ProjectList({ projects })}
            `,
          })}
        </div>
      `,
    })}
  </div>`;
}

function ProjectGallery(gallery = []) {
  if (!gallery.length) return "";

  const chunks = [];
  for (let i = 0; i < gallery.length; ) {
    const item = gallery[i];
    const next = gallery[i + 1];
    if (item.layout === "half" && next?.layout === "half") {
      chunks.push(
        html`<div class="project-gallery__pair" data-reveal>
          <figure class="project-gallery__figure">
            <img src="${item.src}" alt="${item.alt || ""}" loading="lazy" decoding="async" />
          </figure>
          <figure class="project-gallery__figure">
            <img src="${next.src}" alt="${next.alt || ""}" loading="lazy" decoding="async" />
          </figure>
        </div>`
      );
      i += 2;
      continue;
    }

    chunks.push(
      html`<figure class="project-gallery__figure project-gallery__figure--full" data-reveal>
        <img src="${item.src}" alt="${item.alt || ""}" loading="lazy" decoding="async" />
      </figure>`
    );
    i += 1;
  }

  return html`<div class="project-gallery">${chunks}</div>`;
}

function ProjectRelated({ project }) {
  const related = getProjects()
    .filter((item) => {
      if (item.slug === project.slug) return false;
      if (item.moreWork === false) return false;
      if (item.moreWork === true) return true;
      return item.hasCaseStudy;
    })
    .slice(0, 3);

  if (!related.length) return "";

  return html`<nav class="project-related" aria-label="More projects" data-reveal>
    <p class="project-related__label">More work</p>
    <ul class="project-related__list">
      ${related.map((item) => {
        const preview = item.cover
          ? ` data-journal-preview-link data-preview-image="${item.cover}"`
          : "";
        return html`<li>
          <a class="project-related__row" href="${projectPath(item)}" data-nav${preview}>
            <span class="project-related__tag">${item.category}</span>
            <span class="project-related__title">${item.title}</span>
            <span class="project-related__year">${item.year}</span>
          </a>
        </li>`;
      })}
    </ul>
  </nav>`;
}

/** Case-study page for /work/:slug — driven by content/projects YAML. */
export function SiteProject({ slug = "" } = {}) {
  const project = getProject(slug);
  if (!project) return SiteNotFound();

  const topics = formatTopicLine(project.tags);
  const bodyParagraphs = project.body
    ? project.body
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean)
    : [];

  return html`<div class="site-page site-page--project">
    ${Container({
      className: "container--project",
      children: html`
        <article class="project-case">
          <div class="project-case__toolbar" data-reveal>
            <a class="project-case__back" href="/work" data-nav>← Work</a>
            <p class="project-case__toolbar-meta">${project.year || ""} · ${project.role || project.category}</p>
          </div>

          <header class="project-case__hero" data-reveal>
            <div class="project-case__hero-copy">
              <p class="project-case__eyebrow">
                <a href="/work" data-nav>Work</a>
                <span aria-hidden="true"> / </span>
                ${project.category}
              </p>
              <h1 class="project-case__title">${project.title}</h1>
              ${project.summary
                ? html`<p class="project-case__summary">${project.summary}</p>`
                : ""}
              <dl class="project-case__meta">
                ${project.role
                  ? html`<div><dt>Role</dt><dd>${project.role}</dd></div>`
                  : ""}
                ${project.year
                  ? html`<div><dt>Year</dt><dd>${project.year}</dd></div>`
                  : ""}
                ${topics
                  ? html`<div><dt>Focus</dt><dd>${topics}</dd></div>`
                  : ""}
              </dl>
            </div>
            <figure class="project-case__hero-media">
              <img src="${project.hero || project.cover}" alt="${project.title}" width="1600" height="1000" />
            </figure>
          </header>

          ${bodyParagraphs.length
            ? html`<div class="project-case__body" data-reveal>
                ${bodyParagraphs.map((paragraph) => html`<p>${paragraph}</p>`)}
              </div>`
            : ""}

          ${project.devices?.length
            ? html`<section class="project-devices" data-reveal>
                <h2 class="project-section__title">Across devices</h2>
                <div class="project-devices__grid">
                  ${project.devices.map(
                    (device) => html`<figure class="project-devices__item">
                      <img src="${device.src}" alt="${device.label || project.title}" loading="lazy" decoding="async" />
                      ${device.label
                        ? html`<figcaption>${device.label}</figcaption>`
                        : ""}
                    </figure>`
                  )}
                </div>
              </section>`
            : ""}

          ${project.video
            ? html`<section class="project-video" data-reveal>
                <h2 class="project-section__title">${project.video.label || "Walkthrough"}</h2>
                <div class="project-video__frame">
                  <video
                    controls
                    playsinline
                    preload="none"
                    poster="${project.video.poster || ""}"
                    src="${project.video.src}"
                  ></video>
                </div>
              </section>`
            : ""}

          ${ProjectGallery(project.gallery)}
          ${ProjectRelated({ project })}
        </article>
      `,
    })}
  </div>`;
}

export function SiteAbout() {
  return html`<div class="site-page">
    ${Container({
      children: html`
        <div class="grid">
          ${Col({
            span: 8,
            md: 12,
            children: html`
              <header class="site-page__head" data-reveal>
                <p class="section-label">About</p>
                <h1>Waheed Khan</h1>
                <p class="site-page__lede">Interactive media designer based in Ontario.</p>
              </header>
              <div class="site-about" data-reveal>
                <p>
                  I'm building Grave Yard Shift — a multidisciplinary practice turning ideas into
                  thoughtful visuals and meaningful digital experiences.
                </p>
                <p>
                  3+ years across brand, digital, e-commerce, print production, and marketing
                  creative. Tools: Photoshop, Illustrator, InDesign, After Effects, Premiere, Figma.
                </p>
              </div>
            `,
          })}
        </div>
      `,
    })}
  </div>`;
}

export function SiteArchive({ items } = {}) {
  const list = items?.length ? items : getArchivePosts();
  const total = String(list.length).padStart(2, "0");

  const cardMarkup = (item) => {
    const medium = item.medium || item.category || "Study";
    return html`<button
      type="button"
      class="archive-masonry__card"
      data-archive-card
      data-title="${item.title}"
      data-medium="${medium}"
      data-category="${item.category || ""}"
      data-year="${item.year || ""}"
      data-slug="${item.slug}"
      data-src="${item.cover}"
      aria-label="${item.title}, ${medium}"
    >
      <span class="archive-masonry__media">
        <img src="${item.cover}" alt="" loading="lazy" decoding="async" width="640" height="800" draggable="false" />
      </span>
      <span class="archive-masonry__caption">
        <span class="archive-card__name">${item.title}</span>
        <span class="archive-card__meta">${medium}</span>
      </span>
    </button>`;
  };

  return html`<div class="site-page site-page--past">
    <div class="archive-shell">
      <aside class="archive-side" data-archive-reveal>
        <h1 class="archive-side__title">Archive</h1>
        <p class="archive-side__lede">
          Experiments and unfinished threads — the work behind the featured projects.
        </p>
        <div class="archive-side__lower">
          <!-- Sliding pill toggle: Grid = masonry scroll, Fill = canvas field (X/Z pan) -->
          <div class="archive-mode" role="tablist" aria-label="Archive view mode" data-archive-mode-switch>
            <span class="archive-mode__pill" data-archive-mode-pill aria-hidden="true"></span>
            <button type="button" class="archive-mode__btn is-active" data-archive-mode="grid" aria-pressed="true" role="tab">
              Grid
            </button>
            <button type="button" class="archive-mode__btn" data-archive-mode="field" aria-pressed="false" role="tab">
              Fill
            </button>
          </div>
          <nav class="archive-cats" aria-label="Filter by category">
            <button type="button" class="archive-cats__btn is-active" data-archive-filter="all" aria-pressed="true">
              <span class="archive-cats__dot" aria-hidden="true"></span>
              All
            </button>
            ${archiveCategories.map(
              (cat) =>
                html`<button type="button" class="archive-cats__btn" data-archive-filter="${cat}" aria-pressed="false">
                  <span class="archive-cats__dot" aria-hidden="true"></span>
                  ${cat}
                </button>`
            )}
          </nav>
          <p class="archive-side__copy">©${new Date().getFullYear()}</p>
        </div>
      </aside>

      <div class="archive-main">
        <div class="archive-gallery-stack" data-archive-reveal>
          <div class="archive-masonry is-active" data-archive-masonry>
            ${list.map((item) => cardMarkup(item))}
          </div>
          <div class="archive-field" data-archive-field hidden>
            <canvas class="archive-field__canvas" data-archive-field-canvas aria-label="Archive field view"></canvas>
            <p class="archive-field__hint">Drag to pan X · Wheel to move depth Z</p>
          </div>
        </div>
      </div>
    </div>

    <div class="archive-viewer" data-archive-viewer hidden>
      <button type="button" class="archive-viewer__backdrop" data-viewer-close aria-label="Close image view"></button>
      <figure class="archive-viewer__figure">
        <img class="archive-viewer__photo" data-viewer-photo alt="" decoding="async" />
      </figure>
      <button type="button" class="archive-viewer__close" data-viewer-close aria-label="Close image view">Close</button>
      <button type="button" class="archive-viewer__nav archive-viewer__nav--prev" data-archive-prev aria-label="Previous image">← Prev</button>
      <button type="button" class="archive-viewer__nav archive-viewer__nav--next" data-archive-next aria-label="Next image">Next →</button>
      <div class="archive-viewer__copy">
        <p class="archive-viewer__title" data-viewer-title></p>
        <p class="archive-viewer__meta" data-viewer-meta></p>
        <p class="archive-viewer__pager">
          <span data-viewer-index>01</span>
          <span aria-hidden="true"> — </span>
          <span data-viewer-count>${total}</span>
        </p>
      </div>
    </div>
  </div>`;
}

function formatTopicLine(tags = []) {
  if (!Array.isArray(tags) || !tags.length) return "";
  return tags.join(" · ");
}

function EditorialCard(post) {
  const href = journalPostPath(post);
  const external = Boolean(post.externalUrl);
  const linkAttrs = external
    ? `href="${href}" target="_blank" rel="noopener noreferrer" aria-describedby="ext-${post.slug}"`
    : `href="${href}" data-nav`;
  const timeAttrs = post.dateISO ? ` datetime="${post.dateISO}"` : "";
  const externalClass = external ? " archive-card--external" : "";
  const topics = formatTopicLine(post.tags);

  return html`<article class="archive-card${externalClass}" data-reveal>
    <a class="archive-card__link" ${linkAttrs}>
      ${external
        ? html`<span class="archive-card__external-tip" id="ext-${post.slug}" role="tooltip">External site</span>`
        : ""}
      <h2 class="archive-card__title">${post.title}</h2>
      <div class="archive-card__meta">
        <div class="archive-card__meta-start">
          <span class="archive-card__tag">${post.category}</span>
          ${topics ? html`<p class="archive-card__topics">${topics}</p>` : ""}
        </div>
        <time class="archive-card__date"${timeAttrs}>${post.dateLabel}</time>
      </div>
      <div class="archive-card__media">
        <img src="${post.cover}" alt="" loading="lazy" width="1200" height="750" />
      </div>
    </a>
  </article>`;
}

export function SiteJournal() {
  return html`<div class="site-page site-page--archive">
    ${Container({
      children: html`
        <section class="archive-section" data-reveal>
          <header class="archive-section__head">
            <h1 class="archive-section__title">Journal</h1>
          </header>
          <div class="archive-grid">
            ${getJournalPosts().map((post) => EditorialCard(post))}
          </div>
        </section>
      `,
    })}
  </div>`;
}

function renderGallery(gallery = []) {
  if (!gallery.length) return "";

  const chunks = [];
  for (let i = 0; i < gallery.length; ) {
    const item = gallery[i];
    const next = gallery[i + 1];
    if (item.layout === "half" && next?.layout === "half") {
      chunks.push(
        html`<div class="archive-gallery__pair" data-reveal>
          <figure class="archive-gallery__figure">
            <img src="${item.src}" alt="${item.alt || ""}" loading="lazy" />
          </figure>
          <figure class="archive-gallery__figure">
            <img src="${next.src}" alt="${next.alt || ""}" loading="lazy" />
          </figure>
        </div>`
      );
      i += 2;
      continue;
    }

    chunks.push(
      html`<figure class="archive-gallery__figure archive-gallery__figure--full" data-reveal>
        <img src="${item.src}" alt="${item.alt || ""}" loading="lazy" />
      </figure>`
    );
    i += 1;
  }

  return html`<div class="archive-gallery">${chunks}</div>`;
}

function splitArticleTitle(title = "") {
  const q = String(title).indexOf("?");
  if (q === -1) return { lead: title, rest: "" };
  return {
    lead: title.slice(0, q + 1).trim(),
    rest: title.slice(q + 1).trim(),
  };
}

/** Editorial headline: nbsp before final word to avoid widows; browser wraps naturally. */
function formatArticleHeadline(headline = "") {
  const text = String(headline).trim();
  if (!text) return "";
  return text.replace(/\s+(\S+\??)$/u, "\u00a0$1");
}

/** Replace spaces with non-breaking spaces (survives innerHTML; visible as &nbsp; in DOM). */
function glueWords(text = "") {
  return String(text).replace(/ /g, "\u00a0");
}

/**
 * Editorial dek: nbsp-glue payoff tails and articles so hero nowrap stays one line;
 * mobile still wraps naturally (nowrap is desktop-only in CSS).
 */
function formatDek(dek = "") {
  let text = String(dek).trim().replace(/\u00a0/g, " ");
  if (!text) return "";

  // Glue everything after the last comma (e.g. "and the glasses I wear.")
  text = text.replace(/,\s*([^,]+)$/, (_, tail) => `,\u00a0${glueWords(tail.trim())}`);

  // Glue articles to the following word everywhere else
  text = text.replace(/\b(the|a|an)\s+(\S+)/gi, "$1\u00a0$2");

  // Glue terminal word to avoid widows when wrapping on mobile
  text = text.replace(/\s+(\S+[.?!]?)$/u, "\u00a0$1");
  return text;
}

function ArticleRelatedLinks({ post }) {
  const related = getJournalPosts().filter((p) => p.slug !== post.slug).slice(0, 3);

  return html`<nav class="archive-article__links" aria-label="Continue reading" data-reveal>
    <p class="archive-article__links-label">Also in journal</p>
    <ul class="archive-article__links-list">
      ${related.map((item) => {
        const href = journalPostPath(item);
        const attrs = item.externalUrl
          ? `href="${href}" target="_blank" rel="noopener noreferrer"`
          : `href="${href}" data-nav`;
        const timeAttrs = item.dateISO ? ` datetime="${item.dateISO}"` : "";
        const dateText = item.dateLabel !== "—" ? item.dateLabel : "";
        return html`<li>
          <a ${attrs} class="archive-article__links-row" data-journal-preview-link data-preview-image="${item.cover}">
            <span class="archive-article__links-tag">${item.category}</span>
            <span class="archive-article__links-title">${item.title}</span>
            ${dateText ? html`<time class="archive-article__links-date"${timeAttrs}>${dateText}</time>` : ""}
          </a>
        </li>`;
      })}
    </ul>
  </nav>`;
}

export function SiteJournalPost({ slug = "" } = {}) {
  const post = getJournalPost(slug);
  if (!post || post.externalUrl) {
    return SiteNotFound();
  }

  const gallery = Array.isArray(post.gallery) ? post.gallery : [];
  const bodyHtml = post.html || "";
  const dateText = post.dateLabel !== "—" ? post.dateLabel : "Draft";
  const topics = formatTopicLine(post.tags);
  const { lead, rest } = splitArticleTitle(post.title);

  return html`<div class="site-page site-page--article">
    ${Container({
      className: "container--article",
      children: html`
        <article class="archive-article archive-article--editorial">
          <div class="archive-article__toolbar" data-reveal>
            <a class="archive-article__back-link" href="/journal" data-nav>← Journal</a>
            <time${post.dateISO ? ` datetime="${post.dateISO}"` : ""}>${dateText}</time>
          </div>

          <header class="archive-article__hero" data-reveal>
            <figure class="archive-article__hero-media">
              <img src="${post.cover}" alt="" width="1600" height="1000" />
            </figure>
            <div class="archive-article__hero-copy">
              <div class="archive-article__hero-meta">
                <p class="archive-article__eyebrow">
                  <a href="/journal" data-nav>Journal</a>
                  <span aria-hidden="true"> / </span>
                  ${post.category}
                </p>
                ${topics
                  ? html`<p class="archive-article__topics">${topics}</p>`
                  : ""}
              </div>
              <div class="archive-article__hero-headline">
                <h1 class="archive-article__title">${formatArticleHeadline(lead)}</h1>
                ${rest
                  ? html`<span class="archive-article__title-rule" aria-hidden="true"></span>
                      <p class="archive-article__title-rest">${rest}</p>`
                  : ""}
                ${post.summary
                  ? html`<p class="archive-article__dek">
                      <span class="archive-article__asterisk" aria-hidden="true">*</span>
                      ${formatDek(post.summary)}
                    </p>`
                  : ""}
              </div>
            </div>
          </header>

          ${bodyHtml
            ? html`<div class="archive-article__body archive-article__body--md">${bodyHtml}</div>`
            : ""}
          ${renderGallery(gallery)}
          ${ArticleRelatedLinks({ post })}
        </article>
      `,
    })}
  </div>`;
}

export function SiteContact() {
  const email = CONTACT_EMAIL;
  return html`<div class="site-page site-page--contact">
    <div class="contact-bg" data-contact-bg aria-hidden="true">
      <div class="contact-bg__wash"></div>
      <div class="contact-bg__orb contact-bg__orb--a"></div>
      <div class="contact-bg__orb contact-bg__orb--b"></div>
      <div class="contact-bg__orb contact-bg__orb--c"></div>
      <div class="contact-bg__grain"></div>
    </div>

    <div class="contact-stage" data-contact-tilt>
      <p class="contact-stage__eyebrow" data-contact-reveal>
        Open for collaborations · Toronto &amp; remote
      </p>

      <h1 class="contact-stage__display" aria-label="Let's collaborate" data-contact-reveal>
        <span class="contact-stage__word">Let's</span>
        <span
          class="contact-stage__glyph contact-stage__glyph--flower"
          data-contact-drag
          role="img"
          aria-label="Decorative mark"
          tabindex="0"
        >✻</span>
        <span class="contact-stage__word">Collaborate</span>
      </h1>

      <p class="contact-stage__lede" data-contact-reveal>
        Brand, motion, and digital work for teams who care about craft.
        Tell me what you are building. I will reply within a day or two.
      </p>

      <div class="contact-stage__cta" data-contact-reveal>
        <a class="contact-stage__btn" href="mailto:${email}?subject=Project%20inquiry">
          Email me
        </a>
      </div>

      <div class="contact-stage__details" data-contact-reveal>
        <a class="contact-stage__link" href="mailto:${email}">${email}</a>
      </div>
    </div>

    <footer class="contact-bar" data-contact-reveal>
      <div class="contact-bar__item">
        <p class="contact-bar__label">Based in</p>
        <p class="contact-bar__value">North York, ON</p>
      </div>
      <div class="contact-bar__item">
        <p class="contact-bar__label">Timezone</p>
        <p class="contact-bar__value">Toronto Time</p>
      </div>
      <div class="contact-bar__item contact-bar__item--social">
        <p class="contact-bar__label">Elsewhere</p>
        <nav class="contact-bar__links" aria-label="Social">
          <a href="https://www.behance.net/Dank_Heehaw" target="_blank" rel="noreferrer">Behance</a>
          <a href="https://www.linkedin.com/in/sawaheedkhan/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://www.instagram.com/graveyardshiftdesigns/" target="_blank" rel="noreferrer">Instagram</a>
        </nav>
      </div>
      <div class="contact-bar__item contact-bar__item--status">
        <p class="contact-bar__label">Status</p>
        <p class="contact-bar__value contact-bar__value--live">
          <span class="contact-bar__dot" aria-hidden="true"></span>
          Accepting new work
        </p>
      </div>
    </footer>
  </div>`;
}

export function SiteNotFound() {
  return html`<div class="site-page site-page--not-found">
    ${Container({
      children: html`
        <div class="grid">
          ${Col({
            span: 8,
            md: 12,
            children: html`
              <header class="site-page__head" data-reveal>
                <p class="section-label">Error 404</p>
                <h1>Page not found</h1>
                <p class="site-page__lede">
                  That route doesn’t exist — it may have moved, or the link is outdated.
                </p>
              </header>
              <p class="site-not-found__actions" data-reveal>
                <a href="/" data-nav>← Back home</a>
                <a href="/journal" data-nav>Journal</a>
                <a href="/work" data-nav>Work</a>
              </p>
            `,
          })}
        </div>
      `,
    })}
  </div>`;
}
