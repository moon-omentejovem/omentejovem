const apiKey = process.env.API_KEY

export const api = {
	baseURL: 'https://admin.omentejovem.com/wordpress/index.php/wp-json/wp/v2',
	next: {
		revalidate: 3600, // every 1 hour
	},
	headers: {
		'X-Custom-Api-Key': apiKey ?? '',
	},
}
