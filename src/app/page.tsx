import { HomeView } from "@/components/views/HomeView";
import { RevealHero } from "@/components/motion/PageMotion";

// /  — this file is the home page because it lives at src/app/page.tsx

export default function HomePage() {
  return (
    <RevealHero>
      <HomeView />
    </RevealHero>
  );
}
