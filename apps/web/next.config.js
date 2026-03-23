/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  output: "standalone",
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
