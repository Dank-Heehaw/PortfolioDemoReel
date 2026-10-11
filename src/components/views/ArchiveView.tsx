import { archiveCategories, type ArchivePost } from "@/lib/archive";

function ArchiveCard({ item }: { item: ArchivePost }) {
  const medium = item.medium || item.category || "Study";

  return (
    <button
      type="button"
      className="archive-masonry__card"
      data-archive-card
      data-title={item.title}
      data-medium={medium}
      data-category={item.category || ""}
      data-year={item.year || ""}
      data-slug={item.slug}
      data-src={item.cover}
      aria-label={`${item.title}, ${medium}`}
    >
      <span className="archive-masonry__media">
        <img
          src={item.cover}
          alt=""
          loading="lazy"
          decoding="async"
          width={640}
          height={800}
          draggable={false}
        />
      </span>
      <span className="archive-masonry__caption">
        <span className="archive-card__name">{item.title}</span>
        <span className="archive-card__meta">{medium}</span>
      </span>
    </button>
  );
}

/** Archive stays one URL. The viewer is an in-page lightbox, not /archive/slug. */
export function ArchiveView({ items }: { items: ArchivePost[] }) {
  const total = String(items.length).padStart(2, "0");

  return (
    <div className="site-page site-page--past">
      <div className="archive-shell">
        <aside className="archive-side" data-archive-reveal>
          <h1 className="archive-side__title">Archive</h1>
          <p className="archive-side__lede">
            Experiments and unfinished threads — the work behind the featured projects.
          </p>
          <div className="archive-side__lower">
            <div
              className="archive-mode"
              role="tablist"
              aria-label="Archive view mode"
              data-archive-mode-switch
            >
              <span className="archive-mode__pill" data-archive-mode-pill aria-hidden="true" />
              <button
                type="button"
                className="archive-mode__btn is-active"
                data-archive-mode="grid"
                aria-pressed="true"
                role="tab"
              >
                Grid
              </button>
              <button
                type="button"
                className="archive-mode__btn"
                data-archive-mode="field"
                aria-pressed="false"
                role="tab"
              >
                Fill
              </button>
            </div>
            <nav className="archive-cats" aria-label="Filter by category">
              <button
                type="button"
                className="archive-cats__btn is-active"
                data-archive-filter="all"
                aria-pressed="true"
              >
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
            <p className="archive-side__copy">©{new Date().getFullYear()}</p>
          </div>
        </aside>

        <div className="archive-main">
          <div className="archive-gallery-stack" data-archive-reveal>
            <div className="archive-masonry is-active" data-archive-masonry>
              {items.map((item) => (
                <ArchiveCard key={item.slug} item={item} />
              ))}
            </div>
            <div className="archive-field" data-archive-field hidden>
              <canvas
                className="archive-field__canvas"
                data-archive-field-canvas
                aria-label="Archive field view"
              />
              <p className="archive-field__hint">Drag to pan X · Wheel to move depth Z</p>
            </div>
          </div>
        </div>
      </div>

      <div className="archive-viewer" data-archive-viewer hidden>
        <button
          type="button"
          className="archive-viewer__backdrop"
          data-viewer-close
          aria-label="Close image view"
        />
        <figure className="archive-viewer__figure">
          <img className="archive-viewer__photo" data-viewer-photo alt="" decoding="async" />
        </figure>
        <button type="button" className="archive-viewer__close" data-viewer-close aria-label="Close image view">
          Close
        </button>
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
          <p className="archive-viewer__pager">
            <span data-viewer-index>01</span>
            <span aria-hidden="true"> — </span>
            <span data-viewer-count>{total}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
