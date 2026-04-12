import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/api-client-react", "@workspace/api-zod", "@workspace/db"],
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
  allowedDevOrigins: ["*.picard.replit.dev", "*.replit.dev"],
};
export default nextConfig;
