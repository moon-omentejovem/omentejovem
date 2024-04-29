/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: false,
	images: {
		unoptimized: true,
	},
	logging: {
		fetches: {
			fullUrl: true,
		}
	},
	headers: () => [
		{
			source: '/:path*',
			headers: [
				{
					key: 'Cache-Control',
					value: 'no-store',
				},
			],
		},
	],
}

module.exports = nextConfig
