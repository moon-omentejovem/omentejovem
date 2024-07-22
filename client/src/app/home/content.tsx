import { CalloutParallax } from '@/components/CalloutParallax'
import { ReactElement } from 'react'
import { isEmptyStringOrUndefined } from '@/utils/emptyStringOrUndefined'
import { HomeData } from '@/api/resolver/types'

interface HomeContentProperties {
	data: HomeData | undefined
}

export default function HomeContent({ data }: HomeContentProperties): ReactElement {
	return (
		<main className="flex flex-col">
			<CalloutParallax
				title={isEmptyStringOrUndefined(data?.title) ? 'Thales Machado' : (data?.title as string)}
				subtitle={
					isEmptyStringOrUndefined(data?.subtitle) ? 'omentejovem' : (data?.subtitle as string)
				}
				calloutImages={data?.nfts ?? []}
			/>
		</main>
	)
}
