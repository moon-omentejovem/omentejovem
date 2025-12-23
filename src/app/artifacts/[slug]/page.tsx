import { ArtifactInternalGallery } from '@/components/ArtifactInternalGallery'
import { ArtifactService } from '@/services'
import { VerticalCarousel } from '@/components/VerticalCarousel/VerticalCarousel'
import { notFound } from 'next/navigation'

interface ArtifactSlugPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: ArtifactSlugPageProps) {
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

export default async function ArtifactSlugPage({
  params
}: ArtifactSlugPageProps) {
  const pages = await ArtifactService.getPublishedInternalPages()

  if (!pages || pages.length === 0) {
    notFound()
  }

  const currentIndex = pages.findIndex((item) => item.slug === params.slug)

  if (currentIndex === -1) {
    notFound()
  }

  const page = pages[currentIndex]

  const images = [
    page.image1_url,
    page.image2_url,
    page.image3_url,
    page.image4_url
  ].filter((url): url is string => !!url)

  const slides = pages.map((item) => ({
    name: item.title,
    imageUrl:
      item.image1_url ||
      item.image2_url ||
      item.image3_url ||
      item.image4_url ||
      null,
    slug: item.slug
  }))

  return (
    <main className="min-h-screenMinusHeader bg-background text-neutral-900">
      <div className="xl:h-screenMinusHeader xl:flex xl:items-center">
        <div className="px-6 xl:px-20 py-10 md:py-12 xl:py-16 flex flex-col xl:flex-row gap-10 xl:gap-16 items-start xl:items-end w-full">
          <div className="flex-1 max-w-[800px] w-full">
            <ArtifactInternalGallery title={page.title} images={images} />
          </div>
          <div className="w-full md:w-[471px] flex flex-col justify-end text-secondary-100 h-full xl:mt-0">
            <div className="flex flex-col gap-8">
              <p className="text-[24px]">{page.title}</p>
              {page.description && (
                <p className="text-[14px] leading-[1.2] break-words w-full max-w-[471px]">
                  {page.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <VerticalCarousel
        slideIndex={currentIndex}
        slides={slides}
        redirectSource="artifacts"
      />
    </main>
  )
}
