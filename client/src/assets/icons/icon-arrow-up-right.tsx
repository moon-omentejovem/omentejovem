import { Icons } from '@/types'

export default ({ title }: Icons) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-secondary-100 hover:text-primary-50"
  >
    <title>{title || 'Arrow up right'}</title>
    <path
      d="M2.62737 1.66737V0.0252628L12 0V9.37263H10.3579L10.4337 3.05684L10.2821 2.90526L1.16211 12L0 10.8379L9.12 1.74316L8.94316 1.56632L2.62737 1.66737Z"
      fill="currentColor"
    />
  </svg>
)
