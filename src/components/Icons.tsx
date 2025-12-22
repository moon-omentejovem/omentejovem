import {
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Info,
  MoveUpRight,
  X,
  type XIcon as LucideIcon
} from 'lucide-react'

export type Icon = typeof LucideIcon

const Menu = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <line
      x1="4"
      y1="7"
      x2="20"
      y2="7"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <line
      x1="4"
      y1="12"
      x2="20"
      y2="12"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <line
      x1="4"
      y1="17"
      x2="20"
      y2="17"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
)

export const Icons = {
  Menu,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Info,
  MoveUpRight,
  X
}
