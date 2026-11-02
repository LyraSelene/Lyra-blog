import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: false },
};
export default nextConfig;
