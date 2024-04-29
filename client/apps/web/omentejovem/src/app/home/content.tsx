import { HomeData } from '@/api/@types'
import { CalloutParallax } from '@/components/CalloutParallax'
import { ReactElement } from 'react'
import { isEmptyStringOrUndefined } from '@/utils/emptyStringOrUndefined'
import { HomeImage } from '@/types/home'

export type HomePageData = HomeData & { background_images: HomeImage[] }

interface HomeContentProperties {
	data: HomePageData | undefined
}

export default function HomeContent({ data }: HomeContentProperties): ReactElement {
	return (
		<main className="flex flex-col">
			<CalloutParallax
				title={isEmptyStringOrUndefined(data?.title) ? 'Thales Machado' : (data?.title as string)}
				subtitle={
					isEmptyStringOrUndefined(data?.subtitle) ? 'omentejovem' : (data?.subtitle as string)
				}
				calloutImages={data?.background_images ?? []}
			/>
		</main>
	)
}
