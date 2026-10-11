import { CONTACT_EMAIL } from "@/lib/contact";

function PunchWord({ text }: { text: string }) {
  return (
    <span className="about-word" aria-hidden="true">
      {Array.from(text).map((char, index) =>
        char.toUpperCase() === "O" ? (
          <span className="about-word__o" key={`${char}-${index}`} />
        ) : (
          <span key={`${char}-${index}`}>{char}</span>
        )
      )}
    </span>
  );
}

export function AboutView() {
  return (
    <div className="site-page site-page--about">
      <header className="about-mast">
        <h1 className="about-sr">Grave Yard Shift</h1>
        <p className="about-band about-band--paper" data-reveal>
          <PunchWord text="GRAVE" />
        </p>
        <p className="about-band about-band--blue" data-reveal>
          <PunchWord text="YARD" />
        </p>
        <p className="about-band about-band--green" data-reveal>
          <span className="about-band__note">North York, Ontario</span>
          <PunchWord text="SHIFT" />
        </p>
      </header>

      <section className="about-copy" data-reveal>
        <p className="about-label">Studio</p>
        <p className="about-copy__lead">Visual work for brands that need a clearer voice.</p>
        <div className="about-copy__grid">
          <p>
            I&apos;m building Grave Yard Shift — a multidisciplinary practice turning ideas into
            thoughtful visuals and meaningful digital experiences.
          </p>
          <p>
            3+ years across brand, digital, e-commerce, print production, and marketing creative.
            Tools: Photoshop, Illustrator, InDesign, After Effects, Premiere, Figma.
          </p>
        </div>
      </section>

      <section className="about-selected">
        <p className="about-label">Selected</p>
        <p className="about-selected__line">Brand, product, and campaign work.</p>
        <div className="about-selected__stack" data-reveal>
          <a className="about-selected__link" href="/work/hypedocs" data-nav>
            <span className="about-sr">HypeDocs</span>
            <PunchWord text="HYPE" />
            <PunchWord text="DOCS" />
          </a>
          <a className="about-selected__link" href="/work/ford" data-nav>
            <span className="about-sr">Ford Bronco</span>
            <PunchWord text="FORD" />
          </a>
          <a className="about-selected__link" href="/work/icons" data-nav>
            <span className="about-sr">Fin-Tastic Sharks</span>
            <PunchWord text="MOTION" />
          </a>
        </div>
        <a className="about-chip" href="/work" data-nav>
          View the work
        </a>
      </section>

      <section className="about-practice">
        <div className="about-practice__copy" data-reveal>
          <p className="about-label">Practice</p>
          <p className="about-practice__lead">
            Brand, digital, and motion. Built to stay clear once the launch is over.
          </p>
          <a className="about-chip" href="/work" data-nav>
            View all work
          </a>
        </div>
        <div className="about-practice__board" data-reveal>
          <a className="about-poster" href="/work/nature-cycle" data-nav aria-label="NaturCycle">
            <img src="/projects/nature-cycle/cover.jpg" alt="NaturCycle" />
          </a>
          <ul className="about-bars">
            <li className="about-bars__item about-bars__item--brand">Brand</li>
            <li className="about-bars__item about-bars__item--digital">Digital</li>
            <li className="about-bars__item about-bars__item--motion">Motion</li>
          </ul>
        </div>
      </section>

      <section className="about-close" data-reveal>
        <h2 className="about-sr">Let&apos;s work together</h2>
        <PunchWord text="LET'S" />
        <PunchWord text="WORK" />
        <PunchWord text="TOGETHER" />
        <div className="about-close__meta">
          <p>
            Based in Ontario.
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <a className="about-chip about-chip--light" href="/contact" data-nav>
            Contact
          </a>
        </div>
      </section>
    </div>
  );
}
