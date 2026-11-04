import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.35"],
  productionBrowserSourceMaps: false,
};

export default nextConfig;
