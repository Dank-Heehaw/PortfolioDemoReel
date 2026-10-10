import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Creative portfolio and demo reel.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
