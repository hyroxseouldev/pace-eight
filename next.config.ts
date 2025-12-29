import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Next.js 16 Proxy 설정: URL 정규화 건너뛰기
  skipProxyUrlNormalize: true,
};

export default nextConfig;
