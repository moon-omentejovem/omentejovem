/**
 * Hook para navegação em carousels
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
    (index: number) => {
      const artwork = artworks[index]
      if (artwork?.slug) {
        // Navegar para a página individual da arte
        router.push(`/${source}/${artwork.slug}`)
      } else {
        // Fallback para o comportamento de mudança de índice
        onChangeIndex?.(index)
      }
    },
    [router, source, artworks, onChangeIndex]
  )

  return { handleNavigation }
}
