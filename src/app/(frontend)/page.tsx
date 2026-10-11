import fs from "node:fs";
import path from "node:path";
import { HomeView } from "@/components/views/HomeView";
import { RevealHero } from "@/components/motion/PageMotion";

const REEL_FILE = path.join(process.cwd(), "public", "reel", "demo-reel-2026.mp4");

export default function HomePage() {
  const reelSrc = fs.existsSync(REEL_FILE) ? "/reel/demo-reel-2026.mp4" : "";

  return (
    <RevealHero>
      <HomeView reelSrc={reelSrc} />
    </RevealHero>
  );
}
