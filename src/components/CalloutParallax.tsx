'use client'

import { calloutAnimation } from '@/animations/client'
import { getProxiedImageUrl } from '@/lib/utils'
import { HomeImage } from '@/types/home'
import { LoadingSpinner } from '@/components/ui/Skeleton'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

interface CalloutParallaxProperties {
  title: string
  subtitle: string
  showTitle: boolean
  showSubtitle: boolean
  featuredLabel?: string
  featuredTitle?: string
  featuredHref?: string | null
  calloutImages: HomeImage[]
  backgroundImageUrl?: string | null
  backgroundVideoUrl?: string | null
}

function shiftElement(
  element: Element,
  index: number,
  rangeX: number,
  rangeY: number,
  isText: boolean
): void {
  const translationIntensity = 4
  const maxTranslation = translationIntensity * (index + 1)
  const currentTranslation = isText
    ? `${maxTranslation * rangeX}% ${maxTranslation * rangeY * 2}%`
    : `${(maxTranslation * rangeX) / 2}% ${(maxTranslation * rangeY) / 2}%`
  const scale = isText ? 1 : 1.1

  element.animate(
    {
      translate: currentTranslation,
      scale
    },
    { duration: 750, fill: 'forwards', easing: 'ease' }
  )
}

export function CalloutParallax({
  title,
  subtitle,
  showTitle,
  showSubtitle,
  featuredLabel,
  featuredTitle,
  featuredHref,
  calloutImages,
  backgroundImageUrl,
  backgroundVideoUrl
}: CalloutParallaxProperties) {
  const calloutReference = useRef<HTMLDivElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const imageObjects = useRef<(HTMLImageElement | null)[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const hasBackgroundVideo = !!backgroundVideoUrl
  const hasBackgroundImage = !hasBackgroundVideo && !!backgroundImageUrl

  if (calloutReference.current && !hasBackgroundVideo && !hasBackgroundImage) {
    calloutReference.current.onclick = () => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % calloutImages.length
      )
    }
  }

  const shiftBackground = useCallback((event: MouseEvent): void => {
    if (calloutReference.current) {
      const rect = calloutReference.current.getBoundingClientRect()
      const elements = calloutReference.current.querySelectorAll(
        'div#callout-element'
      )
      const radius = 1000

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const rangeX = (event.clientX - centerX) / radius
      const rangeY = (event.clientY - centerY) / radius

      for (const [index, element] of elements.entries()) {
        const isText = element.classList[0] === 'parallax-text'
        if (!isText) {
          continue
        }
        shiftElement(element, index, rangeX, rangeY, isText)
      }
    }
  }, [])

  useEffect(() => {
    calloutImages.forEach((image, index) => {
      const img = document.createElement('img')
      img.src = getProxiedImageUrl(image.imageUrl)
      img.onload = () => {
        imageObjects.current[index] = img
      }
    })

    calloutAnimation()

    window.addEventListener('mousemove', shiftBackground)

    return () => {
      window.removeEventListener('mousemove', shiftBackground)
    }
  }, [calloutImages, shiftBackground])

  useEffect(() => {
    setIsLoading(true)
  }, [currentImageIndex, calloutImages])

  return (
    <div
      className="grid w-full select-none place-items-center overflow-visible fixed inset-0 z-10 h-[100dvh] -translate-y-12 md:translate-y-0"
      id="logo"
      ref={calloutReference}
    >
      <div className="relative flex flex-col items-center w-full h-full select-none">
        {showTitle && (
          <div
            id="callout-element"
            className="parallax-text absolute -top-[17.5%] select-none"
          >
            <p className="font-heading text-[12vw] min-w-max text-secondary-50 invisible tracking-[-0.7vw] md:text-[6.5vw]">
              {title}
            </p>
          </div>
        )}

        {hasBackgroundVideo ? (
          <div
            id="callout-element"
            className="relative w-full h-full select-none"
          >
            <video
              src={getProxiedImageUrl(backgroundVideoUrl as string)}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <track kind="captions" />
            </video>
          </div>
        ) : hasBackgroundImage ? (
          <div
            id="callout-element"
            className="relative w-full h-full select-none"
          >
            <Image
              src={getProxiedImageUrl(backgroundImageUrl as string)}
              fill
              sizes="100vw"
              alt={'omentejovem'}
              className="object-cover invisible select-none"
              priority
              onLoadingComplete={() => setIsLoading(false)}
            />
            {isLoading ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-background">
                <LoadingSpinner size="md" className="text-primary-50 mb-1" />
                <p className="text-xs uppercase tracking-[0.2em] text-secondary-200">
                  Loading
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          calloutImages[currentImageIndex] && (
            <div
              id="callout-element"
              className="relative w-full h-full select-none"
            >
              <Image
                src={getProxiedImageUrl(calloutImages[currentImageIndex].imageUrl)}
                fill
                sizes="100vw"
                alt={'omentejovem'}
                className="object-cover invisible select-none"
                priority
                onLoadingComplete={() => setIsLoading(false)}
                onClick={() =>
                  setCurrentImageIndex(
                    currentImageIndex >= calloutImages.length - 1
                      ? 0
                      : currentImageIndex + 1
                  )
                }
              />
              {isLoading ? (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-background">
                  <LoadingSpinner size="md" className="text-primary-50 mb-1" />
                  <p className="text-xs uppercase tracking-[0.2em] text-secondary-200">
                    Loading
                  </p>
                </div>
              ) : null}
            </div>
          )
        )}
        {showSubtitle && (
          <div
            id="callout-element"
            className="parallax-text absolute inset-0 z-[2] flex items-center justify-center select-none pointer-events-none"
          >
            <p className="font-heading text-[12vw] text-primary-100 invisible tracking-[-0.4vw] md:text-[6.5vw] text-center">
              {subtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
