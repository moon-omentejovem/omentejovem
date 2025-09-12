import ArtworkContent from '@/app/1-1/[slug]/content'
import { ArtworkWithSeries, processArtwork } from '@/types/artwork'
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'

interface ArtworkPageProps {
  params: {
    slug: string
  }
}

async function getPortfolioData() {
  const supabase = await createClient()

  const { data: artworks, error } = await supabase
    .from('artworks')
    .select(
      `
      *,
      series_artworks(
        series(name, slug)
      )
    `
    )
    .order('posted_at', { ascending: false })

  return {
    artworks: (artworks || []) as ArtworkWithSeries[],
    error
  }
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const { artworks, error } = await getPortfolioData()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Artwork</h1>
          <p className="text-neutral-400">{error.message}</p>
        </div>
      </div>
    )
  }

  // Find the selected artwork
  const selectedArtwork = artworks.find(
    (artwork) => artwork.slug === params.slug
  )

  if (!selectedArtwork) {
    notFound()
  }

  // Process artworks to frontend-friendly format
  const processedArtworks = artworks.map(processArtwork)

  // Find the index of the selected artwork
  const selectedIndex = processedArtworks.findIndex(
    (artwork) => artwork.slug === params.slug
  )

  return (
    <ArtworkContent
      email="contact@omentejovem.com"
      initialArtworks={processedArtworks}
      initialSelectedIndex={selectedIndex}
    />
  )
}
