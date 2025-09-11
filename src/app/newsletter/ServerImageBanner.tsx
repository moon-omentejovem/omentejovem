'use server'
/**
 * Versão Server-Side pura do ImageBanner
 * Não precisa de client component para as imagens
 */

import { getArtworksServer } from '@/lib/server-queries'
import { SmoothImage } from './SmoothImage'

export async function ServerImageBanner() {
  // Buscar imagens diretamente no servidor
  const artworks = await getArtworksServer({ limit: 10 })
  const images = artworks.map((artwork) => artwork.image_url)

  return (
    <div className="fixed left-0 top-0 h-full overflow-hidden hidden md:block z-50">
      <div className="animate-scroll flex flex-col">
        {[...images, ...images].map((src, index) => (
          <SmoothImage
            key={index}
            src={src}
            alt={`Banner image ${index + 1}`}
            width={200}
            height={200}
            priority
          />
        ))}
      </div>
    </div>
  )
}
