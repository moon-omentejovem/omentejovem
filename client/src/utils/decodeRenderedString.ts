export function decodeRenderedString(value: string): string {
	return decodeURI(value)
		.replaceAll(/\&#8216;/gm, '‘')
		.replaceAll(/\&#8217;/gm, '’')
}
