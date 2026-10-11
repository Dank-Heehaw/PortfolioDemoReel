import { Col, Container, Grid } from "@/components/ui/Container";

export function NotFoundView() {
  return (
    <div className="site-page site-page--not-found">
      <Container>
        <Grid>
          <Col span={8} md={12}>
            <header className="site-page__head" data-reveal>
              <p className="section-label">Error 404</p>
              <h1>Page not found</h1>
              <p className="site-page__lede">
                That route doesn’t exist — it may have moved, or the link is outdated.
              </p>
            </header>
            <p className="site-not-found__actions" data-reveal>
              <a href="/" data-nav>
                ← Back home
              </a>
              <a href="/journal" data-nav>
                Journal
              </a>
              <a href="/work" data-nav>
                Work
              </a>
            </p>
          </Col>
        </Grid>
      </Container>
    </div>
  );
}
