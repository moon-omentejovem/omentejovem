import { ArtifactService, ArtworkService, HomeService } from '@/services'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import HomeContent from './home/content'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
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

  const closeNewsletter = cookies().get('newsletter_dismissed')

  if (!closeNewsletter) {
    return redirect('/newsletter')
  }

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
      featuredArtwork.imageoptimizedurl || featuredArtwork.imageurl || ''
    images = [
      {
        title: featuredArtwork.title || '',
        imageUrl,
        createdAt: featuredArtwork.posted_at || ''
      }
    ]
  }

  if (!images) {
    const { artworks: featuredArtworks } =
      await ArtworkService.getPublishedFeatured()

    images = featuredArtworks.map((artwork: any) => {
      const imageUrl =
        artwork.imageoptimizedurl || artwork.imageurl || ''

      return {
        title: artwork.title || '',
        imageUrl,
        createdAt: artwork.posted_at || ''
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
