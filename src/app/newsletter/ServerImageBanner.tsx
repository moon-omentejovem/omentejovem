/**
 * Versão Server-Side pura do ImageBanner
 * Não precisa de client component para as imagens
 */

import { ArtworkService } from '@/services'
import { getImageUrlFromId } from '@/utils/storage'
import Image from 'next/image'

export async function ServerImageBanner() {
  // Buscar imagens diretamente no servidor usando o novo service
  const { artworks } = await ArtworkService.getArtworks({ limit: 10 })
  const images = artworks
    .map((artwork) =>
      artwork.id && (artwork.image_filename || artwork.slug)
        ? getImageUrlFromId(
            artwork.id,
            artwork.image_filename || artwork.slug,
            'artworks',
            'optimized'
          )
        : null
    )
    .filter(Boolean)

  return (
    <div className="fixed left-0 top-0 h-full overflow-hidden hidden md:block z-50">
      <div className="animate-scroll flex flex-col">
        {[...images, ...images].map((src, index) => (
          <Image
            key={index}
            src={src as string}
            alt={`Banner image ${index + 1}`}
            width={200}
            height={200}
            className="object-cover"
          />
        ))}
      </div>
    </div>
  )
}
