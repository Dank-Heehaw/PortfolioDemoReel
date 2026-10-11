import { html } from "../lib/html.js";
import { Container } from "./ui.js";

function RevealLine(text) {
  return html`<span class="reveal-line"><span class="reveal-line__inner">${text}</span></span>`;
}

export function SiteHome() {
  return html`<div class="site-home" data-fullpage>
    <section class="site-panel site-panel--hero" data-panel="intro">
      ${Container({
        children: html`<div class="site-hero grid">
          <p class="col-6 col-sm-12">${RevealLine("Based in Toronto, Ontario")}</p>
          <p class="col-6 col-sm-12 is-end">${RevealLine("Available worldwide")}</p>
          <h1 class="site-hero__role col-8 col-md-12">
            ${RevealLine("Interactive")}
            ${RevealLine("media designer")}
          </h1>
          <p class="col-6 col-sm-12">${RevealLine("01 // Approach")}</p>
          <p class="col-6 col-sm-12 is-end">${RevealLine(html`<a href="/contact" data-nav>Contact</a>`)}</p>
        </div>`,
      })}
    </section>
  </div>`;
}
