"use client";

/**
 * Tiny client wrappers.
 * The page itself can stay a Server Component (it just returns HTML).
 * These children run GSAP after that HTML is in the browser.
 */

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  bindFullpage,
  prepareHero,
  revealHero,
  revealJournalArticle,
  revealPanel,
  takeRevealDelay,
} from "@/lib/motion.js";

gsap.registerPlugin(useGSAP);

export function RevealHero({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      // Run in this layout effect so the hero is clipped before first paint.
      prepareHero(root);
      const unbind = bindFullpage(root) || (() => {});
      revealHero(root, { delay: takeRevealDelay(0.12) });
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
      revealPanel(root, { delay: takeRevealDelay(0) });
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
      revealJournalArticle(root, { delay: takeRevealDelay(0) });
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
