import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/portal/planning-pdf": ["./lib/portal/fonts/Skia.ttf"],
    "/api/portal/products-pdf": ["./lib/portal/fonts/Skia.ttf", "./public/brand/mail/logo.png"],
    "/api/wp/planning": ["./lib/portal/fonts/Skia.ttf"],
  },
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
