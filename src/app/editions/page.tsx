import type { Database } from '@/types/supabase'
import { createClient } from '@/utils/supabase/server'
import { EditionsContentProvider } from './provider'
import { ArtworkWithSeries, processArtwork, ProcessedArtwork } from '@/types/artwork'

async function getEditionsData() {
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
    .eq('type', 'edition')
    .order('posted_at', { ascending: false })

  if (error) {
    console.error('Error fetching edition artworks:', error)
  }

  // Convert artworks to ProcessedArtwork format
  const processedArtworks: ProcessedArtwork[] = (artworks as ArtworkWithSeries[] || []).map(processArtwork)

  return {
    artworks: processedArtworks,
    error
  }
}

export default async function EditionsPage() {
  const { artworks, error } = await getEditionsData()

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Editions</h1>
          <p className="text-neutral-400">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <EditionsContentProvider
      email="contact@omentejovem.com"
      artworks={artworks}
    />
  )
}
