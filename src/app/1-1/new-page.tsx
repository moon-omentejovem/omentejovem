import {
  ArtworkWithSeries,
  processArtwork,
  ProcessedArtwork
} from '@/types/artwork'
import { createClient } from '@/utils/supabase/server'
import { OneOfOneContentProvider } from './provider'

async function getOneOfOneData() {
  const supabase = await createClient()

  const { data: artworks, error } = await supabase
    .from('artworks')
    .select(
      `
      *,
      series_artworks(
        *,
        series(*)
      )
    `
    )
    .eq('type', 'single')
    .eq('is_one_of_one', true)
    .order('posted_at', { ascending: false })

  if (error) {
    console.error('Error fetching 1/1 artworks:', error)
  }

  // Convert artworks to ProcessedArtwork format
  const processedArtworks: ProcessedArtwork[] = (
    (artworks as ArtworkWithSeries[]) || []
  ).map(processArtwork)

  return {
    artworks: processedArtworks,
    error
  }
}

export default async function OneOfOnePage() {
  const { artworks, error } = await getOneOfOneData()

  if (error) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Error Loading 1/1 Artworks
          </h1>
          <p className="text-neutral-400">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <OneOfOneContentProvider
      email="contact@omentejovem.com"
      artworks={artworks}
    />
  )
}
