/**
 * Hook específico para artworks 1/1
 * @deprecated Use useArtworks({ oneOfOne: true }) instead
 */

import { useArtworks } from './useArtworks'

export function useOneOfOneArtworks() {
  return useArtworks({ oneOfOne: true })
}
