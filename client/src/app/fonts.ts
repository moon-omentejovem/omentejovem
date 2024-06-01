import localFont from 'next/font/local'

export const NeueMachina = localFont({
	src: '../assets/fonts/PPNeueMachina-PlainRegular.otf',
	variable: '--font-neuemachina',
})

export const FraktionMono = localFont({
	src: [
		{
			path: '../assets/fonts/PPFraktionMono-Regular.otf',
			weight: '400',
			style: 'normal',
		},
		{
			path: '../assets/fonts/PPFraktionMono-Bold.otf',
			weight: '700',
			style: 'bold',
		},
	],
	variable: '--font-fraktion',
})
