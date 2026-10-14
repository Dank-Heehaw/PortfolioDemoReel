import { Col, Container, Grid, SectionLabel } from "@/components/ui/Container";
import { ProjectList } from "@/components/ui/ProjectList";
import type { Project } from "@/lib/projects";

export function WorkView({
  projects,
  initialType,
}: {
  projects: Project[];
  initialType: string;
}) {
  return (
    <div className="site-page site-page--work">
      <Container>
        <Grid>
          <Col span={12}>
            <header className="site-page__head" data-reveal>
              <SectionLabel />
              <h1 className="work-list__title">Project Index</h1>
            </header>
            <ProjectList
              key={initialType}
              projects={projects}
              initialType={initialType}
            />
          </Col>
        </Grid>
      </Container>
    </div>
  );
}
