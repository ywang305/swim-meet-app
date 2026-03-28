import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.swimcloud.com",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        pathname: "/cstest/**",
      },
      {
        protocol: "https",
        hostname: "dummyimage.com",
      },
    ],
  },
};

export default nextConfig;
