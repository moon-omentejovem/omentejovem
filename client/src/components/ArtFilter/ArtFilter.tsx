'use client'

import { NftArt } from '@/components/ArtContent/types'
import { Filter } from '@/components/Filter'
import { useEffect, useState } from 'react'
import filters, { ChainedFilter } from './filters'
import { orderBy } from '@/utils/arrays'

interface ArtFilterProperties {
	currentPage: number
	artImages: NftArt[]
	onChangeArtImages: (images: NftArt[]) => void
}

export interface CmsFilter {
	key: string
	compare: string
	value: string | null
}


export type NftFilter = (nft: NftArt) => boolean;

export function ArtFilter({
	currentPage,
	artImages,
	onChangeArtImages
}: ArtFilterProperties) {
	const [filteredImages, setFilteredImages] = useState<NftArt[]>([...artImages])

	useEffect(() => {
		if (filteredImages) {
			if (currentPage > 1) {
				onChangeArtImages([...artImages, ...filteredImages])
			} else {
				onChangeArtImages(filteredImages)
			}
		}
	}, [artImages, currentPage, filteredImages, onChangeArtImages])

	function onChangeFilter(filterHistory: ChainedFilter[]): void {
		const filtered = [...artImages].filter(n => filterHistory.every(f => f.filterApply ? f.filterApply!(n) : true))
		const sorted = filterHistory.findLast(h => !!h.sortApply);
		if (sorted) {
			setFilteredImages(orderBy(filtered, sorted.sortApply!.key, sorted.sortApply?.option))
		}
		else {
			setFilteredImages(filtered)
		}
	}

	return <Filter filter={filters} onChangeFilter={onChangeFilter} />
}
