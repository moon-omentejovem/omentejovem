import { ArtworkService } from '@/services'
import { notFound } from 'next/navigation'
import ArtworkContent from './content'

interface ArtworkPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  // Generate static params for build-time optimization
  const { artworks } = await ArtworkService.getArtworks({ limit: 100 })

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
    title: `${artwork.title} - Portfolio - Mente Jovem`,
    description:
      artwork.description || `Artwork ${artwork.title} by Thales Machado`,
    openGraph: {
      title: artwork.title,
      description: artwork.description || '',
      images: artwork.image_url ? [artwork.image_url] : []
    }
  }
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  // Get all portfolio artworks and find selected one
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
