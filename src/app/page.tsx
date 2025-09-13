import { ArtworkService } from '@/services'
import type { HomeImage } from '@/types/home'
import { cookies } from 'next/headers'
import HomeContent from './home/content'
import NewsletterPage from './newsletter/page'

// Disable caching - fetch fresh data on every request
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  // Use new service architecture
  const { featuredArtworks, error } = await ArtworkService.getHomepageData()

  const images: HomeImage[] = featuredArtworks.map((artwork: any) => ({
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
    <div className="fixed sm:z-20 bg-background w-full h-full max-w-[1920px]">
      <NewsletterPage />
      {content}
    </div>
  )
}
