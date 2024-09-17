/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  webpack(config, { dev }) {
    if (dev) {
      config.devtool = 'source-map'; // Ensure source maps are generated
    }
    return config;
  },
  headers: () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store'
        }
      ]
    }
  ],
  
}

module.exports = nextConfig
