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
    const isTest = process.env.NEXT_PUBLIC_ENV === 'test';
    
    let apiBaseUrl;
    if (isDev) {
      apiBaseUrl = 'http://localhost:8000';
    } else if (isTest) {
      apiBaseUrl = 'http://meblog-backend:8000';
    } else {
      // Production - use the actual domain
      apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yourdomain.com';
    }
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiBaseUrl}/api/:path*`,
      },
    ];
  },

};

export default nextConfig;
