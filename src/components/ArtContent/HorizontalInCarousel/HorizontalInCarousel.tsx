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

interface HorizontalInCarouselProperties {
  slideIndex?: number
  onChangeSlideIndex: (index: number) => void
  slides: Artwork[]
  getMoreSlides?: () => void
}

export function HorizontalInCarousel({
  slideIndex,
  onChangeSlideIndex,
  slides,
  getMoreSlides
}: HorizontalInCarouselProperties) {
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
        {slides.map((art, index) => (
          <SwiperSlide
            key={index}
            className="h-24 w-24 max-w-fit xl:h-[120px] xl:w-[120px]"
          >
            <div
              aria-label={art.title}
              className="flex h-24 w-24 xl:h-[120px] xl:w-[120px]"
            >
              <Image
                src={art.imageurl || '/placeholder.png'}
                alt={art.title || ''}
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
