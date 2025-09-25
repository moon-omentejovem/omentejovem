/**
 * Versão Server-Side pura do ImageBanner
 * Não precisa de client component para as imagens
 */

import { ArtworkService } from '@/services'
import Image from 'next/image'

export async function ServerImageBanner() {
  // Buscar imagens diretamente no servidor usando o novo service
  const { artworks } = await ArtworkService.getArtworks({ limit: 10 })
  const images = artworks.map((artwork) => artwork.imageurl || null)

  return (
    <div className="fixed left-0 top-0 h-full overflow-hidden hidden md:block z-50">
      <div className="animate-scroll flex flex-col">
        {[...images, ...images].map((src, index) =>
          src ? (
            <Image
              key={index}
              src={src as string}
              alt={`Banner image ${index + 1}`}
              width={200}
              height={200}
              className="object-cover"
            />
          ) : (
            <div
              key={index}
              className="w-[200px] h-[200px] flex items-center justify-center bg-white"
            >
              <span className="text-xs text-gray-400">
                Nenhuma imagem cadastrada
              </span>
            </div>
          )
        )}
      </div>
    </div>
  )
}
