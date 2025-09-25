import { supabaseAdmin } from '@/lib/supabase-admin'
import { CreateArtworkSchema } from '@/types/schemas'
import type { Database } from '@/types/supabase'
import { getImageUrlFromId } from '@/utils/storage'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Process artwork images to ensure URLs are valid
 */

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

    // Adiciona campo image_url resolvido para cada artwork
    const artworksWithImage = (data || []).map((artwork) => {
      const filename = artwork.image_filename

      return {
        ...artwork,
        image_url:
          artwork.id && filename
          ? getImageUrlFromId(artwork.id, filename, 'artworks', 'optimized')
          : null
    }
    })
    return NextResponse.json({ data: artworksWithImage, total: count })
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return NextResponse.json({
      data: [],
      total: 0
    })
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

    // Adiciona campo image_url resolvido
    const filename = artwork.image_filename
    const artworkWithImage = {
      ...artwork,
      image_url:
        artwork.id && filename
          ? getImageUrlFromId(artwork.id, filename, 'artworks', 'optimized')
          : null
    }
    return NextResponse.json(artworkWithImage, { status: 201 })
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
