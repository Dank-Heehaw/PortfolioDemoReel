import type { Metadata } from "next";
import { WorkView } from "@/components/views/WorkView";
import { RevealPanel } from "@/components/motion/PageMotion";
import { getProjects } from "@/lib/projects";

// /work  — this file is the page because it lives at app/work/page.tsx

export const metadata: Metadata = {
  title: "Project Index",
};

export const revalidate = 60;

export default async function WorkPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const projects = await getProjects();
  const requestedCategory = (await searchParams).category;
  const category = Array.isArray(requestedCategory)
    ? requestedCategory[0]
    : requestedCategory;
  const initialType = projects.some((project) => project.category === category)
    ? category!
    : "all";

  return (
    <RevealPanel>
      <WorkView projects={projects} initialType={initialType} />
    </RevealPanel>
  );
}
