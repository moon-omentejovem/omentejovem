import { ArtworkService } from '@/services'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    console.log('[API] Fetching artwork image for slug:', slug)
    
    const artwork = await ArtworkService.getBySlug(slug)

    if (!artwork) {
      console.log('[API] Artwork not found for slug:', slug)
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }

    const imageUrl = artwork.imageoptimizedurl || artwork.imageurl || null
    console.log('[API] Found imageUrl:', imageUrl)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('[API] Error fetching artwork image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
