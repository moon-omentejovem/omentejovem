import { supabaseAdmin } from '@/lib/supabase-admin'
import { CreateSeriesSchema } from '@/types/schemas'
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/series - List all series
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('series')
      .select(
        `
        *,
        series_artworks(
          artworks(*)
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
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

    return NextResponse.json(series, { status: 201 })
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
