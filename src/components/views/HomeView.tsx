import { Container, RevealLine } from "@/components/ui/Container";

export function HomeView() {
  return (
    <div className="site-home" data-fullpage>
      <section className="site-panel site-panel--hero" data-panel="intro">
        <Container>
          <div className="site-hero grid">
            <p className="col-6 col-sm-12">
              <RevealLine>Based in Toronto, Ontario</RevealLine>
            </p>
            <p className="col-6 col-sm-12 is-end">
              <RevealLine>Available worldwide</RevealLine>
            </p>
            <h1 className="site-hero__role col-8 col-md-12">
              <RevealLine>Interactive</RevealLine>
              <RevealLine>media designer</RevealLine>
            </h1>
            <p className="col-6 col-sm-12">
              <RevealLine>01 // Approach</RevealLine>
            </p>
            <p className="col-6 col-sm-12 is-end">
              <RevealLine>
                <a href="/contact" data-nav>
                  Contact
                </a>
              </RevealLine>
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
