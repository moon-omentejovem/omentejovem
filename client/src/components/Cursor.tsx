'use client'

import { gsap } from 'gsap'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cursorLoop, cursorClick } from '@/assets/cursor'
import Image from 'next/image'

export function Cursor(): ReactElement {
  const cursor = useRef<HTMLDivElement>(null)
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [imageSource, setImageSource] = useState(cursorLoop.src)

  const changeCursor = useCallback((event: MouseEvent): void => {
    setMouseX(event.clientX)
    setMouseY(event.clientY)
  }, [])

  const handleMouseClick = useCallback((event: MouseEvent): void => {
    gsap.to(cursor.current, {
      onStart: () => {
        setImageSource(cursorClick.src)
      },
      onComplete: () => {
        setImageSource(cursorLoop.src)
      }
    })
  }, [])

  useEffect(() => {
    gsap.set(cursor.current, { xPercent: -50, yPercent: -50 })

    gsap.to(cursor.current, {
      duration: 0.0016,
      css: {
        left: mouseX,
        top: mouseY
      }
    })

    window.addEventListener('mousemove', changeCursor)
    window.addEventListener('click', handleMouseClick)

    return () => {
      window.removeEventListener('mousemove', changeCursor)
      window.removeEventListener('click', handleMouseClick)
    }
  }, [changeCursor, handleMouseClick, mouseX, mouseY])

  return (
    <div
      ref={cursor}
      className="cursor pointer-events-none fixed z-[999] invisible lg:visible"
    >
      <Image
        width={32}
        height={32}
        alt={'Animated cursor'}
        src={imageSource}
        className="min-h-fit min-w-fit"
      />
    </div>
  )
}
