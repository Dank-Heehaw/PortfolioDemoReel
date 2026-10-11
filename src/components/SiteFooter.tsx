import { Container, Grid } from "@/components/ui/Container";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/contact";
import { NAV_LINKS } from "@/lib/routes";

/** Studio footer — hidden on home, contact, and archive by SiteChrome. */
export function SiteFooter() {
  return (
    <footer className="site-foot" data-site-footer>
      <Container>
        <Grid>
          <div className="site-foot__contact col-12">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </div>
          <div className="col-4 col-sm-12">
            <p className="site-foot__label">/My Studio</p>
            <p>
              North York
              <br />
              M3J 0E3 — Canada
            </p>
          </div>
          <div className="col-4 col-sm-12">
            <p className="site-foot__label">/Social</p>
            <nav className="site-foot__links">
              {SOCIAL_LINKS.map((item) => (
                <a key={item.href} href={item.href} target="_blank" rel="noreferrer">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="col-4 col-sm-12">
            <p className="site-foot__label">/Nav</p>
            <nav className="site-foot__links">
              {NAV_LINKS.map((link) => (
                <a key={link.path} href={link.path} data-nav>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <p className="site-foot__copy col-12">
            © 2026 Abdul Waheed Khan Sowdagar. All rights reserved.
          </p>
        </Grid>
      </Container>
    </footer>
  );
}
