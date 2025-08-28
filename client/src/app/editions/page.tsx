import { fetchEditionNfts } from '@/api/requests'
import { NFT } from '@/api/resolver/types'
import filters from '@/components/ArtFilter/filters'
import { EditionsContentProvider } from './provider'

export default async function Editions() {
  let _images = await fetchEditionNfts()
  const _totalPages = 3

  // Ensure _images and nfts exist
  if (!_images || !_images.nfts) {
    return (
      <EditionsContentProvider
        email="email"
        filters={filters}
        images={[]}
        totalPages={_totalPages}
      />
    )
  }

  // Special case because he minted a token twice... once on opensea and once on manifold
  let extraOwnershipData: NFT[] = []
  let extraOwnershipQuantity = 0

  // Filter out '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:6'
  const filteredNFTs = _images.nfts.filter((art: NFT) => {
    if (!art || !art.contract || !art.contract.address) return true

    if (
      art.contract.address.toLowerCase() ===
        '0x28a6f816eae721fea4ad34c000077b5fe525fc3c' &&
      art.tokenId === '6'
    ) {
      extraOwnershipData = art.owners || []
      extraOwnershipQuantity = art.owners?.length || 0
      return false
    }
    return true
  })

  // Modify the filteredNFTs array to include the extra ownership data
  for (let i = 0; i < filteredNFTs.length; i++) {
    const nft = filteredNFTs[i]
    if (!nft || !nft.contract || !nft.contract.address) continue

    if (
      nft.contract.address.toLowerCase() ===
        '0x495f947276749ce646f68ac8c248420045cb7b5e' &&
      nft.tokenId ===
        '7871549583317194720263843996823387702908660152655034722079186002726342361098'
    ) {
      nft.owners = [...(nft.owners || []), ...extraOwnershipData]
      if (nft.owners) {
        nft.owners.length += extraOwnershipQuantity
      }
      break
    }
  }

  _images.nfts = filteredNFTs

  return (
    <EditionsContentProvider
      email="email"
      filters={filters}
      images={_images.nfts}
      totalPages={_totalPages}
    />
  )
}
