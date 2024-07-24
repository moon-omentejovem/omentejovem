import { EditionsContentProvider } from './provider'
import { fetchEditionNfts } from '@/api/requests'
import filters from '@/components/ArtFilter/filters'

export default async function Editions() {
  const _images = await fetchEditionNfts()
  const _totalPages = 3

  return (
    <EditionsContentProvider
      email="email"
      filters={filters}
      images={_images.nfts}
      totalPages={_totalPages}
    />
  )
}
