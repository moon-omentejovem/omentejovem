'use client'

import { ReactElement } from 'react'
import { PortfolioProvider } from './context/PortfolioProvider'
import PortfolioContent from './content'
import { ArtImage } from '@/components/ArtContent/types'
import { Filter } from '@/components/Filter'

interface PortfolioContentProviderProperties {
	email: string
	images: ArtImage[]
	filters: Filter[]
	totalPages: number
}

export function PortfolioContentProvider({
	email,
	filters,
	images,
	totalPages,
}: PortfolioContentProviderProperties): ReactElement {
	return (
		<PortfolioProvider email={email} images={images} filters={filters} totalPages={totalPages}>
			<PortfolioContent />
		</PortfolioProvider>
	)
}
