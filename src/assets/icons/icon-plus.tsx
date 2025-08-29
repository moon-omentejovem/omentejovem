import { Icons } from '@/types'

const IconPlus = ({ title, className }: Icons) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className || 'text-secondary-100 hover:text-primary-50'}
  >
    <title>{title || 'See more'}</title>
    <path d="M12 24L12 -7.15256e-07" stroke="currentColor" />
    <path d="M0 12.2217L24 12.2217" stroke="currentColor" />
  </svg>
)

export default IconPlus
