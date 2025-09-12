/**
 * Tipos compartilhados para carousels
 */

export interface CarouselSlide {
  name: string
  nftCompressedHdUrl: string
  slug?: string
}

export interface CarouselNavigationProps {
  redirectSource?: string
  onRedirect?: (index: number) => void
}
