/** First-load intro overlay. GSAP runIntro() hides it when the count hits 100. */
export function SiteLoader() {
  return (
    <div className="loader" aria-live="polite" aria-busy="true">
      <div className="loader__grid" aria-hidden="true" />
      <div className="loader__panel">
        <div className="loader__shell">
          <div className="loader__meta-band">
            <span className="loader__coord loader__reveal">43.6532° N</span>
            <span className="loader__coord loader__reveal">079.3832° W</span>
            <span className="loader__meta loader__reveal">Portfolio Demo Reel</span>
          </div>
          <div className="loader__stage">
            <div className="loader__copy">
              <p className="loader__caption">
                <span className="loader__caption-line reveal-line">
                  <span className="reveal-line__inner">Loading</span>
                </span>
                <span className="loader__caption-line loader__type-line">
                  <span className="loader__type" data-loader-type />
                  <span className="loader__cursor" aria-hidden="true">
                    |
                  </span>
                </span>
              </p>
              <p className="loader__status loader__reveal">System ready pending</p>
            </div>
            <p className="loader__percent" aria-label="Loading progress">
              <span className="loader__percent-line reveal-line">
                <span className="loader__percent-value reveal-line__inner" data-loader-count>
                  0
                </span>
              </span>
              <span className="loader__percent-suffix loader__reveal">%</span>
            </p>
          </div>
        </div>
        <div className="loader__track" aria-hidden="true">
          <div className="loader__bar" />
        </div>
      </div>
      <div className="loader__curtain" aria-hidden="true" />
    </div>
  );
}
