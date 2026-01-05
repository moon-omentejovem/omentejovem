'use client'

import 'swiper/css'
import 'swiper/css/pagination'

import type { Artwork } from '@/types/artwork'
import { getProxiedImageUrl } from '@/lib/utils'
import Image from 'next/image'
import { Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperType } from 'swiper/types'

interface ArtworkThumbnailCarouselProps {
  artworks: Artwork[]
  onSelect: (index: number) => void | Promise<void>
  selectedIndex: number
}

export function ArtworkThumbnailCarousel({
  artworks,
  onSelect,
  selectedIndex
}: ArtworkThumbnailCarouselProps) {
  return (
    <section className="animated-section">
      <Swiper
        className="horizontal-in-carousel !overflow-visible"
        grabCursor={true}
        allowTouchMove={true}
        simulateTouch={true}
        modules={[Mousewheel]}
        mousewheel={true}
        slidesPerView={'auto'}
        slideToClickedSlide={true}
        initialSlide={selectedIndex >= 0 ? selectedIndex : 0}
        centeredSlides={true}
        onSlideChange={(swiper: SwiperType) => {
          onSelect(swiper.realIndex)
        }}
      >
        {artworks.map((artwork, index) => (
          <SwiperSlide
            key={artwork.id}
            className="h-24 w-24 max-w-fit xl:h-[120px] xl:w-[120px]"
          >
            <button
              type="button"
              aria-label={artwork.title || `Artwork ${index + 1}`}
              className="flex h-24 w-24 xl:h-[120px] xl:w-[120px]"
              onClick={() => onSelect(index)}
            >
              <Image
                src={getProxiedImageUrl(
                  artwork.imageoptimizedurl || artwork.imageurl || '/placeholder.png'
                )}
                alt={artwork.title || ''}
                width={100}
                height={100}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  selectedIndex === index ? 'opacity-100' : 'opacity-40'
                }`}
              />
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
