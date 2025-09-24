import { ArtworkService } from '@/services'
import { getImageUrlFromSlugCompat } from '@/utils/storage'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HomeContent from './home/content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  // Use published artworks only for public homepage
  const { artworks: featuredArtworks } =
    await ArtworkService.getPublishedFeatured()

  const images = featuredArtworks.map((artwork: any) => ({
    title: artwork.title || '',
    imageUrl: artwork.slug
      ? getImageUrlFromSlugCompat(artwork.slug, 'artworks', 'optimized')
      : '',
    createdAt: artwork.posted_at || ''
  }))

  const closeNewsletter = cookies().get('newsletter_dismissed')

  if (!closeNewsletter) {
    return redirect('/newsletter')
  }

  return (
    <div className="fixed sm:z-20 bg-background w-full h-full max-w-[1920px]">
      <HomeContent
        initialImages={images}
        title="Thales Machado"
        subtitle="omentejovem"
      />
    </div>
  )
}
