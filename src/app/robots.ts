import type { MetadataRoute } from 'next'

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.omentejovem.com'

// Robots policy: allow all by default but disallow sensitive/internal routes
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Disallow sensitive areas. Include both bare and trailing-slash forms
        disallow: [
          '/admin',
          '/admin/',
          '/api',
          '/api/',
          '/draft',
          '/draft/',
          '/private',
          '/private/',
          // block any URL containing a preview query param (common preview query patterns)
          '/*?*preview=*'
        ]
      }
    ],
    sitemap: `${baseUrl.replace(/\/$/, '')}/sitemap.xml`
  }
}
