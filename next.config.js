/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false, // Économise énormément de RAM
  typescript: { ignoreBuildErrors: true }, // Ignore les vérifications de type lourdes au build
  eslint: { ignoreDuringBuilds: true }, // Désactive le linter pendant le build
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
};

module.exports = nextConfig;