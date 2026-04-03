import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://43.204.110.39:3000/:path*",
      },
    ];
  },
};

export default nextConfig;
