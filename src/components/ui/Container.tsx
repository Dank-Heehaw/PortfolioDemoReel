import type { ReactNode } from "react";

/** Centered page width. Matches the archive `.container` class. */
export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`container ${className}`.trim()}>{children}</div>;
}

export function Grid({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={`grid ${className}`.trim()}>{children}</div>;
}

export function Col({
  span = 12,
  md,
  sm,
  className = "",
  children,
}: {
  span?: number;
  md?: number;
  sm?: number;
  className?: string;
  children: ReactNode;
}) {
  const cls = [
    `col-${span}`,
    md ? `col-md-${md}` : "",
    sm ? `col-sm-${sm}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={cls}>{children}</div>;
}

export function SectionLabel({ text = "" }: { text?: string }) {
  return <p className="section-label">{text}</p>;
}

/** Clip wrapper the GSAP hero animation slides up from. */
export function RevealLine({ children }: { children: ReactNode }) {
  return (
    <span className="reveal-line">
      <span className="reveal-line__inner">{children}</span>
    </span>
  );
}
