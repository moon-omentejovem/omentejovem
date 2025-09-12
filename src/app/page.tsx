import { getArtworksServer } from '@/lib/server-queries'
import type { HomeImage } from '@/types/home'
import HomeContent from './home/content'
import { cookies } from 'next/headers'
import NewsletterPage from './newsletter/page'

// Disable caching - fetch fresh data on every request
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const artworks = await getArtworksServer({ limit: 10 })
  const images: HomeImage[] = artworks.map((artwork) => ({
    title: artwork.title || '',
    imageUrl: artwork.image_url || '',
    createdAt: artwork.posted_at || ''
  }))

  const closeNewsletter = cookies().get('newsletter_dismissed')

  const content = (
    <HomeContent
      initialImages={images}
      title="Thales Machado"
      subtitle="omentejovem"
    />
  )

  if (closeNewsletter) {
    return content
  }

  return (
    <div className="fixed sm:z-50 bg-background w-full h-full max-w-[1920px]">
      <NewsletterPage />
      {content}
    </div>
  )
}
