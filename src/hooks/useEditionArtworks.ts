/**
 * Hook específico para artworks de edições
 * @deprecated Use useArtworks({ type: 'edition' }) instead
 */

import { useArtworks } from './useArtworks'

export function useEditionArtworks() {
  return useArtworks({ type: 'edition' })
}
