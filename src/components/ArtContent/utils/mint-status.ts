import type { Artwork } from '@/types/artwork'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export function isArtworkMinted(artwork: Artwork): boolean {
  const tokenId = artwork.token_id?.trim()
  const mintLink = artwork.mint_link?.trim()
  const hasExternalPlatforms =
    Array.isArray(artwork.external_platforms) &&
    artwork.external_platforms.length > 0

  if (!tokenId && !mintLink && !hasExternalPlatforms) {
    return false
  }

  if (tokenId === ZERO_ADDRESS) {
    return false
  }

  return true
}

function getExplorerBase(chain?: string | null): string {
  switch ((chain || 'ethereum').toLowerCase()) {
    case 'tezos':
      return 'https://objkt.com/asset'
    case 'polygon':
      return 'https://polygonscan.com/token'
    case 'ethereum':
    default:
      return 'https://etherscan.io/token'
  }
}

export function getExplorerLink(artwork: Artwork): string {
  if (!isArtworkMinted(artwork)) {
    return ''
  }

  const tokenId = artwork.token_id?.trim()
  const contract = artwork.contract_address?.trim()

  if (!tokenId) {
    return artwork.mint_link || ''
  }

  const base = getExplorerBase(artwork.blockchain)

  if (base.includes('objkt.com')) {
    if (!contract) {
      return artwork.mint_link || ''
    }

    return `${base}/${contract}/${tokenId}`
  }

  if (contract) {
    return `${base}/${contract}?a=${tokenId}`
  }

  return `${base}/${tokenId}`
}
