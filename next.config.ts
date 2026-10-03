import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No linter is installed in this project (kept deliberately minimal).
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
