/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {},
  experimental: {
    // Improve server component stability
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    // Enable performance optimizations
    optimizePackageImports: ['lucide-react', '@tanstack/react-query'],
    // Optimize server actions
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app']
    }
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
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
        hostname: 'i.seadn.io'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      }
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // Cache por 24 horas
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Melhorar performance de imagens
    unoptimized: false,
    loader: 'default'
  },
  logging: {
    fetches: {
      fullUrl: true
    }
  },
  webpack(config, { dev, isServer }) {
    if (dev) {
      config.devtool = 'source-map'
    }
    
    // Optimization for production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            priority: 40,
            enforce: true
          },
          lib: {
            test(module) {
              return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier())
            },
            name(module) {
              const hash = require('crypto').createHash('sha1')
              hash.update(module.identifier())
              return hash.digest('hex').substring(0, 8)
            },
            priority: 30,
            minChunks: 1,
            reuseExistingChunk: true
          }
        }
      }
    }
    
    return config
  },
  headers: () => [
    {
      source: '/_next/image',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable' // Cache imagens otimizadas por 1 ano
        }
      ]
    },
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    },
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        }
      ]
    }
  ]
}

module.exports = nextConfig
