import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        // Allow any hostname for HTTPS images.
        protocol: 'https',
        hostname: '**',
      }
    ],
  },
};

export default nextConfig;
