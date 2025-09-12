import ArtworkContent from '@/app/1-1/[slug]/content'
import { ArtworkService } from '@/services'
import { notFound } from 'next/navigation'

interface ArtworkPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  // Generate static params for edition artworks
  const { artworks } = await ArtworkService.getEditions({ limit: 50, useBuildClient: true })
  
  return artworks.map((artwork: any) => ({
    slug: artwork.slug
  }))
}

export async function generateMetadata({ params }: ArtworkPageProps) {
  const artwork = await ArtworkService.getBySlug(params.slug)
  
  if (!artwork) {
    return {
      title: 'Artwork Not Found'
    }
  }

  return {
    title: `${artwork.title} - Editions - Mente Jovem`,
    description: artwork.description || `Edition artwork ${artwork.title} by Thales Machado`,
    openGraph: {
      title: artwork.title,
      description: artwork.description || '',
      images: artwork.image.url ? [artwork.image.url] : []
    }
  }
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  // Get all portfolio artworks for navigation
  const { artworks, error } = await ArtworkService.getPortfolio()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Artwork</h1>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    )
  }

  // Find the index of the selected artwork
  const selectedIndex = artworks.findIndex(
    (artwork: any) => artwork.slug === params.slug
  )

  if (selectedIndex === -1) {
    notFound()
  }

  return (
    <ArtworkContent
      email="contact@omentejovem.com"
      initialArtworks={artworks}
      initialSelectedIndex={selectedIndex}
    />
  )
}
