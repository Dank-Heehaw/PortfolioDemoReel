import { Container } from "@/components/ui/Container";
import { getJournalPosts, journalPostPath, type JournalPost } from "@/lib/journal";

function formatTopicLine(tags: string[] = []) {
  if (!tags.length) return "";
  return tags.join(" · ");
}

function splitArticleTitle(title = "") {
  const q = String(title).indexOf("?");
  if (q === -1) return { lead: title, rest: "" };
  return {
    lead: title.slice(0, q + 1).trim(),
    rest: title.slice(q + 1).trim(),
  };
}

function formatArticleHeadline(headline = "") {
  const text = String(headline).trim();
  if (!text) return "";
  return text.replace(/\s+(\S+\??)$/u, "\u00a0$1");
}

function glueWords(text = "") {
  return String(text).replace(/ /g, "\u00a0");
}

function formatDek(dek = "") {
  let text = String(dek).trim().replace(/\u00a0/g, " ");
  if (!text) return "";
  text = text.replace(/,\s*([^,]+)$/, (_, tail) => `,\u00a0${glueWords(tail.trim())}`);
  text = text.replace(/\b(the|a|an)\s+(\S+)/gi, "$1\u00a0$2");
  text = text.replace(/\s+(\S+[.?!]?)$/u, "\u00a0$1");
  return text;
}

function renderGallery(gallery: JournalPost["gallery"] = []) {
  if (!gallery.length) return null;

  const chunks = [];
  for (let i = 0; i < gallery.length; ) {
    const item = gallery[i];
    const next = gallery[i + 1];
    if (item.layout === "half" && next?.layout === "half") {
      chunks.push(
        <div className="archive-gallery__pair" data-reveal key={`${item.src}-${next.src}`}>
          <figure className="archive-gallery__figure">
            <img src={item.src} alt={item.alt || ""} loading="lazy" />
          </figure>
          <figure className="archive-gallery__figure">
            <img src={next.src} alt={next.alt || ""} loading="lazy" />
          </figure>
        </div>
      );
      i += 2;
      continue;
    }

    chunks.push(
      <figure
        className="archive-gallery__figure archive-gallery__figure--full"
        data-reveal
        key={item.src}
      >
        <img src={item.src} alt={item.alt || ""} loading="lazy" />
      </figure>
    );
    i += 1;
  }

  return <div className="archive-gallery">{chunks}</div>;
}

async function ArticleRelatedLinks({ post }: { post: JournalPost }) {
  const related = (await getJournalPosts())
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  return (
    <nav className="archive-article__links" aria-label="Continue reading" data-reveal>
      <p className="archive-article__links-label">Also in journal</p>
      <ul className="archive-article__links-list">
        {related.map((item) => {
          const href = journalPostPath(item);
          const dateText = item.dateLabel !== "—" ? item.dateLabel : "";
          return (
            <li key={item.slug}>
              <a
                href={href}
                className="archive-article__links-row"
                data-journal-preview-link
                data-preview-image={item.cover}
                {...(item.externalUrl
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : { "data-nav": true })}
              >
                <span className="archive-article__links-tag">{item.category}</span>
                <span className="archive-article__links-title">{item.title}</span>
                {dateText ? (
                  <time
                    className="archive-article__links-date"
                    {...(item.dateISO ? { dateTime: item.dateISO } : {})}
                  >
                    {dateText}
                  </time>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export async function JournalPostView({ post }: { post: JournalPost }) {
  const gallery = Array.isArray(post.gallery) ? post.gallery : [];
  const dateText = post.dateLabel !== "—" ? post.dateLabel : "Draft";
  const topics = formatTopicLine(post.tags);
  const { lead, rest } = splitArticleTitle(post.title);

  return (
    <div className="site-page site-page--article">
      <Container className="container--article">
        <article className="archive-article archive-article--editorial">
          <div className="archive-article__toolbar" data-reveal>
            <a className="archive-article__back-link" href="/journal" data-nav>
              ← Journal
            </a>
            <time {...(post.dateISO ? { dateTime: post.dateISO } : {})}>{dateText}</time>
          </div>

          <header className="archive-article__hero" data-reveal>
            <figure className="archive-article__hero-media">
              <img src={post.cover} alt="" width={1600} height={1000} />
            </figure>
            <div className="archive-article__hero-copy">
              <div className="archive-article__hero-meta">
                <p className="archive-article__eyebrow">
                  <a href="/journal" data-nav>
                    Journal
                  </a>
                  <span aria-hidden="true"> / </span>
                  {post.category}
                </p>
                {topics ? <p className="archive-article__topics">{topics}</p> : null}
              </div>
              <div className="archive-article__hero-headline">
                <h1 className="archive-article__title">{formatArticleHeadline(lead)}</h1>
                {rest ? (
                  <>
                    <span className="archive-article__title-rule" aria-hidden="true" />
                    <p className="archive-article__title-rest">{rest}</p>
                  </>
                ) : null}
                {post.summary ? (
                  <p className="archive-article__dek">
                    <span className="archive-article__asterisk" aria-hidden="true">
                      *
                    </span>
                    {formatDek(post.summary)}
                  </p>
                ) : null}
              </div>
            </div>
          </header>

          {post.html ? (
            <div
              className="archive-article__body archive-article__body--md"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          ) : null}
          {renderGallery(gallery)}
          <ArticleRelatedLinks post={post} />
        </article>
      </Container>
    </div>
  );
}
