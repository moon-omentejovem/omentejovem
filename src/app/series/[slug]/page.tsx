import { ArtworkService, SeriesService } from '@/services'
import { notFound } from 'next/navigation'
import SeriesContentWrapper from './content'

interface SeriesPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  // Generate static params for all series
  const slugs = await SeriesService.getSlugs()

  return slugs.map((slug) => ({
    slug
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SeriesPageProps) {
  const seriesMetadata = await SeriesService.getMetadataBySlug(params.slug)

  if (!seriesMetadata) {
    return {
      title: 'Series Not Found'
    }
  }

  return {
    title: `${seriesMetadata.name} - Mente Jovem`,
    description: `Explore the ${seriesMetadata.name} series artwork collection`,
    openGraph: {
      title: seriesMetadata.name,
      description: `Collection: ${seriesMetadata.name}`,
      images: seriesMetadata.cover_image_url
        ? [seriesMetadata.cover_image_url]
        : []
    }
  }
}

export default async function SeriesDetailPage({ params }: SeriesPageProps) {
  try {
    // Check if series exists using the service
    const seriesExists = await SeriesService.existsBySlug(params.slug)

    if (!seriesExists) {
      notFound()
    }

    // Get artworks for this series using the service
    const { artworks, error } = await ArtworkService.getBySeriesSlug(
      params.slug
    )

    if (error) {
      console.error('Error loading series artworks:', error)
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Error Loading Series</h1>
            <p className="text-neutral-400">
              Failed to load series data: {error}
            </p>
          </div>
        </div>
      )
    }

    return (
      <SeriesContentWrapper
        email="contact@omentejovem.com"
        slug={params.slug}
        initialArtworks={artworks}
      />
    )
  } catch (error) {
    console.error('Unexpected error in SeriesDetailPage:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
          <p className="text-neutral-400">An unexpected error occurred</p>
        </div>
      </div>
    )
  }
}
