import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectView } from "@/components/views/ProjectView";
import { RevealArticle } from "@/components/motion/PageMotion";
import { getProject, getProjects } from "@/lib/projects";

// /work/[slug]  — [slug] is a folder name Next.js fills in (ford, hypedocs, …)

type ProjectPageProps = PageProps<"/work/[slug]">;

export function generateStaticParams() {
  return getProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Work" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <RevealArticle>
      <ProjectView project={project} />
    </RevealArticle>
  );
}
