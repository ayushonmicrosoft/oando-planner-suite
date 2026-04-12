import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/api-client-react", "@workspace/api-zod", "@workspace/db"],
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: false },
  allowedDevOrigins: ["*.picard.replit.dev", "*.replit.dev"],
  async rewrites() {
    return [
      {
        source: "/api/collab/:planId",
        destination: "http://localhost:8080/api/collab/:planId",
      },
    ];
  },
};
export default nextConfig;
