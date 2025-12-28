'use client'

import { gsap } from 'gsap'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef } from 'react'

export function Cursor(): ReactElement {
  const cursor = useRef<HTMLDivElement>(null)
  const core = useRef<HTMLDivElement>(null)
  const ripple = useRef<HTMLDivElement>(null)

  const handleMouseClick = useCallback((): void => {
    if (!core.current || !ripple.current) return

    gsap.killTweensOf([core.current, ripple.current])

    gsap.fromTo(
      core.current,
      { scale: 1 },
      { scale: 0.75, duration: 0.08, ease: 'power2.out', yoyo: true, repeat: 1 }
    )

    gsap.set(ripple.current, { opacity: 0.65, scale: 0.2 })
    gsap.to(ripple.current, {
      opacity: 0,
      scale: 3.2,
      duration: 0.55,
      ease: 'power2.out'
    })
  }, [])

  useEffect(() => {
    if (!cursor.current) return

    gsap.set(cursor.current, { xPercent: -50, yPercent: -50 })

    const moveX = gsap.quickTo(cursor.current, 'left', {
      duration: 0.16,
      ease: 'power3.out'
    })
    const moveY = gsap.quickTo(cursor.current, 'top', {
      duration: 0.16,
      ease: 'power3.out'
    })

    const changeCursor = (event: MouseEvent): void => {
      moveX(event.clientX)
      moveY(event.clientY)
    }

    window.addEventListener('mousemove', changeCursor, { passive: true })
    window.addEventListener('click', handleMouseClick)

    return () => {
      window.removeEventListener('mousemove', changeCursor)
      window.removeEventListener('click', handleMouseClick)
    }
  }, [handleMouseClick])

  return (
    <div
      ref={cursor}
      className="custom-cursor pointer-events-none fixed z-[999] invisible lg:visible"
    >
      <div className="custom-cursor__pulse" />
      <div ref={ripple} className="custom-cursor__ripple" />
      <div ref={core} className="custom-cursor__core" />
    </div>
  )
}
