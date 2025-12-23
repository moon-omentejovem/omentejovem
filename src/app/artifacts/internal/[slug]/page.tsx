import { ArtifactService } from '@/services'
import { getProxiedImageUrl } from '@/lib/utils'
import Image from 'next/image'
import { notFound } from 'next/navigation'

interface ArtifactInternalPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ArtifactInternalPageProps) {
  const page = await ArtifactService.getInternalPageBySlug(params.slug)

  if (!page) {
    return {
      title: 'Artifact Page Not Found'
    }
  }

  const images = [
    page.image1_url,
    page.image2_url,
    page.image3_url,
    page.image4_url
  ].filter((url): url is string => !!url)

  return {
    title: `${page.title} - Artifact - Mente Jovem`,
    description: page.description || `Artifact page for ${page.title}`,
    openGraph: {
      title: page.title,
      description: page.description || '',
      images: images.length > 0 ? images : []
    }
  }
}

export default async function ArtifactInternalPage({
  params
}: ArtifactInternalPageProps) {
  const pages = await ArtifactService.getPublishedInternalPages()

  if (!pages || pages.length === 0) {
    notFound()
  }

  const currentIndex = pages.findIndex((item) => item.slug === params.slug)

  if (currentIndex === -1) {
    notFound()
  }

  const page = pages[currentIndex]

  const otherPages = pages.filter((item) => item.slug !== params.slug)

  const images = [
    page.image1_url,
    page.image2_url,
    page.image3_url,
    page.image4_url
  ].filter((url): url is string => !!url)

  return (
    <main className="min-h-screen bg-neutral-950 text-secondary-100">
      <div className="h-screenMinusHeader px-6 xl:px-20 py-10 flex flex-col md:flex-row gap-10">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900"
            >
              <Image
                src={getProxiedImageUrl(src)}
                alt={`${page.title} image ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <div className="w-full md:w-[400px] flex flex-col justify-between gap-6 ml-auto">
          <div>
            <p className="tracking-[0.2em] uppercase text-orange-500 text-xs mb-3">
              Artifact
            </p>
            <h1 className="text-2xl md:text-3xl font-heading text-secondary-100">
              {page.title}
            </h1>
            {page.description && (
              <p className="mt-4 text-sm text-secondary-100/80 whitespace-pre-line">
                {page.description}
              </p>
            )}
          </div>
          {otherPages.length > 0 && (
            <div className="mt-8 border-t border-neutral-800 pt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 mb-3">
                More artifacts
              </p>
              <div className="flex flex-col gap-2 text-sm">
                {otherPages.map((item) => (
                  <a
                    key={item.id}
                    href={`/artifacts/internal/${item.slug}`}
                    className="text-secondary-100/70 hover:text-secondary-100 transition-colors"
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
