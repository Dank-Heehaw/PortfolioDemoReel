"use client";

import { useEffect, useState } from "react";
import { Container, RevealLine } from "@/components/ui/Container";

const REELS = [
  { id: "2026", label: "2026" },
  { id: "2027", label: "2027" },
] as const;

type ReelId = (typeof REELS)[number]["id"];

export function HomeView({ reelSrc = "" }: { reelSrc?: string }) {
  const [reel, setReel] = useState<ReelId>("2026");
  const [allowAutoplay, setAllowAutoplay] = useState(true);
  const playing = reel === "2026" && Boolean(reelSrc);

  useEffect(() => {
    setAllowAutoplay(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="site-home" data-fullpage>
      <section className="site-panel site-panel--hero" data-panel="intro">
        <Container>
          <div className="site-hero">
            <div className="site-hero__bar grid">
              <p className="col-6 col-sm-12">
                <RevealLine>Based in Toronto, Ontario</RevealLine>
              </p>
              <div className="col-6 col-sm-12 is-end">
                <RevealLine>
                  <div className="site-reel__switch" role="tablist" aria-label="Demo reel">
                    {REELS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        id={`reel-tab-${item.id}`}
                        aria-selected={reel === item.id}
                        aria-controls="reel-stage"
                        className={reel === item.id ? "is-active" : ""}
                        onClick={() => setReel(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </RevealLine>
              </div>
            </div>

            <div
              className="site-reel"
              id="reel-stage"
              role="tabpanel"
              aria-labelledby={`reel-tab-${reel}`}
            >
              {playing ? (
                <video
                  className="site-reel__video"
                  src={reelSrc}
                  controls
                  playsInline
                  autoPlay={allowAutoplay}
                  muted
                  loop
                  preload="metadata"
                  aria-label="Demo reel 2026"
                />
              ) : (
                <div className="site-reel__soon">
                  <p>{reel === "2027" ? "Coming soon" : "Demo reel"}</p>
                  <span>{reel === "2027" ? "2027" : "2026"}</span>
                </div>
              )}
            </div>

            <div className="site-hero__bar grid">
              <h1 className="site-hero__role col-8 col-md-12">
                <RevealLine>Interactive</RevealLine>
                <RevealLine>media designer</RevealLine>
              </h1>
              <p className="col-6 col-sm-12">
                <RevealLine>01 // Approach</RevealLine>
              </p>
              <p className="col-6 col-sm-12 is-end">
                <RevealLine>
                  <a href="/contact" data-nav>
                    Contact
                  </a>
                </RevealLine>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
