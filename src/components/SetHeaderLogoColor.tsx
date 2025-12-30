'use client'

import { useEffect } from 'react'

interface SetHeaderLogoColorProps {
  color?: string | null
}

export function SetHeaderLogoColor({
  color
}: SetHeaderLogoColorProps) {
  useEffect(() => {
    if (!color) return

    const trimmed = color.trim()
    if (!trimmed) return

    const normalized =
      trimmed.toLowerCase() === '#f7ea4d' ? '#f7ea4d' : '#000000'

    document.documentElement.style.setProperty(
      '--header-logo-color',
      normalized
    )
  }, [color])

  return null
}

