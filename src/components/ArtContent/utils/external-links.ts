import type { Artwork, ExternalLink } from '@/types/artwork'

/**
 * Normalises external links coming from Supabase so components can rely on a
 * predictable structure. Whenever the backend exposes a `mint_link`, we expose
 * the host name as the label (e.g. SuperRare, Objkt) to keep the UI concise.
 */
export function resolveExternalLinks(artwork: Artwork): ExternalLink[] {
  const links: ExternalLink[] = []

  if (artwork.mint_link) {
    let label = 'NFT'

    try {
      const { hostname } = new URL(artwork.mint_link)
      label = hostname.replace(/^www\./, '')
      const [firstSegment] = label.split('.')
      label = (firstSegment || label).toUpperCase()
    } catch (error) {
      label = 'NFT'
    }

    links.push({
      name: label,
      url: artwork.mint_link
    })
  }

  if (Array.isArray(artwork.external_platforms)) {
    const platforms = artwork.external_platforms as unknown as Array<{ title: string; url: string }>
    platforms.forEach((platform) => {
      if (platform.title && platform.url) {
        links.push({
          name: platform.title,
          url: platform.url
        })
      }
    })
  }

  return links
}
