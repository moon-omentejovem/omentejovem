import { useArtworks } from './useArtworks'

export function useHomeArtworks(limit?: number) {
  return useArtworks({ featured: true, limit, random: true })
}
