import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.35"],
  transpilePackages: ["@lexchain/api", "@lexchain/config", "@lexchain/types"],
};

export default nextConfig;
