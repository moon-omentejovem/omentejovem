'use client'

import 'swiper/css'
import 'swiper/css/pagination'
import './style.css'

import Image from 'next/image'
import Link from 'next/link'
import { FreeMode, Mousewheel, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useEffect } from 'react'
import {
  carouselFigcaptionAnimation,
  carouselActiveSlideAnimation
} from '@/animations'
import { cn } from '@/lib/utils'
import { Swiper as SwiperType } from 'swiper/types'
import { addLoadedClass } from '@/utils/lazyLoading'

interface HorizontalCarouselProperties {
  currentPage: number
  loading?: boolean
  slides: {
    name: string
    nftCompressedHdUrl: string
  }[]
  redirectSource?: string
  onRedirect: (index: number) => void
  getMoreSlides?: () => void
}

export function HorizontalCarousel({
  currentPage,
  loading,
  slides,
  redirectSource,
  onRedirect,
  getMoreSlides
}: HorizontalCarouselProperties) {
  useEffect(() => {
    // horizontalCarouselAnimation()
  }, [])

  function figcaptionAnimationHandler(element: HTMLElement, open: boolean) {
    if (window.screen.width >= 768) {
      carouselFigcaptionAnimation(element, open)
    }
  }

  function slideOnChangeAnimationHandler() {
    if (window.screen.width >= 768) {
      carouselActiveSlideAnimation()
    }
  }

  function handleGetMoreslides(swiperInstance: SwiperType) {
    const currentIndex = swiperInstance.activeIndex
    const totalSlides = swiperInstance.slides.length

    if (currentIndex >= Math.round(totalSlides / 2)) {
      getMoreSlides?.()
    }
  }

  function getRandomSkeletonHeight() {
    const minHeight = 35
    const maxHeight = 70
    return Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight
  }

  return (
    <section className="animated-section h-[44vh] w-[75vw] flex items-end self-center sm:h-[52vh] md:h-[65vh]">
      <Swiper
        className="horizontal-carousel"
        grabCursor={true}
        modules={[Mousewheel, FreeMode, Pagination]}
        mousewheel={true}
        slideToClickedSlide={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        speed={800}
        onSlideChangeTransitionEnd={(swiperInstance) => {
          slideOnChangeAnimationHandler()
        }}
        onAfterInit={() => {
          slideOnChangeAnimationHandler()
        }}
      >
        {(currentPage > 1 || !loading) &&
          slides.map((slide, index) => (
            <SwiperSlide key={index} className="w-fit max-w-fit">
              <div className="flex flex-col items-center">
                <div
                  id="image-wrapper"
                  className="relative flex flex-col h-fit w-auto justify-center"
                >
                  <div
                    id="art-wrapper"
                    className="relative flex flex-col justify-center lazy-load-img-wrapper"
                    onMouseEnter={(e) => {
                      figcaptionAnimationHandler(e.currentTarget, true)
                    }}
                    onMouseLeave={(e) => {
                      figcaptionAnimationHandler(e.currentTarget, false)
                    }}
                  >
                    <figcaption
                      className={cn(
                        'absolute top-0 -translate-y-full',
                        'flex flex-wrap px-1 gap-x-2 w-full justify-between items-end overflow-hidden'
                      )}
                    >
                      <p className="text-sm text-secondary-100 line-clamp-2">
                        {slide.name}
                      </p>
                    </figcaption>

                    <Image
                      src={slide.nftCompressedHdUrl}
                      alt={slide.name}
                      width={0}
                      height={0}
                      className="h-full w-48 object-cover sm:w-64 2xl:w-[22rem] lazy-load-img"
                      loading="lazy"
                      onLoad={addLoadedClass}
                    />
                  </div>

                  {redirectSource && (
                    <Link
                      href={`/${redirectSource}`}
                      onClick={() => onRedirect(index)}
                      aria-label={slide.name}
                      className="hidden absolute h-full w-full"
                    />
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        {loading &&
          [...Array(8).keys()].map((index) => (
            <SwiperSlide key={index} className="w-fit max-w-fit self-center">
              <div
                role="status"
                className="skeleton-loader animate-pulse flex items-center h-96 w-48 sm:w-64 2xl:w-[22rem]"
              >
                <div
                  style={{ height: `${getRandomSkeletonHeight()}%` }}
                  className="flex justify-center items-center h-full w-full"
                >
                  <div className="h-full w-full bg-secondary-100"></div>
                </div>
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
    </section>
  )
}
