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
      },
      {
        protocol: 'https',
        hostname: 'opensea.io'
      },
      {
        protocol: 'https',
        hostname: 'openseauserdata.com'
      },
      {
        protocol: 'https',
        hostname: 'img.seadn.io'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 3600, // Cache por 1 hora
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
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
