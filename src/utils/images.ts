// Image utility functions for the Omentejovem project
// Provides image URL processing and proxy integration

const IMAGE_PROXY_BASE = '/api/images/proxy'

interface ImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

/**
 * Generate a proxied image URL with optional transformations
 * @param imageUrl Original image URL
 * @param options Transformation options
 * @returns Proxied image URL
 */
export function getProxiedImageUrl(
  imageUrl: string,
  options?: ImageOptions
): string {
  if (!imageUrl) return ''

  // If it's already a proxied URL, return as-is
  if (imageUrl.startsWith(IMAGE_PROXY_BASE)) {
    return imageUrl
  }

  // If it's a relative URL, return as-is
  if (!imageUrl.startsWith('http')) {
    return imageUrl
  }

  const params = new URLSearchParams({ url: imageUrl })

  if (options?.width) params.set('width', options.width.toString())
  if (options?.height) params.set('height', options.height.toString())
  if (options?.quality) params.set('quality', options.quality.toString())
  if (options?.format) params.set('format', options.format)

  return `${IMAGE_PROXY_BASE}?${params.toString()}`
}

/**
 * Common image sizes for the application
 */
export const IMAGE_SIZES = {
  // Thumbnails
  thumb: { width: 200, height: 200 },
  thumbLarge: { width: 400, height: 400 },

  // Cards
  card: { width: 300, height: 300 },
  cardWide: { width: 400, height: 300 },

  // Hero sections
  hero: { width: 1200, height: 800 },
  heroMobile: { width: 800, height: 600 },

  // Full size
  full: { width: 1920, height: 1920 },

  // Cover images
  cover: { width: 800, height: 400 }
} as const

/**
 * Get optimized image URL for specific use cases
 */
export function getOptimizedImageUrl(
  imageUrl: string,
  size: keyof typeof IMAGE_SIZES,
  format: ImageOptions['format'] = 'webp',
  quality: number = 80
): string {
  const sizeOptions = IMAGE_SIZES[size]

  return getProxiedImageUrl(imageUrl, {
    ...sizeOptions,
    format,
    quality
  })
}

/**
 * Generate responsive image sources for different screen sizes
 */
export function getResponsiveImageSources(
  imageUrl: string,
  format: ImageOptions['format'] = 'webp'
) {
  return {
    mobile: getProxiedImageUrl(imageUrl, { width: 400, format, quality: 80 }),
    tablet: getProxiedImageUrl(imageUrl, { width: 800, format, quality: 85 }),
    desktop: getProxiedImageUrl(imageUrl, { width: 1200, format, quality: 90 }),
    xl: getProxiedImageUrl(imageUrl, { width: 1920, format, quality: 95 })
  }
}

/**
 * Check if URL is an external image that should be proxied
 */
export function shouldProxyImage(imageUrl: string): boolean {
  if (!imageUrl) return false

  // Already proxied
  if (imageUrl.startsWith(IMAGE_PROXY_BASE)) return false

  // Relative URLs don't need proxying
  if (!imageUrl.startsWith('http')) return false

  // Common external image hosts that should be proxied
  const externalHosts = [
    'opensea.io',
    'openseauserdata.com',
    'img.seadn.io',
    'lh3.googleusercontent.com',
    'ipfs.io',
    'gateway.pinata.cloud',
    'cloudflare-ipfs.com',
    'images.unsplash.com'
  ]

  return externalHosts.some((host) => imageUrl.includes(host))
}

/**
 * Get the best image URL for display, using proxy when appropriate
 */
export function getBestImageUrl(
  imageUrl: string,
  options?: ImageOptions
): string {
  if (!imageUrl) return ''

  if (shouldProxyImage(imageUrl)) {
    return getProxiedImageUrl(imageUrl, options)
  }

  return imageUrl
}
