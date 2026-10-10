import { html } from "../lib/html.js";
import { NAV_LINKS } from "../lib/routes.js";
import { CONTACT_EMAIL } from "../lib/contact.js";
import { Container, Grid } from "./ui.js";

const SOCIAL = [
  { label: "Behance", href: "https://www.behance.net/Dank_Heehaw" },
  { label: "Linkedin", href: "https://www.linkedin.com/in/sawaheedkhan/" },
  { label: "Instagram", href: "https://www.instagram.com/graveyardshiftdesigns/" },
];

export function SiteFooter() {
  return html`<footer class="site-foot" data-site-footer>
    ${Container({
      children: Grid({
        children: html`
          <div class="site-foot__contact col-12">
            <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>
          </div>
          <div class="col-4 col-sm-12">
            <p class="site-foot__label">/My Studio</p>
            <p>North York<br />M3J 0E3 — Canada</p>
          </div>
          <div class="col-4 col-sm-12">
            <p class="site-foot__label">/Social</p>
            <nav class="site-foot__links">
              ${SOCIAL.map(
                (item) =>
                  html`<a href="${item.href}" target="_blank" rel="noreferrer">${item.label}</a>`
              )}
            </nav>
          </div>
          <div class="col-4 col-sm-12">
            <p class="site-foot__label">/Nav</p>
            <nav class="site-foot__links">
              ${NAV_LINKS.map((link) => html`<a href="${link.path}" data-nav>${link.label}</a>`)}
            </nav>
          </div>
          <p class="site-foot__copy col-12">© 2026 Abdul Waheed Khan Sowdagar. All rights reserved.</p>
        `,
      }),
    })}
  </footer>`;
}
