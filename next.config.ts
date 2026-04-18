import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Finance-simulator",
  images: { unoptimized: true },
};

export default nextConfig;
