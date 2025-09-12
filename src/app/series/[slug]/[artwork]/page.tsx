import { processArtwork, type ArtworkWithSeries } from '@/types/artwork'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import ArtworkContent from './content'

interface ArtworkPageProps {
  params: {
    slug: string
    artwork: string
  }
}

async function getArtworkData(seriesSlug: string, artworkSlug: string) {
  const supabase = await createClient()

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

  if (seriesError || !seriesArtworks || seriesArtworks.length === 0) {
    return { artworks: [], selectedIndex: -1, error: seriesError }
  }

  // Process artworks data
  const processedArtworks = seriesArtworks.map((artwork: any) =>
    processArtwork(artwork as ArtworkWithSeries)
  )

  // Find the selected artwork index
  const selectedIndex = processedArtworks.findIndex(
    (artwork) => artwork.slug === artworkSlug
  )

  if (selectedIndex === -1) {
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
}

export async function generateStaticParams() {
  // Return empty array to let Next.js generate pages on-demand
  return []
}

export async function generateMetadata({ params }: ArtworkPageProps) {
  const { artworks, selectedIndex } = await getArtworkData(
    params.slug,
    params.artwork
  )

  if (selectedIndex === -1 || !artworks[selectedIndex]) {
    return {
      title: 'Artwork Not Found'
    }
  }

  const artwork = artworks[selectedIndex]
  const seriesName = artwork.series?.[0]?.name || 'Series'

  return {
    title: `${artwork.title} - ${seriesName} - Mente Jovem`,
    description:
      artwork.description ||
      `Artwork ${artwork.title} from the ${seriesName} series`
  }
}

export default async function ArtworkDetailPage({ params }: ArtworkPageProps) {
  const { artworks, selectedIndex, error } = await getArtworkData(
    params.slug,
    params.artwork
  )

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
