import { NotFoundView } from "@/components/views/NotFoundView";
import { RevealPanel } from "@/components/motion/PageMotion";

// Shown when a URL does not match any folder under src/app.

export default function NotFound() {
  return (
    <RevealPanel>
      <NotFoundView />
    </RevealPanel>
  );
}
