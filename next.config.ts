import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
    ],
  },
  serverExternalPackages: [
    'pino',
    'pino-abstract-transport',
    'pino-std-serializers',
    'sonic-boom',
    'thread-stream',
  ],
};

export default nextConfig;
