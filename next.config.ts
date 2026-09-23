import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/novias",
        destination: "/parejas",
        permanent: true,
      },
      {
        source: "/:locale(en|fr)/novias",
        destination: "/:locale/parejas",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
