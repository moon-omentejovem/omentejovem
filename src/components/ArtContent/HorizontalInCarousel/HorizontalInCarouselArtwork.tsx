'use client'

import 'swiper/css'
import 'swiper/css/pagination'

import { Artwork } from '@/types/artwork'
// Removed legacy getImageUrlFromId
import Image from 'next/image'
import { useEffect } from 'react'
import { Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperType } from 'swiper/types'

interface HorizontalInCarouselArtworkProperties {
  slideIndex?: number
  onChangeSlideIndex: (index: number) => void
  slides: Artwork[]
  getMoreSlides?: () => void
}

export function HorizontalInCarouselArtwork({
  slideIndex,
  onChangeSlideIndex,
  slides,
  getMoreSlides
}: HorizontalInCarouselArtworkProperties) {
  useEffect(() => {
    // horizontalCarouselAnimation()
  }, [])

  function handleGetMoreslides(swiperInstance: SwiperType) {
    const currentIndex = swiperInstance.activeIndex
    const totalSlides = swiperInstance.slides.length

    if (currentIndex >= totalSlides / 2) {
      getMoreSlides?.()
    }
  }

  return (
    <section className="animated-section">
      <Swiper
        className="horizontal-in-carousel"
        grabCursor={true}
        modules={[Mousewheel]}
        mousewheel={true}
        slidesPerView={'auto'}
        slideToClickedSlide={true}
        initialSlide={slideIndex}
        centeredSlides={true}
        onSlideChange={(e: SwiperType) => {
          onChangeSlideIndex(e.realIndex)
        }}
        onSlideChangeTransitionEnd={(swiperInstance: SwiperType) => {
          handleGetMoreslides(swiperInstance)
        }}
      >
        {slides.map((artwork, index) => (
          <SwiperSlide
            key={artwork.id}
            className="h-24 w-24 max-w-fit xl:h-[120px] xl:w-[120px]"
          >
            <div
              aria-label={artwork.title}
              className="flex h-24 w-24 xl:h-[120px] xl:w-[120px]"
            >
              <Image
                src={artwork.imageurl || '/placeholder.png'}
                alt={artwork.title || ''}
                width={100}
                height={100}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  slideIndex === index ? 'opacity-100' : 'opacity-40'
                }`}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
