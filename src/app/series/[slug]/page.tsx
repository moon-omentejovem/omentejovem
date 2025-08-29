import type { Database } from '@/types/supabase'
import { getBestImageUrl } from '@/utils/images'
import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Series = Database['public']['Tables']['series']['Row']
type SeriesArtwork = Database['public']['Tables']['series_artworks']['Row']
type Artwork = Database['public']['Tables']['artworks']['Row']

interface SeriesWithArtworks extends Series {
  series_artworks: (SeriesArtwork & {
    artworks: Artwork
  })[]
}

interface SeriesPageProps {
  params: {
    slug: string
  }
}

async function getSeriesData(slug: string): Promise<SeriesWithArtworks | null> {
  const supabase = await createClient()

  const { data: series, error } = await supabase
    .from('series')
    .select(
      `
      *,
      series_artworks(
        artworks(*)
      )
    `
    )
    .eq('slug', slug)
    .single()

  if (error || !series) {
    return null
  }

  return series as SeriesWithArtworks
}

export default async function SeriesDetailPage({ params }: SeriesPageProps) {
  const series = await getSeriesData(params.slug)

  if (!series) {
    notFound()
  }

  const artworks =
    series.series_artworks?.map((sa) => sa.artworks).filter(Boolean) || []

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/series"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Series
            </Link>
            <span className="text-neutral-600 mx-2">/</span>
            <span className="text-white">{series.name}</span>
          </div>

          <h1 className="text-5xl font-bold mb-6">{series.name}</h1>

          {/* Series Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold">{artworks.length}</div>
              <div className="text-neutral-400 text-sm">
                {artworks.length === 1 ? 'Artwork' : 'Artworks'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {artworks.filter((a) => a.type === 'single').length}
              </div>
              <div className="text-neutral-400 text-sm">1/1 Pieces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {artworks.filter((a) => a.type === 'edition').length}
              </div>
              <div className="text-neutral-400 text-sm">Editions</div>
            </div>
          </div>

          {/* Series Cover */}
          {series.cover_image_url && (
            <div className="relative aspect-[21/9] max-w-4xl mx-auto mb-12 overflow-hidden rounded-lg">
              <Image
                src={getBestImageUrl(series.cover_image_url, {
                  width: 1200,
                  height: 514
                })}
                alt={series.name}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}
        </div>

        {/* Artworks Grid */}
        {artworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/portfolio/${artwork.slug}`}
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-900">
                  <Image
                    src={getBestImageUrl(artwork.image_url || '', {
                      width: 400,
                      height: 400
                    })}
                    alt={artwork.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {artwork.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="bg-neutral-800 px-2 py-1 rounded">
                          {artwork.type === 'single'
                            ? '1/1'
                            : `Ed. ${artwork.editions_total}`}
                        </span>

                        {artwork.is_featured && (
                          <span className="bg-blue-600 px-2 py-1 rounded text-xs">
                            Featured
                          </span>
                        )}

                        {artwork.is_one_of_one && (
                          <span className="bg-yellow-600 px-2 py-1 rounded text-xs text-black font-medium">
                            1 of 1
                          </span>
                        )}
                      </div>
                    </div>

                    {artwork.mint_date && (
                      <div className="text-xs text-neutral-400 mt-2">
                        {new Date(artwork.mint_date).getFullYear()}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-semibold mb-4">
              No artworks in this series yet
            </h3>
            <p className="text-neutral-400 mb-8">
              This series is being curated. Check back later for new additions.
            </p>
            <Link
              href="/series"
              className="inline-block bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-neutral-200 transition-colors"
            >
              Back to Series
            </Link>
          </div>
        )}

        {/* Back to Series */}
        <div className="text-center mt-16">
          <Link
            href="/series"
            className="inline-block border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 px-6 py-3 rounded-full font-medium transition-colors"
          >
            ← Back to All Series
          </Link>
        </div>
      </div>
    </div>
  )
}
