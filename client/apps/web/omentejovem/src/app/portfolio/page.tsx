import { PortfolioContentProvider } from './provider'
import { NftClient } from '@/api/nftClient'
import { fetchPortfolioNfts } from '@/api/requests/fetchPortfolioNfts'

export default async function Portfolio() {
	const { nfts } = await fetchPortfolioNfts()
	
	return (
		<PortfolioContentProvider
			email={NftClient.email}
			images={nfts}
		/>
	)
}
