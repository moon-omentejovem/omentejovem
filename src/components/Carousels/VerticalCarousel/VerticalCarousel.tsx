'use client'

import 'swiper/css'
import 'swiper/css/pagination'
import './style.css'

import { cn } from '@/lib/utils'
import { addLoadedClass } from '@/utils/lazyLoading'
import Image from 'next/image'
import Link from 'next/link'
import { Mousewheel, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperType } from 'swiper/types'

interface VerticalCarouselProperties {
  slideIndex?: number
  onChangeSlideIndex: (index: number) => void
  slides: {
    name: string
    nftCompressedHdUrl: string
    slug?: string
  }[]
  getMoreSlides?: () => void
  redirectSource?: string
  onRedirect?: (index: number) => void
}

export function VerticalCarousel({
  slideIndex,
  onChangeSlideIndex,
  slides,
  getMoreSlides,
  redirectSource,
  onRedirect
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
        loop={false}
        mousewheel={true}
        slideToClickedSlide={true}
        initialSlide={slideIndex}
        className="vertical-slider"
        centeredSlides={true}
        onSlideChange={(e) => {
          const newIndex = e.realIndex % slides.length
          // Sempre navegar para a página da arte quando mudar o slide
          onRedirect?.(newIndex)
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
              className="flex h-[150px] w-[150px] lazy-load-img-wrapper relative"
            >
              <div
                className="cursor-pointer w-full h-full"
                onClick={() => onRedirect?.(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onRedirect?.(index)
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${art.name}`}
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

              {redirectSource && art.slug && (
                <Link
                  href={`/${redirectSource}/${art.slug}`}
                  aria-label={art.name}
                  className="absolute inset-0 z-10"
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
