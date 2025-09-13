import { Artwork } from '@/types/artwork'
import { addHours, format } from 'date-fns'

export function getMintedOn(artwork: Artwork): string {
  // Simplified minted-on logic using Supabase mint_date field
  if (!artwork.mint_date) {
    return ''
  }

  try {
    return format(addHours(new Date(artwork.mint_date), 3), 'd LLLL, yyyy')
  } catch (error) {
    console.error('Error formatting mint date:', error)
    return ''
  }
}
