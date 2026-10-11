import type { Metadata } from "next";
import { ContactView } from "@/components/views/ContactView";
import { RevealContact } from "@/components/motion/PageMotion";

// /contact  — this file is the page because it lives at app/contact/page.tsx

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <RevealContact>
      <ContactView />
    </RevealContact>
  );
}
