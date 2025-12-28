'use client'

import 'swiper/css'
import 'swiper/css/pagination'
import './style.css'

import { cn, getProxiedImageUrl } from '@/lib/utils'
import { addLoadedClass } from '@/utils/lazyLoading'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Mousewheel, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperType } from 'swiper/types'

interface VerticalCarouselProperties {
  slideIndex?: number
  slides: {
    name: string
    imageUrl: string | null
    slug?: string
  }[]
  redirectSource?: string
  onSelect?: (index: number, replace?: boolean) => void
}

export function VerticalCarousel({
  slideIndex,
  slides,
  redirectSource,
  onSelect,
  className,
  isFixed = true,
  offsetTopClass
}: VerticalCarouselProperties & {
  className?: string
  isFixed?: boolean
  offsetTopClass?: string
}) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null)

  const fixedClasses = isFixed
    ? cn(
        'hidden xl:flex fixed h-screen right-0 z-40 2xl:h-[100vh] xl:right-[10vw]',
        offsetTopClass ?? 'top-0 2xl:top-0'
      )
    : 'hidden xl:flex'

  useEffect(() => {
    if (!swiper) return
    if (typeof slideIndex !== 'number') return
    if (slideIndex < 0 || slideIndex >= slides.length) return
    if (swiper.destroyed) return
    if (swiper.realIndex === slideIndex) return

    swiper.slideTo(slideIndex)
  }, [slideIndex, slides.length, swiper])

  return (
    <div
      className={cn(fixedClasses, className)}
    >
      <Swiper
        direction="vertical"
        slidesPerView={'auto'}
        grabCursor={true}
        allowTouchMove={true}
        simulateTouch={true}
        modules={[Mousewheel, Pagination]}
        watchSlidesProgress={true}
        loop={false}
        mousewheel={true}
        slideToClickedSlide={true}
        initialSlide={slideIndex}
        className="vertical-slider"
        centeredSlides={true}
        onSwiper={(instance: SwiperType) => setSwiper(instance)}
        onSlideChangeTransitionEnd={(e: SwiperType) => {
          const newIndex = e.realIndex % slides.length
          onSelect?.(newIndex, true)
        }}
      >
        {slides.map((art, index) => {
          const isCurrent = typeof slideIndex === 'number' && slideIndex === index
          const hasLink = !!redirectSource && !!art.slug
          const shouldWrapWithLink = hasLink && !onSelect

          const imageContent = art.imageUrl ? (
            <Image
              src={getProxiedImageUrl(art.imageUrl)}
              alt={art.name}
              width={150}
              height={150}
              className="h-full w-full object-cover lazy-load-img"
              loading="lazy"
              onLoad={addLoadedClass}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-white">
              <span className="text-xs text-gray-400">
                Nenhuma imagem cadastrada
              </span>
            </div>
          )

          return (
            <SwiperSlide
              key={`${art.name}.${index}`}
              className={cn(
                'h-[150px] max-h-[150px]',
                isCurrent && 'vertical-slide-current'
              )}
            >
              <div
                aria-label={art.name}
                className="flex h-[150px] w-[150px] lazy-load-img-wrapper relative"
              >
                {shouldWrapWithLink ? (
                  <Link
                    href={`/${redirectSource}/${art.slug}`}
                    aria-label={art.name}
                    className="w-full h-full cursor-pointer block"
                  >
                    {imageContent}
                  </Link>
                ) : (
                  <div
                    className="cursor-pointer w-full h-full"
                    onClick={() => onSelect?.(index, false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelect?.(index, false)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={art.name}
                  >
                    {imageContent}
                  </div>
                )}
                {hasLink && onSelect && art.slug ? (
                  <Link
                    href={`/${redirectSource}/${art.slug}`}
                    aria-label={art.name}
                    className="absolute inset-0 z-10 pointer-events-none vertical-slide-link"
                  >
                    <span className="sr-only">Go to {art.name}</span>
                  </Link>
                ) : null}
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
