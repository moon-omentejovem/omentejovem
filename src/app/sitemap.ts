import { ArtworkService } from '@/services/artwork.service'
import { SeriesService } from '@/services/series.service'
import type { MetadataRoute } from 'next'

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.omentejovem.com'

// Sitemap using canonical Services (preferred):
// - ArtworkService.getPublishedArtworks() for artworks
// - SeriesService.getCollectionsData() for series and nested artwork slugs
// Falls back to a small set of static routes if services fail.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl.replace(/\/$/, '')

  const disallowedPrefixes = ['/admin', '/api', '/draft', '/private']

  const makeItem = (url: string, priority: number) => ({
    url,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority
  })

  const items: Array<{
    url: string
    lastModified: Date
    changeFrequency: 'weekly'
    priority: number
  }> = []

  // Static core pages (adjust if your paths differ)
  const staticPages = [
    { path: '/', priority: 1.0 },
    { path: '/about', priority: 0.8 },
    { path: '/exhibitions', priority: 0.8 },
    { path: '/contact', priority: 0.8 },
    { path: '/portfolio', priority: 0.8 },
    { path: '/editions', priority: 0.8 },
    { path: '/series', priority: 0.8 }
  ]

  for (const p of staticPages) {
    items.push(makeItem(`${base}${p.path}`, p.priority))
  }

  // 1) Add artworks (canonical source)
  try {
    const res = await ArtworkService.getPublishedArtworks({ limit: 2000 })
    if (res && Array.isArray(res.artworks)) {
      for (const art of res.artworks) {
        if (!art?.slug) continue
        const url = `${base}/portfolio/${art.slug}`
        if (disallowedPrefixes.some((d) => url.includes(d))) continue
        items.push(makeItem(url, 0.6))
      }
    }
  } catch (e) {
    // fallback: ignore artworks
  }

  // 2) Add series and nested artwork paths via SeriesService
  try {
    const collections = await SeriesService.getCollectionsData()
    if (collections?.collections && Array.isArray(collections.collections)) {
      for (const series of collections.collections) {
        if (!series?.slug) continue
        const seriesUrl = `${base}/series/${series.slug}`
        if (!disallowedPrefixes.some((d) => seriesUrl.includes(d))) {
          items.push(makeItem(seriesUrl, 0.8))
        }
        // nested artwork slugs (if available)
        const nftSlugs = series.nftSlugs || []
        for (const s of nftSlugs) {
          if (!s) continue
          const artUrl = `${base}/series/${series.slug}/${s}`
          if (disallowedPrefixes.some((d) => artUrl.includes(d))) continue
          items.push(makeItem(artUrl, 0.6))
        }
      }
    }
  } catch (e) {
    // ignore
  }

  // De-duplicate and return
  const seen = new Set<string>()
  const filtered: Array<{
    url: string
    lastModified: string | Date
    changeFrequency?:
      | 'weekly'
      | 'daily'
      | 'hourly'
      | 'monthly'
      | 'never'
      | 'always'
      | 'yearly'
    priority?: number
  }> = []
  for (const it of items) {
    if (!it?.url) continue
    if (seen.has(it.url)) continue
    seen.add(it.url)
    filtered.push(it)
  }

  return filtered as unknown as MetadataRoute.Sitemap
}
