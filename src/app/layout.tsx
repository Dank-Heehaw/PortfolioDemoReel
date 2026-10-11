import type { Metadata, Viewport } from "next";
import { SiteChrome } from "@/components/SiteChrome";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {/* Header, menu, footer, and GSAP chrome wrap every page. */}
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
