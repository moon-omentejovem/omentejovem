/**
 * Hook para navegação simples em carousels
 */

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

interface UseCarouselNavigationProps {
  source: string
  artworks: Array<{ slug: string }>
  onChangeIndex?: (index: number) => void
}

export function useCarouselNavigation({
  source,
  artworks,
  onChangeIndex
}: UseCarouselNavigationProps) {
  const router = useRouter()

  const handleNavigation = useCallback(
    (index: number, replace = false) => {
      const artwork = artworks[index]
      if (!artwork?.slug) {
        onChangeIndex?.(index)
        return
      }

      // Usar replace para scroll, push para clique
      if (replace) {
        router.replace(`/${source}/${artwork.slug}`)
      } else {
        router.push(`/${source}/${artwork.slug}`)
      }
    },
    [router, source, artworks, onChangeIndex]
  )

  return { handleNavigation }
}
