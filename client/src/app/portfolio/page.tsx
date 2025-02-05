import { PortfolioContentProvider } from './provider'
import { fetchPortfolioNfts } from '@/api/requests/fetchPortfolioNfts'

export default async function Portfolio() {
  let _images = await fetchPortfolioNfts()

  // Special case because he minted a token twice... once on opensea and once on manifold

  let extraOwnershipData: any[] = []
  let extraOwnershipQuantity = 0

  // Filter out '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:6'
  const filteredNFTs = _images.nfts.filter((art) => {
    if (
      art.contract_address.toLocaleLowerCase() ===
        '0x28a6f816eae721fea4ad34c000077b5fe525fc3c' &&
      art.token_id === '6'
    ) {
      extraOwnershipData = art.owners
      extraOwnershipQuantity = art.owner_count
      return false
    }
    return true
  })

  // Modify the filteredNFTs array to include the extra ownership data
  for (let i = 0; i < filteredNFTs.length; i++) {
    if (
      filteredNFTs[i].contract_address.toLocaleLowerCase() ===
        '0x495f947276749ce646f68ac8c248420045cb7b5e' &&
      filteredNFTs[i].token_id ===
        '7871549583317194720263843996823387702908660152655034722079186002726342361098'
    ) {
      filteredNFTs[i].owners = [
        ...filteredNFTs[i].owners,
        ...extraOwnershipData
      ]
      filteredNFTs[i].owner_count += extraOwnershipQuantity
      break
    }
  }

  _images.nfts = filteredNFTs

  return <PortfolioContentProvider email={''} images={_images.nfts} />
}
