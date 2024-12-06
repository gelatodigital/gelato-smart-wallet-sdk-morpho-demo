import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    minimumCacheTTL: 31536000,
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
