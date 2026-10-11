"use client";

/**
 * Tiny client wrappers.
 * The page itself can stay a Server Component (it just returns HTML).
 * These children run GSAP after that HTML is in the browser.
 */

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

export function RevealHero({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      let unbind = () => {};

      import("@/lib/motion.js").then((motion) => {
        if (!ref.current) return;
        motion.prepareHero(root);
        unbind = motion.bindFullpage(root) || (() => {});
        motion.revealHero(root, { delay: 0.12 });
      });

      return () => unbind();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="motion-root">
      {children}
    </div>
  );
}

export function RevealPanel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      import("@/lib/motion.js").then((motion) => {
        if (ref.current) motion.revealPanel(root);
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="motion-root">
      {children}
    </div>
  );
}

export function RevealArticle({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      import("@/lib/motion.js").then((motion) => {
        if (ref.current) motion.revealJournalArticle(root);
      });
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="motion-root">
      {children}
    </div>
  );
}

export function RevealContact({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      let unbind = () => {};

      Promise.all([import("@/lib/contactMotion.js"), import("@/lib/motion.js")]).then(
        ([contact]) => {
          if (!ref.current) return;
          contact.revealContact(root);
          unbind = contact.bindContactPage(root) || (() => {});
        }
      );

      return () => unbind();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="motion-root">
      {children}
    </div>
  );
}

export function RevealArchive({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      let unbind = () => {};

      import("@/lib/archiveMotion.js").then((archive) => {
        if (!ref.current) return;
        archive.revealArchive(root);
        unbind = archive.bindArchivePage(root) || (() => {});
      });

      return () => unbind();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="motion-root">
      {children}
    </div>
  );
}
