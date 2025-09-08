'use client'

import { ProcessedArtwork } from '@/types/artwork'
import { useEffect } from 'react'

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
  useEffect(() => {
    onChangeArtImages(artImages)
  }, [artImages, onChangeArtImages])

  return (
    <div className="flex justify-center py-4">
      <div className="text-sm text-gray-400">
        Showing {artImages.length} artworks
      </div>
    </div>
  )
}