import { ArtworkWithSeries, processArtwork } from '@/types/artwork'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import SeriesContentWrapper from './content'

interface SeriesPageProps {
  params: {
    slug: string
  }
}

async function getSeriesData(slug: string) {
  const supabase = await createClient()

  // Get the series to validate it exists
  const { data: series, error: seriesError } = await supabase
    .from('series')
    .select('*')
    .eq('slug', slug)
    .single()

  if (seriesError || !series) {
    return { series: null, artworks: [], error: seriesError }
  }

  // Get all artworks from the series
  const { data: seriesArtworks, error: artworksError } = await supabase
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
    .eq('series_artworks.series.slug', slug)
    .order('mint_date', { ascending: false })

  if (artworksError) {
    console.error('Series artworks query error:', artworksError)
    return { series, artworks: [], error: artworksError }
  }

  // Process artworks data
  const processedArtworks = (seriesArtworks || []).map((artwork: any) =>
    processArtwork(artwork as ArtworkWithSeries)
  )

  return {
    series,
    artworks: processedArtworks,
    error: null
  }
}

// Generate static params - return empty to enable ISR
export async function generateStaticParams() {
  return []
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SeriesPageProps) {
  const { series } = await getSeriesData(params.slug)

  if (!series) {
    return {
      title: 'Series Not Found'
    }
  }

  return {
    title: `${series.name} - Mente Jovem`,
    description: `Explore the ${series.name} series artwork collection`
  }
}

export default async function SeriesDetailPage({ params }: SeriesPageProps) {
  const { series, artworks, error } = await getSeriesData(params.slug)

  if (!series) {
    notFound()
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Series</h1>
          <p className="text-neutral-400">Failed to load series data</p>
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
}
