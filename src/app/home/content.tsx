'use client'

import { CalloutParallax } from '@/components/CalloutParallax'
import type { HomeImage } from '@/types/home'
import { ReactElement } from 'react'

interface HomeContentProperties {
  initialImages: HomeImage[]
  title: string
  subtitle: string
}

export default function HomeContent({
  initialImages,
  title,
  subtitle
}: HomeContentProperties): ReactElement {
  return (
    <main className="flex flex-col">
      <CalloutParallax
        title={title}
        subtitle={subtitle}
        calloutImages={initialImages}
      />
    </main>
  )
}
