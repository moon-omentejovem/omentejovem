import type { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/server'
import CollectionsContent from './content'
import { CollectionsResponse } from '@/api/resolver/types'

type Series = Database['public']['Tables']['series']['Row']
type SeriesArtwork = Database['public']['Tables']['series_artworks']['Row']
type Artwork = Database['public']['Tables']['artworks']['Row']

interface SeriesWithArtworks extends Series {
  series_artworks: (SeriesArtwork & {
    artworks: Artwork
  })[]
}

async function getSeriesData() {
  const supabase = await createClient()

  const { data: series, error } = await supabase
    .from('series')
    .select(`
      *,
      series_artworks(
        artworks(*)
      )
    `)
    .order('name')

  if (error) {
    console.error('Error fetching series:', error)
  }

  // Convert to CollectionsResponse format
  const collectionsData: CollectionsResponse = {
    collections: (series as SeriesWithArtworks[] || []).map((seriesItem) => ({
      name: seriesItem.name,
      year: seriesItem.created_at ? new Date(seriesItem.created_at).getFullYear().toString() : '',
      slug: seriesItem.slug,
      nftImageUrls: seriesItem.series_artworks?.map((sa) => sa.artworks.image_url || '') || []
    }))
  }

  return { collectionsData, error }
}

export default async function SeriesPage() {
  const { collectionsData, error } = await getSeriesData()

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Series</h1>
          <p className="text-neutral-400">{error.message}</p>
        </div>
      </div>
    )
  }

  return <CollectionsContent {...collectionsData} />
}
