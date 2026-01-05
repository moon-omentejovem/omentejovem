'use client'

import { CalloutParallax } from '@/components/CalloutParallax'
import type { HomeImage } from '@/types/home'
import { ReactElement, useEffect } from 'react'

interface HomeContentProperties {
  initialImages: HomeImage[]
  title: string
  subtitle: string
  showTitle: boolean
  showSubtitle: boolean
  featuredLabel?: string
  featuredTitle?: string
  featuredHref?: string | null
  headerLogoColor?: string
  backgroundColor?: string
  backgroundImageUrl?: string | null
  backgroundVideoUrl?: string | null
}

export default function HomeContent({
  initialImages,
  title,
  subtitle,
  showTitle,
  showSubtitle,
  featuredLabel,
  featuredTitle,
  featuredHref,
  headerLogoColor,
  backgroundColor,
  backgroundImageUrl,
  backgroundVideoUrl
}: HomeContentProperties): ReactElement {
  useEffect(() => {
    if (headerLogoColor && headerLogoColor.trim() !== '') {
      document.documentElement.style.setProperty(
        '--header-logo-color',
        headerLogoColor.trim()
      )
    }
  }, [headerLogoColor])

  useEffect(() => {
    if (!backgroundColor || backgroundColor.trim() === '') {
      return
    }

    const trimmed = backgroundColor.trim()
    const previous = document.body.style.backgroundColor

    document.body.style.backgroundColor = trimmed

    return () => {
      document.body.style.backgroundColor = previous
    }
  }, [backgroundColor])

  return (
    <main className="flex flex-col">
      <CalloutParallax
        title={title}
        subtitle={subtitle}
        showTitle={showTitle}
        showSubtitle={showSubtitle}
        featuredLabel={featuredLabel}
        featuredTitle={featuredTitle}
        featuredHref={featuredHref}
        calloutImages={initialImages}
        backgroundImageUrl={backgroundImageUrl}
        backgroundVideoUrl={backgroundVideoUrl}
      />

      {featuredTitle && (
        <div className="fixed bottom-24 md:bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 md:gap-2 w-full px-4">
          <span className="text-orange-500 font-body font-bold text-[16px] leading-[120%] tracking-[0] uppercase text-center">
            {featuredLabel || 'Featured collection'}
          </span>
          {featuredHref ? (
            <a
              href={featuredHref}
              className="group flex items-end justify-center gap-2 md:gap-4 text-white/70 hover:text-white transition-colors whitespace-nowrap"
            >
              <span className="font-body font-normal text-[24px] leading-[120%] tracking-[0] align-bottom">
                {featuredTitle}
              </span>
              <span className="text-white/70 text-[24px] group-hover:text-white transition-transform group-hover:translate-x-1 align-bottom">
                &#8594;
              </span>
            </a>
          ) : (
            <span className="text-white/70 font-body font-normal text-[24px] leading-[120%] tracking-[0] text-center whitespace-nowrap">
              {featuredTitle}
            </span>
          )}
        </div>
      )}
    </main>
  )
}
