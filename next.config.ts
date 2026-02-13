import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Disable ESLint during builds (errors are warnings in .eslintrc.json)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We already verified types pass with tsc --noEmit
    ignoreBuildErrors: false,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
