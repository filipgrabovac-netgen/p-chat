import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable static export for dynamic routes in development
  // For production, we'll use standalone output
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  // trailingSlash generates cleaner directory structure with index.html files
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // No assetPrefix needed since Django serves everything from same domain
  basePath: "",
  distDir: "out",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
