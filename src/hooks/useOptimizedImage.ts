import { useMemo } from 'react'

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

interface UseOptimizedImageOptions {
  /** Image size preset from IMAGE_SIZES */
  size?: keyof typeof IMAGE_SIZES
  /** Custom width */
  width?: number
  /** Custom height */
  height?: number
  /** Image quality (1-100) */
  quality?: number
  /** Image format */
  format?: 'webp' | 'jpeg' | 'png'
}

interface UseOptimizedImageResult {
  /** Optimized image URL */
  src: string
  /** Recommended width for Next.js Image */
  width: number
  /** Recommended height for Next.js Image */
  height: number
  /** Responsive sizes attribute */
  sizes: string
}

/**
 * Hook to get optimized image properties for Next.js Image component
 */
export function useOptimizedImage(
  imageUrl: string,
  options: UseOptimizedImageOptions = {}
): UseOptimizedImageResult {
  const {
    size = 'card',
    width: customWidth,
    height: customHeight,
    quality = 80,
    format = 'webp'
  } = options

  return useMemo(() => {
    if (!imageUrl) {
      return {
        src: '',
        width: 300,
        height: 300,
        sizes: '300px'
      }
    }

    // Use custom dimensions or preset size
    const dimensions =
      customWidth && customHeight
        ? { width: customWidth, height: customHeight }
        : IMAGE_SIZES[size]

    // Get optimized URL - for now just return the original URL
    // TODO: Implement actual image optimization if needed
    const src = imageUrl

    // Generate responsive sizes based on preset
    const sizes = generateResponsiveSizes(size)

    return {
      src,
      width: dimensions.width,
      height: dimensions.height,
      sizes
    }
  }, [imageUrl, size, customWidth, customHeight])
}

/**
 * Generate responsive sizes string based on image size preset
 */
function generateResponsiveSizes(size: keyof typeof IMAGE_SIZES): string {
  const sizeMap: Record<keyof typeof IMAGE_SIZES, string> = {
    thumb: '(max-width: 768px) 150px, 200px',
    thumbLarge: '(max-width: 768px) 300px, 400px',
    card: '(max-width: 768px) 250px, 300px',
    cardWide: '(max-width: 768px) 300px, 400px',
    hero: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
    heroMobile: '(max-width: 768px) 100vw, 800px',
    full: '(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1920px',
    cover: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 800px'
  }

  return sizeMap[size] || '300px'
}
