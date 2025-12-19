'use client'

import Image from 'next/image'
import type { ReactElement } from 'react'

import { aboutAnimations } from '@/animations/client'
import { AboutArt } from '@/assets/images'
import { Footer, FooterProperties } from '@/components/Footer'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { BioRenderer } from './bio-renderer'
import './style.css'

function extractSlugFromHref(href: string): string | null {
  const artworkPatterns = [
    /\/1-1\/([^/?#]+)/,
    /\/editions\/([^/?#]+)/,
    /\/portfolio\/([^/?#]+)/,
    /\/series\/[^/]+\/([^/?#]+)/
  ]

  for (const pattern of artworkPatterns) {
    const match = href.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

async function fetchArtworkImage(slug: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/artworks/${slug}/image`)
    if (!response.ok) return null
    const data = await response.json()
    return data.imageUrl || null
  } catch {
    return null
  }
}

interface AboutPageData {
  id: string
  content: any
  socials: Array<{
    platform: string
    handle: string
    url: string
  }>
  exhibitions: Array<{
    title: string
    venue: string
    location: string
    year: string
    type: 'solo' | 'group' | 'online'
    description?: string
  }>
  press: Array<{
    title: string
    publication: string
    date: string
    url?: string
    type: 'feature' | 'interview' | 'review' | 'news'
  }>
  created_at: string | null
  updated_at: string | null
}

interface AboutContentProperties {
  aboutPageData?: AboutPageData | null
}

export function AboutContent({
  aboutPageData
}: AboutContentProperties): ReactElement {
  const pageRef = useRef<HTMLElement>(null)
  const overlayRef = useRef<HTMLImageElement | null>(null)
  const imageCacheRef = useRef<Record<string, string | null>>({})

  useEffect(() => {
    aboutAnimations()
  }, [])

  // Setup artwork preview overlay
  useEffect(() => {
    const overlay = document.createElement('img')
    overlay.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      max-width: 400px;
      max-height: 400px;
      object-fit: contain;
      opacity: 0;
      visibility: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      transition: opacity 0.2s ease-out;
    `
    document.body.appendChild(overlay)
    overlayRef.current = overlay

    return () => {
      overlay.remove()
    }
  }, [])

  // Setup link hover handlers
  useEffect(() => {
    if (!pageRef.current) return

    const links = pageRef.current.querySelectorAll('a')
    const cleanupFunctions: (() => void)[] = []
    let currentHoveredSlug: string | null = null
    let isLoading = false

    links.forEach((link) => {
      const href = link.getAttribute('href')
      if (!href) return

      const slug = extractSlugFromHref(href)
      if (!slug) return

      const showOverlay = (imageUrl: string) => {
        if (!overlayRef.current || currentHoveredSlug !== slug) return
        overlayRef.current.src = imageUrl
        overlayRef.current.style.visibility = 'visible'
        overlayRef.current.style.opacity = '1'
      }

      const hideOverlay = () => {
        if (!overlayRef.current) return
        overlayRef.current.style.opacity = '0'
        overlayRef.current.style.visibility = 'hidden'
      }

      const handleMouseEnter = async () => {
        currentHoveredSlug = slug

        const cachedUrl = imageCacheRef.current[slug]
        if (cachedUrl) {
          showOverlay(cachedUrl)
          return
        }

        if (cachedUrl === null) return

        isLoading = true
        const imageUrl = await fetchArtworkImage(slug)
        imageCacheRef.current[slug] = imageUrl
        isLoading = false

        if (imageUrl && currentHoveredSlug === slug) {
          showOverlay(imageUrl)
        }
      }

      const handleMouseLeave = () => {
        currentHoveredSlug = null
        hideOverlay()
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!overlayRef.current) return

        const offsetX = 20
        const offsetY = 20

        let x = e.clientX + offsetX
        let y = e.clientY + offsetY

        if (x + 400 > window.innerWidth) {
          x = e.clientX - 400 - offsetX
        }
        if (y + 400 > window.innerHeight) {
          y = e.clientY - 400 - offsetY
        }

        overlayRef.current.style.left = `${x}px`
        overlayRef.current.style.top = `${y}px`
      }

      link.addEventListener('mouseenter', handleMouseEnter)
      link.addEventListener('mouseleave', handleMouseLeave)
      link.addEventListener('mousemove', handleMouseMove)

      cleanupFunctions.push(() => {
        link.removeEventListener('mouseenter', handleMouseEnter)
        link.removeEventListener('mouseleave', handleMouseLeave)
        link.removeEventListener('mousemove', handleMouseMove)
      })
    })

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [aboutPageData])

  const parsedPress = useMemo<FooterProperties['interviews']>(
    () =>
      (aboutPageData?.press || []).map((press) => ({
        interviewName: press.title,
        interviewUrl: press.url || '#'
      })),
    [aboutPageData?.press]
  )

  const parsedExhibitions = useMemo<FooterProperties['exhibitions']>(
    () =>
      (aboutPageData?.exhibitions || []).map((exhibition) => ({
        exhibitionName: exhibition.title,
        exhibitionUrl: '#'
      })),
    [aboutPageData?.exhibitions]
  )

  // Removido: renderAboutInfo e uso de data

  useEffect(() => {
    const anchorElements = document.getElementsByTagName(
      'a'
    ) as HTMLCollectionOf<HTMLAnchorElement>
    const parsedElements = [...anchorElements]

    const filtered = parsedElements.filter(
      (element) => element.className === '' || element.id === 'image-reference' || element.classList.contains('bio-link')
    )

    for (const element of filtered) {
      element.id = `image-reference-${element.innerText}`
      if (!element.classList.contains('bio-link')) {
        element.classList.add('bio-link')
      }
      element.setAttribute('target', '_blank')

      // Use data-preview-image attribute if available, otherwise skip preview
      const previewImageUrl = element.getAttribute('data-preview-image')
      if (!previewImageUrl) {
        continue // Skip links without preview image
      }

      const overlayImage = document.createElement('img')
      overlayImage.classList.add('overlay-image')
      overlayImage.src = previewImageUrl
      overlayImage.alt = ''
      overlayImage.style.minWidth = '500px'
      overlayImage.style.maxWidth = '500px'
      overlayImage.style.position = 'absolute'

      document.getElementById('about-page')?.appendChild(overlayImage)

      element.addEventListener('mouseover', () => {
        overlayImage.style.display = 'block'
      })

      element.addEventListener('mouseout', () => {
        overlayImage.style.display = 'none'
      })

      element.addEventListener('mousemove', (event) => {
        const parentRect = document
          .getElementById('about-page')
          ?.getBoundingClientRect()

        if (parentRect) {
          const headerHeight = 104

          const x = event.clientX - parentRect.left - overlayImage.width / 2
          const y =
            event.clientY -
            parentRect.top +
            headerHeight -
            overlayImage.height / 2
          overlayImage.style.transform = `translate(${x}px, ${y}px)`
        }
      })
    }
  }, [])

  return (
    <main
      ref={pageRef}
      id="about-page"
      className="flex flex-col px-6 pt-12 font-heading xl:px-20 xl:pt-16"
    >
      <h1
        id="about-title"
        className="mb-1 text-[7vw] leading-none overflow-hidden xl:mb-8"
      >
        <span className="block invisible">THALES MACHADO</span>
        <span className="block invisible">
          {'’omentejovem‘'}
          <p
            id="about-spans"
            className="inline font-heading text-[7vw] invisible xl:hidden"
          >
            ↘
          </p>
        </span>
      </h1>

      <div className="mb-14 flex flex-row justify-end gap-2 overflow-hidden xl:gap-12 xl:mb-40">
        <h2
          id="about-subtitle"
          className="block text-xs min-w-[10rem] text-secondary-100 invisible sm:text-base xl:text-lg"
        >
          <span id="about-subtitle">
            &quot;Late Night Love&quot; is an artwork created by him in late
            2021, in which he strongly identified with the moon and decided to
            make it part of his identity.
          </span>
        </h2>

        <p
          id="about-spans"
          className="hidden -mt-[30px] font-heading text-9xl invisible xl:block"
        >
          ↘
        </p>

        <div className="flex">
          <Image
            id="about-spans"
            src={AboutArt}
            alt={'omentejovem'}
            layout="responsive"
            objectFit="contain"
            className="flex w-full h-auto invisible"
          />
        </div>
      </div>

      <hr className="bg-secondary-100" />

      <section className="relative flex flex-col justify-between px-4 py-10 gap-8 overflow-hidden xl:flex-row xl:px-20 xl:py-32 xl:gap-24">
        <div className="flex flex-col sm:flex-row gap-6 xl:gap-24">
          <p className="bio font-heading text-xs min-w-[4.5rem] text-secondary-100 sm:text-base sm:min-w-[6rem] xl:text-lg xl:min-w-[7rem]">
            Bio
          </p>
          {aboutPageData?.content ? (
            <BioRenderer content={aboutPageData.content} />
          ) : (
            <div className="text-gray-500 italic">
              Bio content not available. Please add content through the admin
              panel.
            </div>
          )}
        </div>

        <div className="flex flex-row gap-6 w-full max-w-sm xl:gap-24">
          <p className="socials font-heading text-xs min-w-[4.5rem] text-secondary-100 sm:text-base sm:min-w-[6rem] xl:text-lg xl:min-w-[7rem]">
            Socials
          </p>
          <div className="flex flex-col gap-2">
            {aboutPageData?.socials && aboutPageData.socials.length > 0 ? (
              aboutPageData.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary-100 hover:text-orange-400 transition-colors text-sm"
                >
                  {social.platform}: {social.handle}
                </a>
              ))
            ) : (
              <span className="text-gray-500 text-sm">
                No social media profiles added yet.
              </span>
            )}
          </div>
        </div>
      </section>

      <hr className="bg-secondary-100" />

      <Footer interviews={parsedPress} exhibitions={parsedExhibitions} />
    </main>
  )
}
