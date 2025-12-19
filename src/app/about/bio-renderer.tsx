'use client'

import { useEffect, useRef, useState } from 'react'

interface BioRendererProps {
  content: any
}

interface ArtworkImageCache {
  [slug: string]: string | null
}

function tiptapToText(content: any): string {
  if (!content) return ''
  
  if (typeof content === 'string') return content
  
  if (content.type === 'text') {
    return content.text || ''
  }
  
  if (content.content && Array.isArray(content.content)) {
    return content.content.map(tiptapToText).join('')
  }
  
  return ''
}

function tiptapToHTML(content: any): string {
  if (!content) return ''
  
  if (typeof content === 'string') return content
  
  if (content.type === 'text') {
    let text = content.text || ''
    if (content.marks) {
      content.marks.forEach((mark: any) => {
        if (mark.type === 'bold') {
          text = `<strong>${text}</strong>`
        } else if (mark.type === 'italic') {
          text = `<em>${text}</em>`
        } else if (mark.type === 'link') {
          text = `<a href="${mark.attrs.href}" class="text-orange-400 underline hover:text-orange-300">${text}</a>`
        }
      })
    }
    return text
  }
  
  if (content.type === 'paragraph') {
    const innerContent = content.content ? content.content.map(tiptapToHTML).join('') : ''
    return `<p class="mb-4">${innerContent}</p>`
  }
  
  if (content.type === 'heading') {
    const level = content.attrs?.level || 1
    const innerContent = content.content ? content.content.map(tiptapToHTML).join('') : ''
    return `<h${level} class="font-bold mb-4">${innerContent}</h${level}>`
  }
  
  if (content.type === 'bulletList') {
    const innerContent = content.content ? content.content.map(tiptapToHTML).join('') : ''
    return `<ul class="list-disc ml-6 mb-4">${innerContent}</ul>`
  }
  
  if (content.type === 'listItem') {
    const innerContent = content.content ? content.content.map(tiptapToHTML).join('') : ''
    return `<li>${innerContent}</li>`
  }
  
  if (content.type === 'image') {
    const src = content.attrs?.src || ''
    const alt = content.attrs?.alt || ''
    return `<img src="${src}" alt="${alt}" class="max-w-full h-auto mb-4" />`
  }
  
  if (content.content && Array.isArray(content.content)) {
    return content.content.map(tiptapToHTML).join('')
  }
  
  return ''
}

function extractSlugFromHref(href: string): string | null {
  // Handle both relative and absolute URLs
  const artworkPatterns = [
    /\/1-1\/([^/?#]+)/,
    /\/editions\/([^/?#]+)/,
    /\/portfolio\/([^/?#]+)/,
    /\/series\/[^/]+\/([^/?#]+)/
  ]

  for (const pattern of artworkPatterns) {
    const match = href.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

async function fetchArtworkImage(slug: string): Promise<string | null> {
  try {
    console.log('[BioRenderer] Fetching image for slug:', slug)
    const response = await fetch(`/api/artworks/${slug}/image`)
    if (!response.ok) {
      console.log('[BioRenderer] API response not ok:', response.status)
      return null
    }
    const data = await response.json()
    console.log('[BioRenderer] API response:', data)
    return data.imageUrl || null
  } catch (error) {
    console.error('[BioRenderer] Error fetching image:', error)
    return null
  }
}

export function BioRenderer({ content }: BioRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [imageCache, setImageCache] = useState<ArtworkImageCache>({})
  const overlayRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const overlay = document.createElement('img')
    overlay.style.cssText = `
      position: fixed;
      pointer-events: none;
      z-index: 9999;
      max-width: 400px;
      max-height: 400px;
      object-fit: contain;
      display: none;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      border-radius: 4px;
    `
    document.body.appendChild(overlay)
    overlayRef.current = overlay

    return () => {
      overlay.remove()
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) {
      console.log('[BioRenderer] containerRef is null')
      return
    }

    const links = containerRef.current.querySelectorAll('a')
    console.log('[BioRenderer] Found', links.length, 'links in container')
    const cleanupFunctions: (() => void)[] = []

    links.forEach((link) => {
      const href = link.getAttribute('href')
      console.log('[BioRenderer] Link href:', href, 'text:', link.textContent)
      if (!href) return

      const slug = extractSlugFromHref(href)
      console.log('[BioRenderer] Extracted slug:', slug, 'from href:', href)
      if (!slug) return

      link.classList.add('artwork-preview-link')

      const handleMouseEnter = async () => {
        if (!overlayRef.current) return

        let imageUrl = imageCache[slug]
        if (imageUrl === undefined) {
          imageUrl = await fetchArtworkImage(slug)
          setImageCache((prev) => ({ ...prev, [slug]: imageUrl }))
        }

        if (imageUrl && overlayRef.current) {
          overlayRef.current.src = imageUrl
          overlayRef.current.style.display = 'block'
        }
      }

      const handleMouseLeave = () => {
        if (overlayRef.current) {
          overlayRef.current.style.display = 'none'
        }
      }

      const handleMouseMove = (e: MouseEvent) => {
        if (!overlayRef.current) return

        const offsetX = 20
        const offsetY = 20
        const imgWidth = overlayRef.current.naturalWidth || 400
        const imgHeight = overlayRef.current.naturalHeight || 400
        const maxWidth = Math.min(imgWidth, 400)
        const maxHeight = Math.min(imgHeight, 400)

        let x = e.clientX + offsetX
        let y = e.clientY + offsetY

        if (x + maxWidth > window.innerWidth) {
          x = e.clientX - maxWidth - offsetX
        }
        if (y + maxHeight > window.innerHeight) {
          y = e.clientY - maxHeight - offsetY
        }

        overlayRef.current.style.left = `${x}px`
        overlayRef.current.style.top = `${y}px`
      }

      link.addEventListener('mouseenter', handleMouseEnter)
      link.addEventListener('mouseleave', handleMouseLeave)
      link.addEventListener('mousemove', handleMouseMove)

      cleanupFunctions.push(() => {
        link.removeEventListener('mouseenter', handleMouseEnter)
        link.removeEventListener('mouseleave', handleMouseLeave)
        link.removeEventListener('mousemove', handleMouseMove)
      })
    })

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [content, imageCache])

  if (!content) {
    return (
      <div className="text-gray-500 italic">
        Bio content not available
      </div>
    )
  }

  try {
    const htmlContent = tiptapToHTML(content)

    if (!htmlContent) {
      return (
        <div className="text-gray-500 italic">
          No content to display
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className="bio prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    )
  } catch (error) {
    console.error('Error rendering bio content:', error)
    return (
      <div className="text-gray-500 italic">
        Error rendering bio content. Using fallback.
      </div>
    )
  }
}
