import {
	fetchAboutExhibitions,
	fetchAboutPress,
	fetchAboutTalks,
	getAboutInfo,
} from '@/api/requests/wordpress/getAboutInfo'
import { AboutContent } from './content'

async function requestGetAboutInfo() {
	try {
		const response = await getAboutInfo()
		const data = response.data[0].acf

		const talksRequest = await fetchAboutTalks()
		const talks = talksRequest.data.slice(0, 3)

		const pressRequest = await fetchAboutPress()
		const press = pressRequest.data.slice(0, 3)

		const exhibitionsRequest = await fetchAboutExhibitions()
		const exhibitions = exhibitionsRequest.data.slice(0, 3)

		return {
			...data,
			talks,
			press,
			exhibitions,
		}
	} catch (error) {
		console.log('#ERROR:', error)
	}
}

export default async function About() {
	const data = await requestGetAboutInfo()

	return (
		<AboutContent
			data={data}
			press={data?.press ?? []}
			talks={data?.talks ?? []}
			exhibitions={data?.exhibitions ?? []}
		/>
	)
}
