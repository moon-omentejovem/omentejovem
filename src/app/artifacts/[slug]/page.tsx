import { ArtifactInternalGallery } from '@/components/ArtifactInternalGallery'
import { SetHeaderLogoColor } from '@/components/SetHeaderLogoColor'
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

  const pagesWithInside = pages.map((item) => ({
    ...item,
    inside: Array.isArray(item.inside_internal)
      ? item.inside_internal
      : []
  }))

  const currentPage = pagesWithInside[currentIndex]

  const anchorIds = new Set<string>([
    currentPage.id,
    ...currentPage.inside
  ])

  const relatedPages = pagesWithInside.filter((item) => {
    if (item.id === currentPage.id) return false

    const itemInside = item.inside

    const sharesAnchor = itemInside.some((id) => anchorIds.has(id))
    const isAnchor = anchorIds.has(item.id)

    return sharesAnchor || isAnchor
  })

  const unorderedSlidesSource =
    relatedPages.length > 0 ? [currentPage, ...relatedPages] : pagesWithInside

  const slidesSource = unorderedSlidesSource.slice().sort((a, b) => {
    const aOrder = a.display_order
    const bOrder = b.display_order

    const aHasOrder = aOrder !== null && aOrder !== undefined
    const bHasOrder = bOrder !== null && bOrder !== undefined

    if (aHasOrder && bHasOrder) {
      if (aOrder !== bOrder) {
        return aOrder - bOrder
      }
    } else if (aHasOrder && !bHasOrder) {
      return -1
    } else if (!aHasOrder && bHasOrder) {
      return 1
    }

    const aCreated = a.created_at || ''
    const bCreated = b.created_at || ''

    if (aCreated < bCreated) return 1
    if (aCreated > bCreated) return -1
    return 0
  })

  const slides = slidesSource.map((item) => ({
    name: item.title,
    imageUrl:
      item.image1_url ||
      item.image2_url ||
      item.image3_url ||
      item.image4_url ||
      null,
    slug: item.slug
  }))

  const slideIndex = Math.max(
    slidesSource.findIndex((item) => item.slug === page.slug),
    0
  )

  return (
    <main className="min-h-screenMinusHeader bg-background text-neutral-900">
      <SetHeaderLogoColor color={page.header_logo_color} />
      <div className="xl:h-screenMinusHeader xl:flex xl:items-center">
        <div className="relative px-6 xl:px-20 pt-6 md:pt-8 xl:pt-0 pb-10 md:pb-12 xl:pb-16 flex flex-col xl:flex-row gap-10 xl:gap-16 items-start xl:items-end w-full">
          <div className="flex-1 max-w-[800px] w-full xl:self-start">
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
        <div className="hidden xl:block absolute top-0 right-[10vw] h-[580px]">
          <VerticalCarousel
            slideIndex={slideIndex}
            slides={slides}
            redirectSource="artifacts"
            isFixed={false}
              className="h-full"
            />
          </div>
        </div>
      </div>
    </main>
  )
}
