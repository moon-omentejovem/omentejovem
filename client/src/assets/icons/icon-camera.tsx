import { Icons } from '@/types'

export default ({ title, className }: Icons) => (
	<svg
		width="22"
		height="13"
		viewBox="0 0 22 13"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		className={className || 'text-secondary-100 hover:text-primary-50'}
	>
		<title>{title || 'Camera'}</title>
		<path
			d="M14.3333 6.55556V11.4444C14.3333 11.8127 14.0349 12.1111 13.6667 12.1111H1.66667C1.29848 12.1111 1 11.8127 1 11.4444V1.66667C1 1.29848 1.29848 1 1.66667 1H13.6667C14.0349 1 14.3333 1.29848 14.3333 1.66667V6.55556ZM14.3333 6.55556L19.9066 1.91121C20.3408 1.54937 21 1.85813 21 2.42337V10.6878C21 11.253 20.3408 11.5618 19.9066 11.1999L14.3333 6.55556Z"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
)
