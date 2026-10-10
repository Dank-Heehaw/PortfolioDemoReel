"use client";

import { useEffect, useRef } from "react";

/**
 * Next.js client host for the existing portfolio SPA.
 * Mounts the same bootstrap used by Vite so visuals/motion stay identical.
 * Client-only: GSAP + DOM template strings are not SSR'd.
 */
export default function PortfolioApp() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    // Flag so src/main.js does not double-boot when imported under Next.
    window.__PORTFOLIO_NEXT__ = true;

    let cleanup = () => {};
    let cancelled = false;

    import("../main.js").then((mod) => {
      if (cancelled) return;
      cleanup = mod.bootstrapPortfolio(root) || (() => {});
    });

    return () => {
      cancelled = true;
      cleanup();
      delete window.__PORTFOLIO_NEXT__;
    };
  }, []);

  return <div id="app" ref={rootRef} suppressHydrationWarning />;
}
