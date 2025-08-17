// next.config.ts
import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

// Wrap with PWA and add fallbacks
export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/_offline", // must match your offline page name
  },
})(nextConfig);
