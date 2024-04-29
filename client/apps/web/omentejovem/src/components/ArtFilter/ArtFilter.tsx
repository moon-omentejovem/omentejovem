'use client'

import { ArtImage, NftArt } from '@/components/ArtContent/types'
import { Filter } from '@/components/Filter'
import { useRequestArts } from '@/hooks/useRequestArts'
import { useEffect, useState } from 'react'

interface ArtFilterProperties {
	filters: Filter[]
	currentPage: number
	unfilteredImages: (ArtImage | NftArt)[]
	artImages: ArtImage[]
	onChangeLoading: (loadingState: boolean) => void
	onChangeCurrentPage: (newPage: number) => void
	onChangeArtImages: (images: ArtImage[]) => void
	onChangeTotalPages: (newTotal: number) => void
}

export interface CmsFilter {
	key: string
	compare: string
	value: string | null
}

export function ArtFilter({
	filters,
	currentPage,
	artImages,
	onChangeArtImages,
	onChangeTotalPages,
	onChangeCurrentPage,
	onChangeLoading,
}: ArtFilterProperties) {
	const [selectedFilters, setSelectedFilters] = useState<CmsFilter[]>([])
	const [minted, setMinted] = useState(true)
	const ethContractKeys = new Set(['manifold', 'transient labs', 'superrare', 'opensea', 'rarible'])
	const xtzContractKeys = new Set(['hen', 'objkt', 'objkt one'])

	const { data: newArtImages } = useRequestArts({
		selectedFilters,
		minted,
		currentPage,
		onChangeTotalPages,
		onChangeLoading,
	})

	useEffect(() => {
		if (newArtImages) {
			if (currentPage > 1) {
				onChangeArtImages([...artImages, ...newArtImages])
			} else {
				onChangeArtImages(newArtImages)
			}
		}
	}, [newArtImages])

	function onChangeFilter(filterName: string): void {
		switch (true) {
			case filterName === 'minted':
				setMinted(true)
				setSelectedFilters([])
				break

			case filterName === 'non-minted':
				setMinted(false)
				setSelectedFilters([])
				break

			case filterName === 'xtz':
				onChangeCurrentPage(1)
				setSelectedFilters([
					{
						key: 'opensea',
						compare: '=',
						value: null,
					},
				])
				break

			case filterName === 'eth':
				onChangeCurrentPage(1)
				setSelectedFilters([
					{
						key: 'opensea',
						compare: '!=',
						value: null,
					},
				])
				break

			case filterName === 'latest':
				onChangeCurrentPage(1)
				setSelectedFilters((_selectedFilter) => [_selectedFilter[0]])
				break

			case filterName === 'available':
				if (!selectedFilters.some((filter) => filter?.key === 'available_purchase_status')) {
					onChangeCurrentPage(1)
					setSelectedFilters([
						{ ...selectedFilters[0] },
						{
							key: 'available_purchase_status',
							compare: '=',
							value: '1',
						},
					])
				}
				break

			case /^[0-9]{4}$/gm.test(filterName):
				if (
					!selectedFilters.some((filter) => filter?.key === 'year' && filter?.value === filterName)
				) {
					onChangeCurrentPage(1)
					setSelectedFilters([
						{ ...selectedFilters[0] },
						{
							key: 'year',
							compare: '=',
							value: filterName,
						},
					])
				}
				break

			case ethContractKeys.has(filterName):
				if (!selectedFilters.some((filter) => filter?.key === `contracts_eth_${filterName}`)) {
					onChangeCurrentPage(1)
					setSelectedFilters([
						{ ...selectedFilters[0] },
						{
							key: `contracts_eth_${filterName}`,
							compare: '=',
							value: '1',
						},
					])
				}
				break

			case xtzContractKeys.has(filterName):
				if (!selectedFilters.some((filter) => filter?.key === `contracts_xtz_${filterName}`)) {
					onChangeCurrentPage(1)
					setSelectedFilters([
						{ ...selectedFilters[0] },
						{
							key: `contracts_xtz_${filterName}`,
							compare: '=',
							value: '1',
						},
					])
				}
				break

			default:
				break
		}
	}

	return <Filter filter={filters} onChangeFilter={onChangeFilter} />
}
