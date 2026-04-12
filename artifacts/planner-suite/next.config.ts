import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/api-client-react", "@workspace/api-zod"],
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
  output: "standalone",
};
export default nextConfig;
