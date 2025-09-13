import { ArtworkService, SeriesService } from '@/services'
import { notFound } from 'next/navigation'
import ArtworkContent from './content'

interface ArtworkPageProps {
  params: {
    slug: string
    artwork: string
  }
}

export async function generateStaticParams() {
  // Get all series
  const { series } = await SeriesService.getSeries()

  const params = []

  // For each series, get its artworks and generate params
  for (const seriesItem of series) {
    const { artworks } = await ArtworkService.getArtworks({
      seriesSlug: seriesItem.slug,
      limit: 100
    })

    for (const artwork of artworks) {
      params.push({
        slug: seriesItem.slug,
        artwork: artwork.slug
      })
    }
  }

  return params
}

export async function generateMetadata({ params }: ArtworkPageProps) {
  const [seriesMetadata, artwork] = await Promise.all([
    SeriesService.getMetadataBySlug(params.slug),
    ArtworkService.getBySlug(params.artwork)
  ])

  if (!artwork || !seriesMetadata) {
    return {
      title: 'Artwork Not Found'
    }
  }

  return {
    title: `${artwork.title} - ${seriesMetadata.name} - Mente Jovem`,
    description:
      artwork.description ||
      `Artwork ${artwork.title} from the ${seriesMetadata.name} series`,
    openGraph: {
      title: artwork.title,
      description: artwork.description || '',
      images: artwork.image_url ? [artwork.image_url] : []
    }
  }
}

export default async function ArtworkDetailPage({ params }: ArtworkPageProps) {
  // Check if series exists
  const seriesExists = await SeriesService.existsBySlug(params.slug)

  if (!seriesExists) {
    notFound()
  }

  // Get artworks for this series and find the selected artwork index
  const { artworks, selectedIndex, error } =
    await ArtworkService.getForSeriesPage(params.slug, params.artwork)

  if (selectedIndex === -1 || artworks.length === 0) {
    notFound()
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Artwork</h1>
          <p className="text-neutral-400">Failed to load artwork data</p>
        </div>
      </div>
    )
  }

  return (
    <ArtworkContent
      email="contact@omentejovem.com"
      initialArtworks={artworks}
      initialSelectedIndex={selectedIndex}
      seriesSlug={params.slug}
    />
  )
}
