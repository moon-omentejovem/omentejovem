import { EditionsContentProvider } from './provider'
import { fetchEditionNfts } from '@/api/requests'
import filters from '@/components/ArtFilter/filters'

export default async function Editions() {
  let _images = await fetchEditionNfts()
  const _totalPages = 3

  // Filter out '0x28a6f816eae721fea4ad34c000077b5fe525fc3c:6'
  const filteredNFTs = _images.nfts.filter((art) => {
    if (
      art.contract_address.toLocaleLowerCase() ===
        '0x28a6f816eae721fea4ad34c000077b5fe525fc3c' &&
      art.token_id === '6'
    ) {
      return false
    }
    return true
  })

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
