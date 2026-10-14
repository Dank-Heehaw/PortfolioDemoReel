import { Container } from "@/components/ui/Container";
import { journalPostPath, type JournalPost } from "@/lib/journal";

function formatTopicLine(tags: string[] = []) {
  if (!tags.length) return "";
  return tags.join(" · ");
}

function padIndex(index: number) {
  return String(index + 1).padStart(2, "0");
}

function JournalRow({ post, index }: { post: JournalPost; index: number }) {
  const href = journalPostPath(post);
  const external = Boolean(post.externalUrl);
  const topics = formatTopicLine(post.tags);

  return (
    <li className={`archive-card${external ? " archive-card--external" : ""}`}>
      <a
        className="archive-card__link"
        href={href}
        {...(external
          ? {
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-describedby": `ext-${post.slug}`,
            }
          : { "data-nav": true })}
      >
        {external ? (
          <span className="archive-card__external-tip" id={`ext-${post.slug}`} role="tooltip">
            External site
          </span>
        ) : null}
        <span className="archive-card__copy">
          <span className="archive-card__title-line">
            <span className="archive-card__index" aria-hidden="true">
              {padIndex(index)}
            </span>
            <h2 className="archive-card__title">{post.title}</h2>
          </span>
          <p className="archive-card__meta">
            <span className="archive-card__tag">{post.category}</span>
            {topics ? <span className="archive-card__topics">{topics}</span> : null}
            <time
              className="archive-card__date"
              {...(post.dateISO ? { dateTime: post.dateISO } : {})}
            >
              {post.dateLabel}
            </time>
          </p>
          {post.summary ? <p className="archive-card__summary">{post.summary}</p> : null}
        </span>
        {post.cover ? (
          <span className="archive-card__media">
            <img src={post.cover} alt="" loading="lazy" width={112} height={76} />
          </span>
        ) : (
          <span className="archive-card__media archive-card__media--empty" aria-hidden="true" />
        )}
      </a>
    </li>
  );
}

export function JournalView({ posts }: { posts: JournalPost[] }) {
  return (
    <div className="site-page site-page--archive">
      <Container>
        <section className="archive-section">
          <header className="archive-section__head" data-reveal>
            <h1 className="archive-section__title">Journal</h1>
          </header>
          <ol className="archive-grid" data-reveal-stagger>
            {posts.map((post, index) => (
              <JournalRow key={post.slug} post={post} index={index} />
            ))}
          </ol>
        </section>
      </Container>
    </div>
  );
}
