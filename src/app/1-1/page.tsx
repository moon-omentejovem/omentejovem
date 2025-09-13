import { ArtworkService } from '@/services'
import OneOfOneContent from './content'

export default async function OneOfOnePage() {
  // Use new service architecture
  const { artworks, error } = await ArtworkService.getOneOfOne()

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Error Loading 1/1 Artworks
          </h1>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <OneOfOneContent
      email="contact@omentejovem.com"
      initialArtworks={artworks}
    />
  )
}
