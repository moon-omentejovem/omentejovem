import { ArtworkService } from '@/services'
import EditionsContent from './content'

export default async function EditionsPage() {
  // Use new service architecture
  const { artworks, error } = await ArtworkService.getEditions()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Editions</h1>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <EditionsContent
      email="contact@omentejovem.com"
      initialArtworks={artworks}
    />
  )
}
