import type { Database } from '@/types/supabase'
import { getBestImageUrl, getResponsiveImageSources } from '@/utils/images'
import { createClient } from '@/utils/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Artwork = Database['public']['Tables']['artworks']['Row']
type Series = Database['public']['Tables']['series']['Row']

type ArtworkWithSeries = Artwork & {
  series_artworks: {
    series: Series
  }[]
}

interface ArtworkPageProps {
  params: {
    slug: string
  }
}

async function getArtwork(slug: string): Promise<ArtworkWithSeries | null> {
  const supabase = await createClient()

  const { data: artwork, error } = await supabase
    .from('artworks')
    .select(
      `
      *,
      series_artworks(
        series(id, name, slug, cover_image_url)
      )
    `
    )
    .eq('slug', slug)
    .single()

  if (error || !artwork) {
    return null
  }

  return artwork as ArtworkWithSeries
}

async function getRelatedArtworks(
  artwork: ArtworkWithSeries,
  limit = 4
): Promise<Artwork[]> {
  const supabase = await createClient()

  // Get artworks from the same series
  let query = supabase
    .from('artworks')
    .select('*')
    .neq('id', artwork.id)
    .order('posted_at', { ascending: false })
    .limit(limit)

  // If artwork belongs to series, get artworks from the same series
  if (artwork.series_artworks && artwork.series_artworks.length > 0) {
    const seriesIds = artwork.series_artworks.map((sa) => sa.series.id)

    const { data: seriesArtworks } = await supabase
      .from('series_artworks')
      .select('artwork_id')
      .in('series_id', seriesIds)
      .neq('artwork_id', artwork.id)

    if (seriesArtworks && seriesArtworks.length > 0) {
      const artworkIds = (seriesArtworks as any[]).map((sa) => sa.artwork_id)
      query = query.in('id', artworkIds)
    }
  }

  const { data: related } = await query
  return (related as Artwork[]) || []
}

interface TiptapMark {
  type: 'bold' | 'italic' | 'link'
  attrs?: {
    href?: string
  }
}

interface TiptapTextNode {
  type: 'text'
  text: string
  marks?: TiptapMark[]
}

interface TiptapNode {
  type:
    | 'paragraph'
    | 'heading'
    | 'bulletList'
    | 'orderedList'
    | 'listItem'
    | 'blockquote'
  content?: (TiptapTextNode | TiptapNode)[]
  attrs?: {
    level?: number
  }
}

interface TiptapContent {
  content: TiptapNode[]
}

function renderDescription(description: any) {
  if (!description || typeof description !== 'object' || !description.content) {
    return null
  }

  return description.content.map((node: any, index: number) => {
    switch (node.type) {
      case 'paragraph':
        return (
          <p key={index} className="mb-4 text-neutral-300 leading-relaxed">
            {node.content?.map((textNode: any, textIndex: number) => {
              if (textNode.type === 'text') {
                let text = textNode.text
                if (textNode.marks) {
                  textNode.marks.forEach((mark: any) => {
                    if (mark.type === 'bold') {
                      text = <strong key={textIndex}>{text}</strong>
                    }
                    if (mark.type === 'italic') {
                      text = <em key={textIndex}>{text}</em>
                    }
                    if (mark.type === 'link') {
                      text = (
                        <a
                          key={textIndex}
                          href={mark.attrs.href}
                          className="text-blue-400 hover:text-blue-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {text}
                        </a>
                      )
                    }
                  })
                }
                return text
              }
              return null
            })}
          </p>
        )
      case 'heading':
        const HeadingTag =
          `h${node.attrs?.level || 2}` as keyof JSX.IntrinsicElements
        return (
          <HeadingTag
            key={index}
            className="text-2xl font-bold mb-4 text-white"
          >
            {node.content?.[0]?.text}
          </HeadingTag>
        )
      default:
        return null
    }
  })
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const artwork = await getArtwork(params.slug)

  if (!artwork) {
    notFound()
  }

  const relatedArtworks = await getRelatedArtworks(artwork)
  const responsiveImages = getResponsiveImageSources(artwork.image_url || '')

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link href="/portfolio" className="hover:text-white">
              Portfolio
            </Link>
            <span>/</span>
            <span className="text-white">{artwork.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-neutral-900">
              <Image
                src={getBestImageUrl(artwork.image_url || '', {
                  width: 800,
                  height: 800
                })}
                alt={artwork.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {artwork.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap gap-4 mb-6">
                <span className="bg-neutral-800 px-3 py-1 rounded-full text-sm">
                  {artwork.type === 'single'
                    ? '1/1 Original'
                    : `Edition of ${artwork.editions_total}`}
                </span>

                {artwork.is_featured && (
                  <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                    Featured
                  </span>
                )}

                {artwork.is_one_of_one && (
                  <span className="bg-yellow-600 text-black px-3 py-1 rounded-full text-sm font-medium">
                    One of One
                  </span>
                )}
              </div>

              {/* Series */}
              {artwork.series_artworks &&
                artwork.series_artworks.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Collections</h3>
                    <div className="flex flex-wrap gap-2">
                      {artwork.series_artworks.map((sa, index) => (
                        <Link
                          key={index}
                          href={`/series/${sa.series.slug}`}
                          className="bg-neutral-800 hover:bg-neutral-700 px-3 py-2 rounded-lg transition-colors"
                        >
                          {sa.series.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              {/* Description */}
              {artwork.description && (
                <div className="prose prose-invert max-w-none">
                  {renderDescription(artwork.description)}
                </div>
              )}

              {/* Mint Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-neutral-800">
                {artwork.mint_date && (
                  <div>
                    <h4 className="font-semibold mb-2">Mint Date</h4>
                    <p className="text-neutral-400">
                      {new Date(artwork.mint_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {artwork.token_id && (
                  <div>
                    <h4 className="font-semibold mb-2">Token ID</h4>
                    <p className="text-neutral-400 font-mono">
                      {artwork.token_id}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {artwork.mint_link && (
                <div className="pt-6">
                  <a
                    href={artwork.mint_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-neutral-200 transition-colors"
                  >
                    View on OpenSea
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Artworks */}
        {relatedArtworks.length > 0 && (
          <section className="border-t border-neutral-800 pt-16">
            <h2 className="text-3xl font-bold mb-8">Related Works</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedArtworks.map((related) => (
                <Link
                  key={related.id}
                  href={`/portfolio/${related.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-900">
                    <Image
                      src={getBestImageUrl(related.image_url || '', {
                        width: 300,
                        height: 300
                      })}
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 w-full">
                        <h3 className="text-sm font-semibold mb-1 line-clamp-2">
                          {related.title}
                        </h3>
                        <p className="text-xs text-neutral-300">
                          {related.type === 'single'
                            ? '1/1'
                            : `Ed. of ${related.editions_total}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
