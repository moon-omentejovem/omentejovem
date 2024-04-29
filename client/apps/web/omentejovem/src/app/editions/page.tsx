import { requestNfts } from '@/api/resolver/requestNfts'
import { EditionsContentProvider } from './provider'

export default async function Editions() {
	const { filters, images, email, totalPages } = await requestNfts({ page: 'editions' })

	return (
		<EditionsContentProvider
			email={email}
			filters={filters}
			images={images}
			totalPages={totalPages}
		/>
	)
}
