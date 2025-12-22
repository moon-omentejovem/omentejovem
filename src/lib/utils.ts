import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProxiedImageUrl(src: string) {
  if (!src) return src
  if (src.startsWith('/') || src.startsWith('data:')) return src
  return `/api/images/proxy?url=${encodeURIComponent(src)}`
}
