import { eachYearOfInterval, endOfYear, startOfYear } from 'date-fns'
import { Contracts } from './requestNfts'

function getYearRange(): string[] {
	const start = startOfYear('2020-02-01')
	const end = endOfYear(new Date())

	const years = eachYearOfInterval({ start, end })

	return years
		.map((year) => year.getFullYear())
		.sort((a, b) => b - a)
		.map((year) => String(year))
}

export function generateFilters() {
	const yearSet = new Set(getYearRange())

	const ethContractsSet = new Set<Contracts>([
		'opensea',
		'superrare',
		'rarible',
		'transient_labs',
		'manifold',
	])

	const xtzContractsSet = new Set<Contracts>(['hen', 'objkt', 'objkt_one'])

	const mintedSubfilters = [
		{
			name: 'latest',
		},
		{
			name: 'available',
		},
	]

	const nonmintedSubfilters = [
		{
			name: 'latest',
		},
		{
			name: 'available',
		},
		{
			name: 'year',
			subfilters: [...yearSet].map((year) => ({ name: year })),
		},
	]

	const filters = [
		{
			name: 'minted',
			subfilters: [
				{
					name: 'eth',
					subfilters: [
						...mintedSubfilters,
						{
							name: 'year',
							subfilters: [...yearSet].map((year) => ({ name: year })),
						},
						ethContractsSet.size > 0
							? {
									name: 'contract',
									subfilters: [...ethContractsSet].map((contract) => ({ name: contract })),
							  }
							: undefined,
					].filter(Boolean),
				},
				{
					name: 'xtz',
					subfilters: [
						...mintedSubfilters,
						{
							name: 'year',
							subfilters: [...yearSet].map((year) => ({ name: year })),
						},
						{
							name: 'contract',
							subfilters: [...xtzContractsSet].map((contract) => ({ name: contract })),
						},
					].filter(Boolean),
				},
			],
		},
		{
			name: 'non-minted',
			subfilters: nonmintedSubfilters,
		},
	]

	return filters
}
