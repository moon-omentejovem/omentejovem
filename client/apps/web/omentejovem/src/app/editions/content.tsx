'use client'

import { ArtMainContent } from '@/components/ArtContent/ArtMainContent'
import { ReactElement } from 'react'
import { useEditionsContext } from './context/useEditionsContext'

export default function EditionsContent(): ReactElement {
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
	} = useEditionsContext()

	return (
		<ArtMainContent
			email={email}
			source="editions"
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
