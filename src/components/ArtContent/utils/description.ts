import type { Artwork } from '@/types/artwork'

type ArtworkDescription = Artwork['description']

/**
 * Extracts plain text from the rich description stored in Supabase. Handles
 * both legacy string descriptions and the new Tiptap JSON structure that lives
 * in the `description` column.
 */
export function extractDescriptionText(description: ArtworkDescription): string {
  if (!description) {
    return ''
  }

  if (typeof description === 'string') {
    return description
  }

  if (typeof description !== 'object') {
    return ''
  }

  const nodes = Array.isArray((description as any).content)
    ? ((description as any).content as any[])
    : []

  const collectText = (content: any[]): string =>
    content
      .map((node) => {
        if (!node) return ''

        if (typeof node.text === 'string') {
          return node.text
        }

        if (Array.isArray(node.content)) {
          return collectText(node.content)
        }

        return ''
      })
      .filter(Boolean)
      .join('\n')

  return collectText(nodes).trim()
}
