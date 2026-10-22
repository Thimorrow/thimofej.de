import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.wgsl": { loaders: ["@vgpu/wgsl/loader-webpack"], as: "*.js" },
    },
  },
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
