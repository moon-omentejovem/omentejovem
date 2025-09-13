/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {},
  experimental: {
    // Improve server component stability
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co'
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
