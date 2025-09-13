import { ArtworkService } from '@/services'
import PortfolioContent from './content'

interface PortfolioPageProps {
  searchParams: {
    type?: 'single' | 'edition'
    series?: string
    featured?: 'true'
    one_of_one?: 'true'
  }
}

export default async function PortfolioPage({
  searchParams
}: PortfolioPageProps) {
  // Use new service architecture with proper filtering
  const filters = {
    type: searchParams.type,
    seriesSlug: searchParams.series,
    featured: searchParams.featured === 'true',
    oneOfOne: searchParams.one_of_one === 'true'
  }

  const { artworks, error } = await ArtworkService.getPortfolio(filters)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Portfolio</h1>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <PortfolioContent
      email="contact@omentejovem.com"
      initialArtworks={artworks}
      searchParams={searchParams}
    />
  )
}
