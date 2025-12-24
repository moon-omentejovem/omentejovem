import { getPortfolioData } from '@/lib/server-data'
import PortfolioContent from './content'

interface PortfolioPageProps {
  searchParams: {
    type?: 'single' | 'edition'
    series?: string
    featured?: 'true'
    slug?: string
    contract?: string
    network?: string
    year?: string
    sort?: string
  }
}

export default async function PortfolioPage({
  searchParams
}: PortfolioPageProps) {
  // Pass only essential params (slug, type, series, featured) to server fetcher
  // Filter params (contract, network, year, sort) are handled client-side
  const data = await getPortfolioData({
    slug: searchParams.slug,
    type: searchParams.type,
    series: searchParams.series,
    featured: searchParams.featured
  })

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
