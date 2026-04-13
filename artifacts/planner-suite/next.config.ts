import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/api-client-react", "@workspace/api-zod", "@workspace/db"],
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: false },
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ["*.picard.replit.dev", "*.replit.dev"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
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
