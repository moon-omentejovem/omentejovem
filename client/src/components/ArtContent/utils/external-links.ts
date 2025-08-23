import { NFT } from '../types'
import {
  GRAILS_NFTS,
  MANIFOLD_NFTS,
  OVERRIDE_EXTERNAL_LINKS,
  POAP_NFTS,
  SUPERRARE_NFTS,
  TRANSIENT_NFTS
} from '@/utils/constants'

export function resolveExternalLinks(selectedArt: NFT) {
  let externalLinkName =
    selectedArt.chain?.toLowerCase() === 'tezos' ? 'Objkt' : 'OpenSea'
  let externalLinkUrl =
    selectedArt.contract.address ===
    '0x0000000000000000000000000000000000000000'
      ? ''
      : selectedArt.chain?.toLowerCase() === 'tezos'
        ? `https://objkt.com/asset/${selectedArt.contract.address}/${selectedArt.tokenId}`
        : `https://opensea.io/assets/${selectedArt.chain?.toLowerCase()}/${selectedArt.contract.address}/${selectedArt.tokenId}`

  let secondaryExternalLinkName = ''
  let secondaryExternalLinkUrl = ''

  if (
    MANIFOLD_NFTS.map((nft) => nft.toLowerCase()).includes(
      selectedArt.contract.address.toLowerCase()
    ) ||
    SUPERRARE_NFTS.map((nft) => nft.toLowerCase()).includes(
      selectedArt.contract.address.toLowerCase()
    ) ||
    TRANSIENT_NFTS.map((nft) => nft.toLowerCase()).includes(
      selectedArt.contract.address.toLowerCase()
    )
  ) {
    externalLinkName = 'SuperRare'
    externalLinkUrl = `https://superrare.com/artwork/eth/${selectedArt.contract.address}/${selectedArt.tokenId}`
  }

  if (
    GRAILS_NFTS.map((nft) => nft.toLowerCase()).includes(
      selectedArt.contract.address.toLowerCase()
    )
  ) {
    externalLinkName = 'Grails'
    externalLinkUrl =
      'https://www.proof.xyz/grails/season-5/a-black-dot-with-a-white-dot-on-a-green-background'
  }

  if (
    POAP_NFTS.map((nft) => nft.toLowerCase()).includes(
      selectedArt.contract.address.toLowerCase()
    )
  ) {
    externalLinkName = 'OpenSea'
    externalLinkUrl =
      'https://opensea.io/collection/poap-v2?search%5Bquery%5D=garden%25%20bidder'
  }

  if (
    selectedArt.contract.address.toLowerCase() ===
      '0x495f947276749ce646f68ac8c248420045cb7b5e' &&
    selectedArt.tokenId ===
      '7871549583317194720263843996823387702908660152655034722079186002726342361098'
  ) {
    externalLinkName = 'OpenSea'
    externalLinkUrl =
      'https://opensea.io/assets/ethereum/0x28a6f816eae721fea4ad34c000077b5fe525fc3c/6'
    secondaryExternalLinkName = 'OpenSea (old token)'
    secondaryExternalLinkUrl =
      'https://opensea.io/assets/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/7871549583317194720263843996823387702908660152655034722079186002726342361098'
  }

  const override =
    OVERRIDE_EXTERNAL_LINKS[
      `${selectedArt.contract.address.toLowerCase()}:${selectedArt.tokenId}`
    ]
  if (override) {
    externalLinkName = override.name
    externalLinkUrl = override.link
  }

  return {
    externalLinkName,
    externalLinkUrl,
    secondaryExternalLinkName,
    secondaryExternalLinkUrl
  }
}
