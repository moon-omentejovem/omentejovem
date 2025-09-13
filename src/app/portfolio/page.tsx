import { getPortfolioData } from '@/lib/server-data'
import PortfolioContent from './content'

interface PortfolioPageProps {
  searchParams: {
    type?: 'single' | 'edition'
    series?: string
    featured?: 'true'
    slug?: string
  }
}

export default async function PortfolioPage({
  searchParams
}: PortfolioPageProps) {
  // Server-side data fetching with simplified structure
  const data = await getPortfolioData(searchParams)

  if (data.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Portfolio</h1>
          <p className="text-neutral-400">{data.error}</p>
        </div>
      </div>
    )
  }

  return (
    <PortfolioContent
      artworks={data.artworks}
      initialSelectedIndex={data.selectedIndex}
    />
  )
}
