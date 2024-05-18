import { requestNfts } from '@/api/resolver/requestNfts'
import { EditionsContentProvider } from './provider'
import { generateFilters } from '@/api/resolver/generateFilters'
import { fetchEditionNfts } from '@/api/requests';

export default async function Editions() {
	const _filters = generateFilters();
	const _images = await fetchEditionNfts();
	const _totalPages = 3;

	return (
		<EditionsContentProvider
			email='email'
			filters={_filters}
			images={_images.nfts}
			totalPages={_totalPages}
		/>
	)
}
