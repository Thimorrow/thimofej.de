import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  async redirects() {
    return [
      { source: "/projects/project-one", destination: "/projects/academy", permanent: true },
    ];
  },
};

export default nextConfig;
