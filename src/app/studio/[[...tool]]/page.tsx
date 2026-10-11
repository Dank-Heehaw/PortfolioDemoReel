"use client";

import { NextStudio } from "next-sanity/studio";
import { useEffect, useState } from "react";
import type { Config } from "sanity";

function StudioSetup() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "4rem 1.5rem",
        fontFamily: "system-ui, sans-serif",
        background: "#111",
        color: "#f4f4f4",
      }}
    >
      <h1 style={{ fontSize: "1.75rem", fontWeight: 500 }}>Connect Sanity</h1>
      <p style={{ maxWidth: "36rem", lineHeight: 1.5 }}>
        The site is still using the local project files. Create a free project at sanity.io, then add
        these to <code>.env.local</code> and restart the dev server:
      </p>
      <pre
        style={{
          maxWidth: "36rem",
          padding: "1rem",
          background: "#1c1c1c",
          overflow: "auto",
        }}
      >{`NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your-viewer-token`}</pre>
      <p style={{ maxWidth: "36rem", lineHeight: 1.5 }}>
        In the Sanity project settings, add <code>http://localhost:3000</code> as a CORS origin with
        credentials allowed. Then open <code>/studio</code> again. Projects, journal, and archive use
        image uploads. Presentation previews the live site while you edit.
      </p>
    </main>
  );
}

export default function StudioPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    if (!configured) return;
    let cancelled = false;
    import("../../../../sanity.config").then((mod) => {
      if (!cancelled) setConfig(mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, [configured]);

  if (!configured) return <StudioSetup />;
  if (!config) return null;
  return <NextStudio config={config} />;
}
