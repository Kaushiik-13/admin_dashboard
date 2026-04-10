import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://52.66.213.251/api/:path*",
      },
    ];
  },
};

export default nextConfig;
