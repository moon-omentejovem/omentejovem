import { ArtifactService, ArtworkService, HomeService } from '@/services'
import HomeContent from './content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const homepageSettings = await HomeService.getHomepageSettings()

  let featuredArtifact: any = null
  let featuredArtwork: any = null

  if (homepageSettings.featured_artifact_slug) {
    featuredArtifact = await ArtifactService.getInternalPageBySlug(
      homepageSettings.featured_artifact_slug
    )
  }

  if (!featuredArtifact && homepageSettings.featured_artwork_slug) {
    featuredArtwork = await ArtworkService.getBySlug(
      homepageSettings.featured_artwork_slug
    )
  }

  let images:
    | {
        title: string
        imageUrl: string
        createdAt: string
      }[]
    | null = null

  let featuredTitle = ''
  let featuredHref: string | null = null

  if (featuredArtifact) {
    featuredTitle = featuredArtifact.title
    featuredHref = `/artifacts/${featuredArtifact.slug}`
    const imageUrl =
      featuredArtifact.image1_url ||
      featuredArtifact.image2_url ||
      featuredArtifact.image3_url ||
      featuredArtifact.image4_url ||
      ''
    images = [
      {
        title: featuredArtifact.title || '',
        imageUrl,
        createdAt: featuredArtifact.created_at || ''
      }
    ]
  } else if (featuredArtwork) {
    featuredTitle = featuredArtwork.title
    featuredHref = `/portfolio/${featuredArtwork.slug}`
    const imageUrl =
      featuredArtwork.imageurl || featuredArtwork.imageoptimizedurl || ''
    images = [
      {
        title: featuredArtwork.title || '',
        imageUrl,
        createdAt:
          featuredArtwork.posted_at || featuredArtwork.created_at || ''
      }
    ]
  }

  if (!images) {
    const { artworks: featuredArtworks } =
      await ArtworkService.getPublishedFeatured()

    images = featuredArtworks.map((artwork: any) => {
      const imageUrl =
        artwork.imageurl ||
        artwork.imageoptimizedurl ||
        ''

      return {
        title: artwork.title || '',
        imageUrl,
        createdAt: artwork.posted_at || artwork.created_at || ''
      }
    })
  }

  return (
    <div
      className="fixed sm:z-20 w-full h-full"
      style={{ backgroundColor: homepageSettings.background_color }}
    >
      <HomeContent
        initialImages={images}
        title={homepageSettings.title}
        subtitle={homepageSettings.subtitle}
        showTitle={homepageSettings.show_title}
        showSubtitle={homepageSettings.show_subtitle}
        featuredLabel={homepageSettings.featured_label}
        featuredTitle={featuredTitle}
        featuredHref={featuredHref}
        headerLogoColor={homepageSettings.header_logo_color}
        backgroundColor={homepageSettings.background_color}
      />
    </div>
  )
}
