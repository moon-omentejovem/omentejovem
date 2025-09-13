import { getOneOfOneData } from '@/lib/server-data'
import OneOfOneContent from './content'

export default async function OneOfOnePage() {
  // Fetch data on server - no hooks needed
  const data = await getOneOfOneData()

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Error Loading 1/1 Artworks
          </h1>
          <p className="text-neutral-400">{data.error}</p>
        </div>
      </div>
    )
  }

  return <OneOfOneContent artworks={data.artworks} />
}
