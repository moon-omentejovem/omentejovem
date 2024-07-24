import { Icons } from '@/types'

export default ({ title, className }: Icons) => (
  <svg
    width="19"
    height="22"
    viewBox="0 0 19 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className || 'text-secondary-100 hover:text-primary-50'}
  >
    <title>{title || 'Flip vertically'}</title>
    <g clipPath="url(#clip0_723_1110)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.45502 21.7186C2.11921 21.8865 1.72039 21.8686 1.401 21.6712C1.08161 21.4738 0.887207 21.1251 0.887207 20.7497L0.887207 13.1663C0.887207 12.568 1.37224 12.083 1.97054 12.083L17.1372 12.083C17.6397 12.083 18.0761 12.4285 18.1915 12.9174C18.307 13.4064 18.071 13.9106 17.6217 14.1353L2.45502 21.7186ZM3.05387 14.2497L3.05387 18.9968L12.5481 14.2497H3.05387ZM0.887207 8.833C0.887207 9.43133 1.37224 9.91634 1.97054 9.91634L17.1372 9.91634C17.6397 9.91634 18.0761 9.57086 18.1915 9.08196C18.307 8.59294 18.071 8.08876 17.6217 7.86407L2.45502 0.280739C2.11921 0.112822 1.72039 0.130695 1.401 0.328079C1.08161 0.525572 0.887207 0.874187 0.887207 1.24967L0.887207 8.833Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_723_1110">
        <rect
          width="18"
          height="22"
          fill="white"
          transform="matrix(1 0 0 -1 0.470703 22)"
        />
      </clipPath>
    </defs>
  </svg>
)
