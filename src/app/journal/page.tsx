import type { Metadata } from "next";
import { JournalView } from "@/components/views/JournalView";
import { RevealPanel } from "@/components/motion/PageMotion";
import { getJournalPosts } from "@/lib/journal";

// /journal  — this file is the page because it lives at app/journal/page.tsx

export const metadata: Metadata = {
  title: "Journal",
};

export default function JournalPage() {
  const posts = getJournalPosts();

  return (
    <RevealPanel>
      <JournalView posts={posts} />
    </RevealPanel>
  );
}
