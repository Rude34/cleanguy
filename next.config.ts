import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];

    return [
      {
        source: "/bpc-management",
        destination: "http://127.0.0.1:5173/bpc-management/",
      },
      {
        source: "/bpc-management/:path*",
        destination: "http://127.0.0.1:5173/bpc-management/:path*",
      },
    ];
  },
};

export default nextConfig;
