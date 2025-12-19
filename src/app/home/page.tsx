import { ArtworkService } from '@/services'
import HomeContent from './content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  // Fetch published featured artworks for the homepage
  const { artworks: featuredArtworks } =
    await ArtworkService.getPublishedFeatured()

  const images = featuredArtworks.map((artwork: any) => ({
    title: artwork.title || '',
    imageUrl: artwork.imageurl,
    createdAt: artwork.posted_at || artwork.created_at || ''
  }))

  return (
    <div className="fixed sm:z-20 bg-background w-full h-full">
      <HomeContent
        initialImages={images}
        title="Thales Machado"
        subtitle="omentejovem"
      />
    </div>
  )
}
