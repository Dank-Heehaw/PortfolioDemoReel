import type { Metadata } from "next";
import { WorkView } from "@/components/views/WorkView";
import { RevealPanel } from "@/components/motion/PageMotion";
import { getProjects } from "@/lib/projects";

// /work  — this file is the page because it lives at app/work/page.tsx

export const metadata: Metadata = {
  title: "Work",
};

export default function WorkPage() {
  const projects = getProjects();

  return (
    <RevealPanel>
      <WorkView projects={projects} />
    </RevealPanel>
  );
}
