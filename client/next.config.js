/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // Disable ESLint during builds to prevent CRLF/LF conflicts in CI/CD
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co'
      },
      {
        protocol: 'https',
        hostname: 'opensea.io'
      },
      {
        protocol: 'https',
        hostname: '**.opensea.io'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com'
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io'
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.nftstorage.link'
      }
    ]
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  webpack(config, { dev }) {
    if (dev) {
      config.devtool = 'source-map' // Ensure source maps are generated
    }
    return config
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
  ]
}

module.exports = nextConfig
