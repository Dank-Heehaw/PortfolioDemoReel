import { Container } from "@/components/ui/Container";
import { journalPostPath, type JournalPost } from "@/lib/journal";

function formatTopicLine(tags: string[] = []) {
  if (!tags.length) return "";
  return tags.join(" · ");
}

function EditorialCard({ post }: { post: JournalPost }) {
  const href = journalPostPath(post);
  const external = Boolean(post.externalUrl);
  const topics = formatTopicLine(post.tags);

  return (
    <article className={`archive-card${external ? " archive-card--external" : ""}`} data-reveal>
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
        <h2 className="archive-card__title">{post.title}</h2>
        <div className="archive-card__meta">
          <div className="archive-card__meta-start">
            <span className="archive-card__tag">{post.category}</span>
            {topics ? <p className="archive-card__topics">{topics}</p> : null}
          </div>
          <time className="archive-card__date" {...(post.dateISO ? { dateTime: post.dateISO } : {})}>
            {post.dateLabel}
          </time>
        </div>
        <div className="archive-card__media">
          <img src={post.cover} alt="" loading="lazy" width={1200} height={750} />
        </div>
      </a>
    </article>
  );
}

export function JournalView({ posts }: { posts: JournalPost[] }) {
  return (
    <div className="site-page site-page--archive">
      <Container>
        <section className="archive-section" data-reveal>
          <header className="archive-section__head">
            <h1 className="archive-section__title">Journal</h1>
          </header>
          <div className="archive-grid">
            {posts.map((post) => (
              <EditorialCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
