import type { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/server'
import { PortfolioContentProvider } from './provider'
import { ArtworkWithSeries, processArtwork } from '@/types/artwork'

type Artwork = Database['public']['Tables']['artworks']['Row']
type Series = Database['public']['Tables']['series']['Row']
type SeriesArtwork = Database['public']['Tables']['series_artworks']['Row']

interface PortfolioPageProps {
  searchParams: {
    type?: 'single' | 'edition'
    series?: string
    featured?: 'true'
    one_of_one?: 'true'
  }
}

async function getPortfolioData(filters: PortfolioPageProps['searchParams']) {
  const supabase = await createClient()

  let query = supabase
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

  // Apply filters
  if (filters.type) {
    query = query.eq('type', filters.type)
  }

  if (filters.featured === 'true') {
    query = query.eq('is_featured', true)
  }

  if (filters.one_of_one === 'true') {
    query = query.eq('is_one_of_one', true)
  }

  if (filters.series) {
    // Filter by series slug - this requires a more complex query
    const { data: seriesData } = await supabase
      .from('series')
      .select('id')
      .eq('slug', filters.series)
      .single()

    if (seriesData) {
      const { data: seriesArtworks } = await supabase
        .from('series_artworks')
        .select('artwork_id')
        .eq('series_id', (seriesData as any).id)

      const artworkIds =
        (seriesArtworks as any[])?.map((sa) => sa.artwork_id) || []
      if (artworkIds.length > 0) {
        query = query.in('id', artworkIds)
      }
    }
  }

  const { data: artworks, error } = await query

  return {
    artworks: (artworks || []) as ArtworkWithSeries[],
    error
  }
}

export default async function PortfolioPage({
  searchParams
}: PortfolioPageProps) {
  const { artworks, error } = await getPortfolioData(searchParams)

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Portfolio</h1>
          <p className="text-neutral-400">{error.message}</p>
        </div>
      </div>
    )
  }

  // Process artworks to frontend-friendly format
  const processedArtworks = artworks.map(processArtwork)

  return (
    <PortfolioContentProvider
      email="contact@omentejovem.com"
      artworks={processedArtworks}
    />
  )
}
