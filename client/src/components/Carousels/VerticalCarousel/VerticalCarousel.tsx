'use client'

import 'swiper/css'
import 'swiper/css/pagination'
import './style.css'

import Image from 'next/image'
import { Mousewheel, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperType } from 'swiper/types'
import { NftArt } from '@/components/ArtContent/types'
import { cn } from '@/lib/utils'
import { addLoadedClass } from '@/utils/lazyLoading'

interface VerticalCarouselProperties {
  slideIndex?: number
  onChangeSlideIndex: (index: number) => void
  slides: NftArt[]
  getMoreSlides?: () => void
}

export function VerticalCarousel({
  slideIndex,
  onChangeSlideIndex,
  slides,
  getMoreSlides
}: VerticalCarouselProperties) {
  function handleGetMoreslides(swiperInstance: SwiperType) {
    const currentIndex = swiperInstance.activeIndex
    const totalSlides = swiperInstance.slides.length

    if (currentIndex >= totalSlides / 2) {
      getMoreSlides?.()
    }
  }

  return (
    <div
      className={cn(
        'hidden fixed h-[calc(100vh-6.5rem)] top-[6.5rem] right-0 z-20',
        'xl:flex',
        '2xl:h-[100vh] 2xl:top-0 xl:right-[5vw]'
      )}
    >
      <Swiper
        direction="vertical"
        slidesPerView={'auto'}
        grabCursor={true}
        modules={[Mousewheel, Pagination]}
        watchSlidesProgress={true}
        loop={true}
        mousewheel={true}
        slideToClickedSlide={true}
        initialSlide={slideIndex}
        className="vertical-slider"
        centeredSlides={true}
        onSlideChange={(e) => {
          onChangeSlideIndex(e.realIndex % slides.length)
        }}
        onSlideChangeTransitionEnd={(swiperInstance) => {
          handleGetMoreslides(swiperInstance)
        }}
      >
        {[...slides].map((art, index) => (
          <SwiperSlide
            key={`${art.name}.${index}`}
            className="h-[150px] max-h-[150px]"
          >
            <div
              aria-label={art.name}
              className="flex h-[150px] w-[150px] lazy-load-img-wrapper"
            >
              <Image
                src={art.nftCompressedHdUrl}
                alt={art.name}
                width={0}
                height={0}
                className="h-full w-full object-cover lazy-load-img"
                loading="lazy"
                onLoad={addLoadedClass}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
