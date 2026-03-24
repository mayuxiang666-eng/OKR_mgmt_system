/** @type {import('next').NextConfig} */
const path = require('path');

const backendApiBase =
  process.env.BACKEND_API_BASE_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3001/api'
    : process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api');

const nextConfig = {
  output: "standalone",
  async rewrites() {
    return [
      {
        source: '/backend-api/:path*',
        destination: `${backendApiBase}/:path*`,
      },
    ];
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        https: false,
        http: false,
        url: false,
        zlib: false,
        crypto: false,
        stream: false,
        "image-size": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
