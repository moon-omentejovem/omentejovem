import { Artwork } from '@/types/artwork'

export function resolveExternalLinks(selectedArt: Artwork) {
  // Simplified external links logic for Backend-Oriented approach
  // Most logic removed since contract/chain data not available in current Supabase schema

  let externalLinkName = 'View NFT'
  let externalLinkUrl = selectedArt.mint_link || ''

  let secondaryExternalLinkName = ''
  let secondaryExternalLinkUrl = ''

  return {
    externalLinkName,
    externalLinkUrl,
    secondaryExternalLinkName,
    secondaryExternalLinkUrl
  }
}
