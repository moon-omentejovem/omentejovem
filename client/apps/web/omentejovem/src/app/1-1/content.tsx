'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { ReactElement } from 'react'
import { useOneOfOneContext } from './context/useOneOfOneContext'

export default function OneOfOneContent(): ReactElement {
	const {
		email,
		artImages,
		selectedArtIndex,
		filters,
		unfilteredImages,
		onChangeArtImages,
		onChangeSelectedArtIndex,
		artTotalPages,
		onChangeTotalPages,
	} = useOneOfOneContext()

	return (
		<ArtMainContent
			email={email}
			source="1-1"
			artImages={artImages}
			filters={filters}
			onChangeArtImages={onChangeArtImages}
			onChangeSelectedArtIndex={onChangeSelectedArtIndex}
			selectedArtIndex={selectedArtIndex}
			unfilteredImages={unfilteredImages}
			totalPages={artTotalPages}
			onChangeTotalPages={onChangeTotalPages}
		/>
	)
}
