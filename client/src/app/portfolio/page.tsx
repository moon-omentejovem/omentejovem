import { PortfolioContentProvider } from './provider'
import { fetchPortfolioNfts } from '@/api/requests/fetchPortfolioNfts'

export default async function Portfolio() {
  const { nfts } = await fetchPortfolioNfts()

  return <PortfolioContentProvider email={''} images={nfts} />
}
