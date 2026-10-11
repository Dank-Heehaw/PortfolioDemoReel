import { Col, Container, Grid } from "@/components/ui/Container";

export function AboutView() {
  return (
    <div className="site-page">
      <Container>
        <Grid>
          <Col span={8} md={12}>
            <header className="site-page__head" data-reveal>
              <p className="section-label">About</p>
              <h1>Waheed Khan</h1>
              <p className="site-page__lede">Interactive media designer based in Ontario.</p>
            </header>
            <div className="site-about" data-reveal>
              <p>
                I&apos;m building Grave Yard Shift — a multidisciplinary practice turning ideas into
                thoughtful visuals and meaningful digital experiences.
              </p>
              <p>
                3+ years across brand, digital, e-commerce, print production, and marketing
                creative. Tools: Photoshop, Illustrator, InDesign, After Effects, Premiere, Figma.
              </p>
            </div>
          </Col>
        </Grid>
      </Container>
    </div>
  );
}
