'use client'

import { calloutAnimation } from '@/animations/client'
import { getProxiedImageUrl } from '@/lib/utils'
import { HomeImage } from '@/types/home'
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
  const scale = 1

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
  calloutImages
}: CalloutParallaxProperties) {
  const calloutReference = useRef<HTMLDivElement>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const imageObjects = useRef<(HTMLImageElement | null)[]>([])

  if (calloutReference.current) {
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

  return (
    <div
      className="grid w-full select-none place-items-center overflow-visible fixed top-[4rem] right-0 left-0 bottom-0 z-10 h-screen -translate-y-4 md:-translate-y-8"
      id="logo"
      ref={calloutReference}
    >
      <div className="relative flex flex-col items-center px-12 select-none">
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

        {calloutImages[currentImageIndex] && (
          <div
            id="callout-element"
            className="relative flex flex-col items-center select-none"
          >
            <Image
              src={getProxiedImageUrl(calloutImages[currentImageIndex].imageUrl)}
              width={800}
              height={900}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 600px"
              alt={'omentejovem'}
              className="md:h-[32rem] w-auto object-contain invisible 2xl:h-[600px] select-none"
              onClick={() =>
                setCurrentImageIndex(
                  currentImageIndex >= calloutImages.length - 1
                    ? 0
                    : currentImageIndex + 1
                )
              }
            />
          </div>
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
