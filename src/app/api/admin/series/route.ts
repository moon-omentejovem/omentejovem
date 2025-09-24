import { supabaseAdmin } from '@/lib/supabase-admin'
import { CreateSeriesSchema } from '@/types/schemas'
import { getImageUrlFromId, getImageUrlFromSlugCompat } from '@/utils/storage'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/series - List series with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const from = (page - 1) * limit
    const to = from + limit - 1
    const status = searchParams.get('status')

    let query = supabaseAdmin
      .from('series')
      .select(
        `
        *,
        series_artworks(
          artworks(*)
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, count, error } = await query.range(from, to)

    if (error) throw error

    // Adiciona campo image_url resolvido para cada série
    const seriesWithImage = (data || []).map((series) => ({
      ...series,
      image_url: series.slug
        ? getImageUrlFromId(series.slug.id, series.slug.filename || series.slug.slug, 'series', 'optimized')
        : null
    }))
    return NextResponse.json({ data: seriesWithImage, total: count })
  } catch (error) {
    console.error('Error fetching series:', error)
    return NextResponse.json(
      { error: 'Failed to fetch series' },
      { status: 500 }
    )
  }
}

// POST /api/admin/series - Create new series
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = CreateSeriesSchema.parse(body)

    // Insert series
    const { data: series, error } = await supabaseAdmin
      .from('series')
      .insert(validatedData)
      .select()
      .single()

    if (error) throw error

    // Handle artwork relationships if provided
    if (body.artworks && body.artworks.length > 0) {
      const artworkRelations = body.artworks.map((artworkId: string) => ({
        series_id: series.id,
        artwork_id: artworkId
      }))

      const { error: relationError } = await supabaseAdmin
        .from('series_artworks')
        .insert(artworkRelations)

      if (relationError) throw relationError
    }

    // Revalidate cache
    revalidateTag('series')

    // Adiciona campo image_url resolvido
    const seriesWithImage = {
      ...series,
      image_url: series.slug
        ? getImageUrlFromId(series.slug.id, series.slug.filename || series.slug.slug, 'series', 'optimized')
        : null
    }
    return NextResponse.json(seriesWithImage, { status: 201 })
  } catch (error) {
    console.error('Error creating series:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create series' },
      { status: 500 }
    )
  }
}
