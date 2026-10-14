import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SiteChrome } from "@/components/SiteChrome";
import { getStaticWorkCategories } from "@/lib/work";
import { getSiteMarks } from "@/lib/site";
import "@/scss/styles.scss";

export const metadata: Metadata = {
  title: {
    default: "Waheed Khan — Interactive Media Designer",
    template: "%s — Waheed Khan",
  },
  description: "Interactive media designer based in Ontario.",
  icons: {
    icon: "/icons/favicon.svg",
    apple: "/icons/apple-touch-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#ef6223",
};

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  const workCategories = getStaticWorkCategories();
  const marks = getSiteMarks();

  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script id="portfolio-intro-state" strategy="beforeInteractive">
          {`if (sessionStorage.getItem("portfolio-intro") === "1") {
            document.documentElement.classList.add("intro-done");
          }`}
        </Script>
        <SiteChrome workCategories={workCategories} marks={marks}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
