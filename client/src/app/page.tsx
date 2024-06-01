import HomeContent from './home/content'

export default async function Home() {
	const data = {
		title: 'Thales Machado',
		subtitle: 'omentejovem',
		background_images: [],
	}

	return <HomeContent data={data} />
}
