import type { Metadata } from "next";
import { AboutView } from "@/components/views/AboutView";
import { RevealPanel } from "@/components/motion/PageMotion";

// /about  — this file is the page because it lives at app/about/page.tsx

export const metadata: Metadata = {
  title: "About me",
};

export default function AboutPage() {
  return (
    <RevealPanel>
      <AboutView />
    </RevealPanel>
  );
}
