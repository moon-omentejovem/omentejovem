'use client'

import 'swiper/css'
import 'swiper/css/pagination'
import './style.css'

import {
  carouselActiveSlideAnimation,
  carouselFigcaptionAnimation
} from '@/animations/client'
import { cn, getProxiedImageUrl } from '@/lib/utils'
import { addLoadedClass } from '@/utils/lazyLoading'
import Image from 'next/image'
import Link from 'next/link'
import { FreeMode, Mousewheel, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

interface HorizontalCarouselProperties {
  slides: {
    name: string
    imageUrl: string | null
    slug?: string
  }[]
  redirectSource?: string
  onSelect?: (index: number) => void
}

export function HorizontalCarousel({
  slides,
  redirectSource,
  onSelect
}: HorizontalCarouselProperties) {
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

  return (
    <section className="animated-section h-[44vh] w-[100vw] flex items-end self-center sm:h-[52vh] md:h-[65vh]">
      <Swiper
        className="horizontal-carousel"
        grabCursor={true}
        allowTouchMove={true}
        simulateTouch={true}
        modules={[Mousewheel, FreeMode, Pagination]}
        mousewheel={true}
        slideToClickedSlide={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        speed={800}
        onSlideChangeTransitionEnd={() => {
          slideOnChangeAnimationHandler()
        }}
        onAfterInit={() => {
          slideOnChangeAnimationHandler()
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={`${slide.slug ?? slide.name}.${index}`}
            className="w-fit max-w-fit"
          >
            <div className="flex flex-col items-center">
              <div
                id="image-wrapper"
                className="relative flex flex-col h-fit w-auto justify-center"
              >
                <div
                  id="art-wrapper"
                  className="relative flex flex-col justify-center lazy-load-img-wrapper"
                  onMouseEnter={(event) => {
                    figcaptionAnimationHandler(event.currentTarget, true)
                  }}
                  onMouseLeave={(event) => {
                    figcaptionAnimationHandler(event.currentTarget, false)
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

                  <div
                    className="cursor-pointer"
                    onClick={() => onSelect?.(index)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        onSelect?.(index)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${slide.name}`}
                  >
                    {slide.imageUrl ? (
                      <Image
                        src={getProxiedImageUrl(slide.imageUrl)}
                        alt={slide.name}
                        width={768}
                        height={768}
                        sizes="(max-width: 640px) 192px, (max-width: 1536px) 256px, 352px"
                        className="h-full w-48 object-cover sm:w-64 2xl:w-[22rem] lazy-load-img"
                        loading="lazy"
                        onLoad={addLoadedClass}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-white">
                        <span className="text-xs text-gray-400">
                          Nenhuma imagem cadastrada
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {redirectSource && slide.slug && (
                  <Link
                    href={`/${redirectSource}/${slide.slug}`}
                    aria-label={slide.name}
                    className="absolute inset-0 z-10 pointer-events-none horizontal-slide-link"
                  />
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
