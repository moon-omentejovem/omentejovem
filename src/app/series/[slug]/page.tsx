import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import SeriesContentWrapper from './content'

interface SeriesPageProps {
  params: {
    slug: string
  }
}

async function getSeriesData(slug: string) {
  const supabase = await createClient()

  // Get the series to validate it exists and get initial data
  const { data: series, error: seriesError } = await supabase
    .from('series')
    .select('*')
    .eq('slug', slug)
    .single()

  if (seriesError || !series) {
    return { series: null, error: seriesError }
  }

  return {
    series,
    error: null
  }
}

// Generate static params for all series - removed due to server context issues
// Let Next.js generate pages on-demand instead
export async function generateStaticParams() {
  // Return empty array to let Next.js generate pages on-demand
  // This prevents the cookies error during build time
  return []
}

// Generate metadata for SEO
export async function generateMetadata({ params }: SeriesPageProps) {
  const { series } = await getSeriesData(params.slug)

  if (!series) {
    return {
      title: 'Series Not Found'
    }
  }

  return {
    title: `${series.name} - Mente Jovem`,
    description: `Explore the ${series.name} series artwork collection`
  }
}

export default async function SeriesDetailPage({ params }: SeriesPageProps) {
  const { series, error } = await getSeriesData(params.slug)

  if (!series) {
    notFound()
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Series</h1>
          <p className="text-neutral-400">Failed to load series data</p>
        </div>
      </div>
    )
  }

  return (
    <SeriesContentWrapper email="contact@omentejovem.com" slug={params.slug} />
  )
}
