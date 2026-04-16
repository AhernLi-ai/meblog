import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
  
  // Fix lockfile warning
  turbopack: {
    root: '/Users/ahern/code/projects/meblog/frontend/next-frontend',
  },
};

export default nextConfig;
