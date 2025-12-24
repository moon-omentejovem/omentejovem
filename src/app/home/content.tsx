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
  backgroundColor
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
      />

      {featuredTitle && (
        <div className="fixed bottom-20 md:bottom-24 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <span className="text-orange-500 text-[16px] font-bold uppercase">
            {featuredLabel || 'Featured collection'}
          </span>
          {featuredHref ? (
            <a
              href={featuredHref}
              className="group flex items-end gap-4 text-secondary-100 text-[24px] hover:text-primary-50 transition-colors"
            >
              <span className="font-normal leading-[1.2] tracking-normal">
                {featuredTitle}
              </span>
              <span className="text-secondary-100/80 text-[24px] group-hover:text-primary-50">
                &#8594;
              </span>
            </a>
          ) : (
            <span className="text-secondary-100 text-[24px]">
              {featuredTitle}
            </span>
          )}
        </div>
      )}
    </main>
  )
}
