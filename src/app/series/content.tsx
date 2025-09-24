'use client'

import { CollectionLink } from '@/components/CollectionLink'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

interface SeriesData {
  collections: Array<{
    name: string
    year: string
    slug: string
    nftSlugs: string[]
    coverImage?: string
  }>
}

export default function CollectionsContent(data: SeriesData) {
  const moveRef = useRef(null)
  const [currentCollection, setCurrentCollection] = useState(
    null as string | null
  )
  const [images, setImages] = useState([] as string[])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [collectionPreviewImages, setCollectionPreviewImages] = useState<
    string[]
  >([])

  useEffect(() => {
    // Extract cover images from collections data
    const coverImages = data.collections.map(
      (collection) => collection.coverImage || '/placeholder-series.jpg'
    )
    setCollectionPreviewImages(coverImages)
  }, [data.collections])

  useEffect(() => {
    // Find the index of the current collection
    const collectionIndex = data.collections.findIndex(
      (collection) => collection.name === currentCollection
    )
    if (collectionIndex !== -1) {
      setCurrentImageIndex(collectionIndex)
    }
  }, [currentCollection, data.collections])

  useEffect(() => {
    const moveElement = moveRef.current

    if (!moveElement) return

    const handlePointerMove = (event: MouseEvent) => {
      const { clientX, clientY } = event

      ;(moveElement as HTMLDivElement).animate(
        {
          left: `${clientX}px`,
          top: `${clientY}px`
        },
        { duration: 1000, fill: 'forwards' }
      )
    }

    document.body.addEventListener('pointermove', handlePointerMove)

    return () => {
      document.body.removeEventListener('pointermove', handlePointerMove)
    }
  }, [currentCollection])

  return (
    <main
      className="grid place-content-center justify-items-center py-40 min-h-screenMinusHeader overflow-hidden scroll-smooth"
      onPointerLeave={() => setCurrentCollection(null)}
    >
      {currentCollection && collectionPreviewImages[currentImageIndex] && (
        <div
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          className="pointer-events-none absolute flex items-center justify-center sm:group-hover/collection:z-[1000]"
          ref={moveRef}
        >
          <Image
            src={collectionPreviewImages[currentImageIndex]}
            width={400}
            height={300}
            alt="Collections"
            className="z-10 overflow-x-hidden max-w-[40vw] max-h-[60vh] aspect-auto sm:group-hover/collection:h-full sm:group-hover/collection:w-full"
          />
        </div>
      )}
      {data.collections?.map((collection) => (
        <CollectionLink
          key={collection.name}
          projectName={collection.name}
          year={collection.year}
          redirect={`/series/${collection.slug}`}
          images={collection.nftSlugs}
          onMouseOver={() => setCurrentCollection(collection.name)}
        />
      ))}
    </main>
  )
}
