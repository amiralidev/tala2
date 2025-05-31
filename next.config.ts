import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dkstatics-public.digikala.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      // {
      //   source: "/loader.svg", // path in the public folder
      //   headers: [
      //     {
      //       key: "Cache-Control",
      //       value: "public, max-age=31536000, immutable", // Cache for 1 year
      //     },
      //   ],
      // },
    ];
  },
};

export default nextConfig;
