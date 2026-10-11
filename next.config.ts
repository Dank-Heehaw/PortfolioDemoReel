import type { NextConfig } from "next";
import path from "node:path";

// Keep Turbopack rooted on this app so a leftover lockfile
// in a parent folder does not steal the workspace root.
const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
