import { archiveCategories, type ArchivePost } from "@/lib/archive";

function ArchivePiece({ item }: { item: ArchivePost }) {
  const medium = item.medium || item.category || "Study";

  return (
    <button
      type="button"
      className="archive-piece"
      data-archive-card
      data-title={item.title}
      data-medium={medium}
      data-category={item.category || ""}
      data-year={item.year || ""}
      data-slug={item.slug}
      data-src={item.cover}
      aria-label={`${item.title}, ${medium}`}
    >
      <span className="archive-piece__media">
        <img src={item.cover} alt="" decoding="async" draggable={false} />
      </span>
      <span className="archive-piece__copy">
        <span className="archive-piece__title">{item.title}</span>
        <span className="archive-piece__meta">{medium}</span>
      </span>
    </button>
  );
}

/** Archive stays one URL. The viewer is an in-page lightbox, not /archive/slug. */
export function ArchiveView({ items }: { items: ArchivePost[] }) {
  return (
    <div className="site-page site-page--past">
      <section className="archive-board" data-archive-reveal>
        <aside className="archive-board__side">
          <h1 className="archive-board__title">Archive</h1>
          <nav className="archive-cats" aria-label="Filter by category">
            <button type="button" className="archive-cats__btn is-active" data-archive-filter="all" aria-pressed="true">
              <span className="archive-cats__dot" aria-hidden="true" />
              All
            </button>
            {archiveCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                className="archive-cats__btn"
                data-archive-filter={cat}
                aria-pressed="false"
              >
                <span className="archive-cats__dot" aria-hidden="true" />
                {cat}
              </button>
            ))}
          </nav>
        </aside>

        <div className="archive-mosaic" data-archive-mosaic>
          {items.map((item) => (
            <ArchivePiece key={item.slug} item={item} />
          ))}
          <p className="archive-mosaic__empty" data-archive-empty hidden>
            Nothing in this category yet.
          </p>
        </div>
      </section>

      <div className="archive-viewer" data-archive-viewer hidden>
        <button type="button" className="archive-viewer__backdrop" data-viewer-close aria-label="Close image view" />
        <div className="archive-viewer__rail" data-viewer-rail>
          {items.map((item) => (
            <figure
              key={item.slug}
              className="archive-viewer__slide"
              data-viewer-slide
              data-slug={item.slug}
              data-category={item.category || ""}
              data-title={item.title}
              data-medium={item.medium || item.category || "Study"}
            >
              <img src={item.cover} alt={item.title} decoding="async" draggable={false} />
            </figure>
          ))}
        </div>
        <button
          type="button"
          className="archive-viewer__nav archive-viewer__nav--prev"
          data-archive-prev
          aria-label="Previous image"
        >
          ← Prev
        </button>
        <button
          type="button"
          className="archive-viewer__nav archive-viewer__nav--next"
          data-archive-next
          aria-label="Next image"
        >
          Next →
        </button>
        <div className="archive-viewer__copy">
          <p className="archive-viewer__title" data-viewer-title />
          <p className="archive-viewer__meta" data-viewer-meta />
        </div>
      </div>
    </div>
  );
}
