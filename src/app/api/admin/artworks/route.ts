import { supabaseAdmin } from '@/lib/supabase-admin'
import { CreateArtworkSchema } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { getPublicUrl } from '@/utils/storage'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Process artwork images to ensure URLs are valid
 */
function processArtworkImages(artwork: any): any {
  return {
    ...artwork,
    // Use existing URLs if available, fallback to generating from paths
    image_url:
      artwork.image_url ||
      (artwork.image_path ? getPublicUrl(artwork.image_path) : null),
    // Process raw image URL
    raw_image_url:
      artwork.raw_image_url ||
      (artwork.raw_image_path ? getPublicUrl(artwork.raw_image_path) : null),
    // Ensure paths are preserved for potential client-side use
    image_path: artwork.image_path,
    raw_image_path: artwork.raw_image_path
  }
}

// GET /api/admin/artworks - List artworks with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('artworks')
      .select(
        `
        *,
        series_artworks(
          series(*)
        )
      `,
        { count: 'exact' }
      )
      .order('posted_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, count, error } = await query.range(from, to)

    if (error) throw error

    // Process images to ensure URLs are valid
    const processedData = data ? data.map(processArtworkImages) : []

    return NextResponse.json({ data: processedData, total: count })
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    )
  }
}

// POST /api/admin/artworks - Create new artwork
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = CreateArtworkSchema.parse(body)

    // Insert artwork
    const { data: artwork, error } = await supabaseAdmin
      .from('artworks')
      .insert({
        ...validatedData,
        posted_at: validatedData.posted_at || new Date().toISOString()
      } as Database['public']['Tables']['artworks']['Insert'])
      .select()
      .single()

    if (error) throw error

    // Handle series relationships if provided
    if (body.series && body.series.length > 0) {
      const seriesRelations = body.series.map((seriesId: string) => ({
        series_id: seriesId,
        artwork_id: artwork.id
      }))

      const { error: relationError } = await supabaseAdmin
        .from('series_artworks')
        .insert(seriesRelations)

      if (relationError) throw relationError
    }

    // Revalidate cache
    revalidateTag('artworks')
    revalidateTag('featured-artworks')
    revalidateTag('portfolio')

    return NextResponse.json(artwork, { status: 201 })
  } catch (error) {
    console.error('Error creating artwork:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    )
  }
}
