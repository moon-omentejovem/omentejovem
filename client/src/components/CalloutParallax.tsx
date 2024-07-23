'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import { HomeImage } from '@/types/home'
import { calloutAnimation } from '@/animations'

interface CalloutParallaxProperties {
  title: string
  subtitle: string
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
      img.src = image.imageUrl
      img.onload = () => {
        imageObjects.current[index] = img
      }
    })

    calloutAnimation()

    window.addEventListener('mousemove', shiftBackground)

    return () => {
      window.removeEventListener('mousemove', shiftBackground)
    }
  }, [])

  return (
    <div
      className="relative grid h-screenMinusHeader w-full select-none place-items-center overflow-hidden"
      id="logo"
      ref={calloutReference}
    >
      <div className="relative flex flex-col items-center px-12">
        <div
          id="callout-element"
          className="parallax-text absolute -top-[17.5%]"
        >
          <p className="font-heading text-[12vw] min-w-max text-secondary-50 invisible tracking-[-0.7vw] md:text-[6.5vw]">
            {title}
          </p>
        </div>

        <div
          id="callout-element"
          className="parallax-text absolute -top-[10%] z-[2]"
        >
          <p className="font-heading text-[12vw] text-primary-100 invisible tracking-[-0.4vw] md:text-[6.5vw]">
            {subtitle}
          </p>
        </div>

        {calloutImages[currentImageIndex] && (
          <div id="callout-element" className="flex flex-col items-center">
            <Image
              src={calloutImages[currentImageIndex].imageUrl}
              width={0}
              height={0}
              alt={'omentejovem'}
              className="w-auto max-h-96 invisible 2xl:max-h-[600px]"
              onClick={() =>
                setCurrentImageIndex(
                  currentImageIndex >= calloutImages.length - 1
                    ? 0
                    : currentImageIndex + 1
                )
              }
            />
            <p className="text-sm text-secondary-100 self-start invisible">
              {new Date(
                calloutImages[currentImageIndex].createdAt
              ).getFullYear()}
              , {calloutImages[currentImageIndex].title}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
