import { html } from "../lib/html.js";

export function Loader() {
  return html`<div class="loader" aria-live="polite" aria-busy="true">
    <div class="loader__grid" aria-hidden="true"></div>
    <div class="loader__panel">
      <div class="loader__shell">
        <div class="loader__meta-band">
          <span class="loader__coord loader__reveal">43.6532° N</span>
          <span class="loader__coord loader__reveal">079.3832° W</span>
          <span class="loader__meta loader__reveal">Portfolio Demo Reel</span>
        </div>
        <div class="loader__stage">
          <div class="loader__copy">
            <p class="loader__caption">
              <span class="loader__caption-line reveal-line">
                <span class="reveal-line__inner">Loading</span>
              </span>
              <span class="loader__caption-line loader__type-line">
                <span class="loader__type" data-loader-type></span><span class="loader__cursor" aria-hidden="true">|</span>
              </span>
            </p>
            <p class="loader__status loader__reveal">System ready pending</p>
          </div>
          <p class="loader__percent" aria-label="Loading progress">
            <span class="loader__percent-line reveal-line">
              <span class="loader__percent-value reveal-line__inner" data-loader-count>0</span>
            </span>
            <span class="loader__percent-suffix loader__reveal">%</span>
          </p>
        </div>
      </div>
      <div class="loader__track" aria-hidden="true">
        <div class="loader__bar"></div>
      </div>
    </div>
    <div class="loader__curtain" aria-hidden="true"></div>
  </div>`;
}
