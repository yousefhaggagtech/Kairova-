import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const LOCAL_API_BASE_URL = "http://localhost:4000";

function getApiBaseUrl() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    LOCAL_API_BASE_URL
  ).replace(/\/+$/, "");
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${getApiBaseUrl()}/api/:path*`,
      },
    ];
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/1pscfy7oah/kiarova/**",
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
