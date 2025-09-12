/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // Disable ESLint during builds to prevent CRLF/LF conflicts in CI/CD
    // ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  experimental: {
    // Improve server component stability
    serverComponentsExternalPackages: ['@supabase/supabase-js', 'gsap']
  },
  images: {
    unoptimized: true, // Ativar otimização de imagens do Next.js
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
    ],
    minimumCacheTTL: 3600 // Cache por 1 hora
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
      source: '/_next/image',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=86400, immutable' // Cache imagens otimizadas por 1 dia
        }
      ]
    }
  ]
}

module.exports = nextConfig
