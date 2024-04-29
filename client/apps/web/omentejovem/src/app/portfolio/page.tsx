import { requestNfts } from '@/api/resolver/requestNfts'
import { PortfolioContentProvider } from './provider'
import { NftClient } from '@/api/nftClient'

export default async function Portfolio() {
	const { filters, images, totalPages } = await requestNfts({ page: 'portfolio' })

	return (
		<PortfolioContentProvider
			email={NftClient.email}
			filters={filters}
			images={images}
			totalPages={totalPages}
		/>
	)
}
