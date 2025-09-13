import { getEditionsData } from '@/lib/server-data'
import EditionsContent from './content'

export default async function EditionsPage() {
  // Server-side data fetching with simplified structure
  const data = await getEditionsData()

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Editions</h1>
          <p className="text-neutral-400">{data.error}</p>
        </div>
      </div>
    )
  }

  return <EditionsContent artworks={data.artworks} />
}
