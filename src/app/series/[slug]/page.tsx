import { getSeriesPageData } from '@/lib/server-data'
import { SeriesService } from '@/services'
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
      images: seriesMetadata.imageurl ? [seriesMetadata.imageurl] : []
    }
  }
}

export default async function SeriesDetailPage({ params }: SeriesPageProps) {
  try {
    // Get series data using simplified server function
    const data = await getSeriesPageData(params.slug)

    if (data.error) {
      console.error('Error loading series:', data.error)
      if (data.error.includes('not found')) {
        notFound()
      }

      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Error Loading Series</h1>
            <p className="text-neutral-400">{data.error}</p>
          </div>
        </div>
      )
    }

    return (
      <SeriesContentWrapper
        artworks={data.artworks}
        initialSelectedIndex={data.selectedIndex}
        seriesInfo={data.seriesInfo}
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
