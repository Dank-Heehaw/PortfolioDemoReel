import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/contact";

export function ContactView() {
  const email = CONTACT_EMAIL;

  return (
    <div className="site-page site-page--contact">
      <div className="contact-bg" data-contact-bg aria-hidden="true">
        <div className="contact-bg__wash" />
        <div className="contact-bg__orb contact-bg__orb--a" />
        <div className="contact-bg__orb contact-bg__orb--b" />
        <div className="contact-bg__orb contact-bg__orb--c" />
        <div className="contact-bg__grain" />
      </div>

      <div className="contact-stage" data-contact-tilt>
        <p className="contact-stage__eyebrow" data-contact-reveal>
          Open for collaborations · Toronto & remote
        </p>

        <h1 className="contact-stage__display" aria-label="Let's collaborate" data-contact-reveal>
          <span className="contact-stage__word">Let&apos;s</span>
          <span
            className="contact-stage__glyph contact-stage__glyph--flower"
            data-contact-drag
            role="img"
            aria-label="Decorative mark"
            tabIndex={0}
          >
            ✻
          </span>
          <span className="contact-stage__word">Collaborate</span>
        </h1>

        <p className="contact-stage__lede" data-contact-reveal>
          Brand, motion, and digital work for teams who care about craft. Tell me what you are
          building. I will reply within a day or two.
        </p>

        <div className="contact-stage__cta" data-contact-reveal>
          <a className="contact-stage__btn" href={`mailto:${email}?subject=Project%20inquiry`}>
            Email me
          </a>
        </div>

        <div className="contact-stage__details" data-contact-reveal>
          <a className="contact-stage__link" href={`mailto:${email}`}>
            {email}
          </a>
        </div>
      </div>

      <footer className="contact-bar" data-contact-reveal>
        <div className="contact-bar__item">
          <p className="contact-bar__label">Based in</p>
          <p className="contact-bar__value">North York, ON</p>
        </div>
        <div className="contact-bar__item">
          <p className="contact-bar__label">Timezone</p>
          <p className="contact-bar__value">Toronto Time</p>
        </div>
        <div className="contact-bar__item contact-bar__item--social">
          <p className="contact-bar__label">Elsewhere</p>
          <nav className="contact-bar__links" aria-label="Social">
            {SOCIAL_LINKS.map((item) => (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer">
                {item.label === "Linkedin" ? "LinkedIn" : item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="contact-bar__item contact-bar__item--status">
          <p className="contact-bar__label">Status</p>
          <p className="contact-bar__value contact-bar__value--live">
            <span className="contact-bar__dot" aria-hidden="true" />
            Accepting new work
          </p>
        </div>
      </footer>
    </div>
  );
}
