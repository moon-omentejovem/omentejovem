import { Icons } from '@/types'

const IconFlipHorizontal = ({ title, className }: Icons) => (
  <svg
    width="23"
    height="18"
    viewBox="0 0 23 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className || 'text-secondary-100 hover:text-primary-50'}
  >
    <title>{title || 'Flip horizontally'}</title>
    <g clipPath="url(#clip0_723_1112)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22.1898 16.0152C22.3577 16.351 22.3398 16.7498 22.1424 17.0692C21.945 17.3886 21.5963 17.583 21.2209 17.583L13.6375 17.583C13.0392 17.583 12.5542 17.098 12.5542 16.4997L12.5542 1.33301C12.5542 0.830558 12.8997 0.394085 13.3886 0.278709C13.8776 0.163225 14.3818 0.399175 14.6065 0.848541L22.1898 16.0152ZM14.7209 15.4163L19.468 15.4163L14.7209 5.92212L14.7209 15.4163ZM9.3042 17.583C9.90252 17.583 10.3875 17.098 10.3875 16.4997L10.3875 1.33301C10.3875 0.830558 10.0421 0.394084 9.55315 0.278709C9.06413 0.163225 8.55995 0.399175 8.33526 0.848541L0.75193 16.0152C0.584013 16.351 0.601887 16.7498 0.799271 17.0692C0.996763 17.3886 1.34538 17.583 1.72086 17.583L9.3042 17.583Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_723_1112">
        <rect
          width="18"
          height="22"
          fill="white"
          transform="matrix(4.37114e-08 -1 -1 -4.37114e-08 22.4707 18)"
        />
      </clipPath>
    </defs>
  </svg>
)

export default IconFlipHorizontal
