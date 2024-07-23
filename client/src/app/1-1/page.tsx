import { OneOfOneContentProvider } from './provider'
import { fetchOneOfOneNfts } from '@/api/requests/fetchOneOfOneNfts'

export default async function OneOfOne() {
  const { nfts } = await fetchOneOfOneNfts()

  return (
    <OneOfOneContentProvider
      email={'email'}
      filters={[]}
      images={nfts}
      totalPages={1}
    />
  )
}
