'use client'

import { ProcessedArtwork } from '@/types/artwork'

interface ArtFilterProperties {
  currentPage: number
  artImages: ProcessedArtwork[]
  onChangeArtImages: (artworks: ProcessedArtwork[]) => void
}

export function ArtFilterNew({
  currentPage,
  artImages,
  onChangeArtImages
}: ArtFilterProperties) {
  // For now, just pass through the artImages without filtering
  // TODO: Implement proper filtering for ProcessedArtwork
  // Removed useEffect that was causing infinite loop
  // The filtering should be done based on user interaction, not on every render

  return (
    <div className="flex justify-center py-4">
      <div className="text-sm text-gray-400">
        Showing {artImages.length} artworks
      </div>
    </div>
  )
}
