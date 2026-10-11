import type { NextConfig } from "next";
import path from "node:path";

// Keep Turbopack rooted on this app so a leftover lockfile
// in a parent folder does not steal the workspace root.
const nextConfig: NextConfig = {
  devIndicators: false,
  compiler: {
    styledComponents: true,
  },
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
