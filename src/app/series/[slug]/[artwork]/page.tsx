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

  try {
    // Get all artworks from the series to maintain consistency with other pages
    const { data: seriesArtworks, error: seriesError } = await supabase
      .from('artworks')
      .select(
        `
        *,
        series_artworks!inner(
          series!inner(
            slug,
            name
          )
        )
      `
      )
      .eq('series_artworks.series.slug', seriesSlug)
      .order('mint_date', { ascending: false })

    if (seriesError) {
      console.error('Series query error:', seriesError)
      return { artworks: [], selectedIndex: -1, error: seriesError }
    }

    if (!seriesArtworks || seriesArtworks.length === 0) {
      console.log('No artworks found for series:', seriesSlug)
      return {
        artworks: [],
        selectedIndex: -1,
        error: new Error('Series not found')
      }
    }

    // Process artworks data
    const processedArtworks = seriesArtworks.map((artwork: any) => {
      try {
        return processArtwork(artwork as ArtworkWithSeries)
      } catch (processError) {
        console.error('Error processing artwork:', artwork.id, processError)
        throw processError
      }
    })

    // Find the selected artwork index
    const selectedIndex = processedArtworks.findIndex(
      (artwork) => artwork.slug === artworkSlug
    )

    if (selectedIndex === -1) {
      console.log('Artwork not found:', artworkSlug, 'in series:', seriesSlug)
      console.log(
        'Available slugs:',
        processedArtworks.map((a) => a.slug)
      )
      return {
        artworks: [],
        selectedIndex: -1,
        error: new Error('Artwork not found')
      }
    }

    return {
      artworks: processedArtworks,
      selectedIndex,
      error: null
    }
  } catch (error) {
    console.error('Error in getArtworkData:', error)
    return {
      artworks: [],
      selectedIndex: -1,
      error: error instanceof Error ? error : new Error('Unknown error')
    }
  }
}

export async function generateStaticParams() {
  return []
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
      images: artwork.image.url ? [artwork.image.url] : []
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
