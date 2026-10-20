import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/portal/planning-pdf": ["./lib/portal/fonts/CormorantGaramond-Medium.ttf", "./lib/portal/fonts/Outfit-Regular.ttf"],
    "/api/portal/products-pdf": [
      "./lib/portal/fonts/CormorantGaramond-Medium.ttf",
      "./lib/portal/fonts/Outfit-Regular.ttf",
      "./public/brand/mail/logo.png",
    ],
    "/api/wp/planning": ["./lib/portal/fonts/CormorantGaramond-Medium.ttf", "./lib/portal/fonts/Outfit-Regular.ttf"],
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
