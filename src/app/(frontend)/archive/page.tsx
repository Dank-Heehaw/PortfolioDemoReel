import type { Metadata } from "next";
import { ArchiveView } from "@/components/views/ArchiveView";
import { RevealArchive } from "@/components/motion/PageMotion";
import { getArchivePosts } from "@/lib/archive";

// /archive  — one page. Clicking a sample opens a lightbox, not a new URL.

export const metadata: Metadata = {
  title: "Archive",
};

export const revalidate = 60;

export default async function ArchivePage() {
  const items = await getArchivePosts();

  return (
    <RevealArchive>
      <ArchiveView items={items} />
    </RevealArchive>
  );
}
