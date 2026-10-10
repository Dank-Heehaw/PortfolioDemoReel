/**
 * Root layout — Next hosts the portfolio; the SPA owns the visible UI.
 */
export const metadata = {
  title: "Waheed Khan — Interactive Media Designer",
  description: "Interactive media designer based in Ontario.",
  icons: {
    icon: "/icons/favicon.svg",
    apple: "/icons/apple-touch-icon.svg",
  },
};

export const viewport = {
  themeColor: "#ef6223",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
