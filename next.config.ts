import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {STATIC_EXPORT_BUILD: "1"},
  images: {unoptimized: true},
  output: "export",
  reactStrictMode: true,
};

export default nextConfig;
