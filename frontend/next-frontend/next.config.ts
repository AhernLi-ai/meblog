import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Enable strict mode for better React practices
  reactStrictMode: true,

  // Image optimization - use remotePatterns instead of deprecated domains
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
    unoptimized: true,
  },

  // Headers for API proxy
  async rewrites() {
    const isDev = process.env.NODE_ENV === 'development';
    return [
      {
        source: '/api/:path*',
        destination: isDev 
          ? 'http://localhost:8000/api/:path*'
          : 'http://meblog-backend:8000/api/:path*',
      },
    ];
  },

};

export default nextConfig;
