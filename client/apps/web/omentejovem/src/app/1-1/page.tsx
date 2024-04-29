import { requestNfts } from '@/api/resolver/requestNfts'
import { OneOfOneContentProvider } from './provider'

export default async function OneOfOne() {
	const { email, filters, images, totalPages } = await requestNfts({ page: 'oneOfOne' })

	return (
		<OneOfOneContentProvider
			email={email}
			filters={filters}
			images={images}
			totalPages={totalPages}
		/>
	)
}
