/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'out',
  images: {
    domains: [],
    remotePatterns: [],
  },
  async rewrites() {
    // In development, proxy /api to the local Express backend.
    // In production (Vercel), /api is served by the serverless function.
    if (process.env.NODE_ENV === 'production') return [];
    return [
      { source: '/api/:path*', destination: 'http://localhost:5000/:path*' },
    ];
  },
};

module.exports = nextConfig;
