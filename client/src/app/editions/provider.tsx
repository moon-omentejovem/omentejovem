'use client'

import { ReactElement } from 'react'
import { EditionsProvider } from './context/EditionsProvider'
import EditionsContent from './content'
import { NftArt } from '@/components/ArtContent/types'
import { Filter } from '@/components/Filter'

interface EditionsContentProviderProperties {
	email: string
	images: NftArt[]
	filters: Filter[]
	totalPages: number
}

export function EditionsContentProvider({
	email,
	filters,
	images,
	totalPages,
}: EditionsContentProviderProperties): ReactElement {
	return (
		<EditionsProvider email={email} images={images} filters={filters} totalPages={totalPages}>
			<EditionsContent />
		</EditionsProvider>
	)
}
