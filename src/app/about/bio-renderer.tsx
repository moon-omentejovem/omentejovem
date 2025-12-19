// Simple fallback renderer for TipTap content that works on server
interface BioRendererProps {
  content: any
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
          const previewImage = mark.attrs['data-preview-image'] ? ` data-preview-image="${mark.attrs['data-preview-image']}"` : ''
          text = `<a href="${mark.attrs.href}" class="bio-link text-orange-400 underline hover:text-orange-300"${previewImage}>${text}</a>`
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

export function BioRenderer({ content }: BioRendererProps) {
  if (!content) {
    return (
      <div className="text-gray-500 italic">
        Bio content not available
      </div>
    )
  }

  try {
    // Use our simple TipTap to HTML converter
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
