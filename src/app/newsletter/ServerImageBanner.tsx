import { CachedImage } from '@/components/CachedImage'
import { getArtworksServer } from '@/lib/server-queries'

export async function ServerImageBanner() {
  const artworks = await getArtworksServer({ limit: 10 })
  const images = artworks.map((artwork) => artwork.image_url)
  const duplicatedImages = [...images, ...images]

  return (
    <>
      {/* PRELOAD AGRESSIVO - Todas as imagens críticas */}
      {images.map((src, index) => (
        <link key={`preload-${index}`} rel="preload" as="image" href={src} />
      ))}

      {/* PREFETCH das imagens duplicadas para scroll infinito */}
      {images.map((src, index) => (
        <link key={`prefetch-${index}`} rel="prefetch" as="image" href={src} />
      ))}

      {/* DNS Prefetch para CDNs externos */}
      <link rel="dns-prefetch" href="//ipfs.io" />
      <link rel="dns-prefetch" href="//gateway.pinata.cloud" />
      <link rel="dns-prefetch" href="//arweave.net" />

      <div className="fixed left-0 top-0 h-full overflow-hidden hidden md:block z-50">
        <div className="animate-scroll flex flex-col">
          {duplicatedImages.map((src, index) => (
            <CachedImage
              key={index}
              src={src}
              alt={`Banner image ${index + 1}`}
              width={200}
              height={200}
              // TODAS as imagens com prioridade para carregamento imediato
              priority={true}
            />
          ))}
        </div>
      </div>
    </>
  )
}
