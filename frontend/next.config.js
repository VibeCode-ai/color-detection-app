/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // GitHub Pages settings
  basePath: process.env.NODE_ENV === 'production' ? '/color-detection-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/color-detection-app/' : '',
  // Keep existing rewrites for local development
  async rewrites() {
    return process.env.NODE_ENV === 'production' ? [] : [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*', // Proxy API requests to backend
      },
    ];
  },
}

module.exports = nextConfig
