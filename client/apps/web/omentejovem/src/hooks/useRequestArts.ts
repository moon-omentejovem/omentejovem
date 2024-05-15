import { requestNfts } from '@/api/resolver/requestNfts'
import { ArtImage, NftArt } from '@/api/resolver/types'
import { CmsFilter } from '@/components/ArtFilter/ArtFilter'
import { lastDayOfYear } from 'date-fns'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useQuery } from 'react-query'

export interface UseRequestNftsProperties {
	currentPage: number
	selectedFilters: CmsFilter[]
	minted: boolean
	onChangeTotalPages: (newTotal: number) => void
	onChangeLoading: (loadingState: boolean) => void
}

export function useRequestArts({
	currentPage,
	selectedFilters,
	minted,
	onChangeTotalPages,
	onChangeLoading,
}: UseRequestNftsProperties) {
	const pathname = usePathname()
	const [queryString, setQueryString] = useState('')

	const getFilteredArts = useCallback(
		async (filterParams: string, onlyArts: boolean): Promise<NftArt[]> => {
			onChangeLoading(true)
			const { images, totalPages } = await requestNfts({
				page: pathname.replace('/', ''),
				currentPage,
				filterParams,
				onlyArts,
			})

			onChangeTotalPages(totalPages)
			onChangeLoading(false)
			return images
		},
		[selectedFilters, minted, currentPage],
	)

	useEffect(() => {
		const urlParams = new URLSearchParams()

		if (!minted && selectedFilters.length === 0) {
			urlParams.set('art', 'true')
			setQueryString(urlParams.toString())
			return
		}

		if (selectedFilters.length > 0) {
			for (const [index, filter] of selectedFilters.entries()) {
				if (!filter || !filter.key) continue

				if (filter.key !== 'year') {
					urlParams.append(`filter[meta_query][${index}][key]`, filter.key.replaceAll(' ', '_'))
					urlParams.append(`filter[meta_query][${index}][compare]`, filter.compare)
					urlParams.append(
						`filter[meta_query][${index}][value]`,
						filter.value?.replaceAll(' ', '_') ?? '',
					)
				} else {
					const dateYear = new Date(Number(filter.value), 0, 1)
					const lastDayYear = lastDayOfYear(dateYear)
					urlParams.set('after', dateYear.toISOString() ?? '')
					urlParams.set('before', lastDayYear.toISOString() ?? '')
				}
			}

			setQueryString(urlParams.toString())
		}
	}, [selectedFilters, minted])

	return useQuery({
		queryFn: async () => getFilteredArts(queryString, !minted),
		queryKey: ['requestNfts', currentPage, pathname, queryString],
		refetchOnMount: true,
		refetchOnWindowFocus: false,
		enabled: queryString !== '' || (queryString === '' && currentPage > 1),
	})
}
