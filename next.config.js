const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "public.tableau.com", pathname: "/**" },
    ],
  },
};

module.exports = nextConfig;
